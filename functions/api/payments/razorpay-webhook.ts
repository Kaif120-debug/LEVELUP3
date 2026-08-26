import { createClient } from "@supabase/supabase-js";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function verifyHmacSha256(secret: string, message: string, expectedHex: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    const hex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex.toLowerCase() === expectedHex.toLowerCase();
  } catch (err) {
    console.error("[Webhook HMAC Error]", err);
    return false;
  }
}

export async function onRequest(context: any) {
  const method = context.request.method.toUpperCase();
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }
  if (method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ status: "ok" }, 200);
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const rawPayload = await request.text();
    const webhookSecret = (env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET || "").trim();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (webhookSecret && signature) {
      const isValid = await verifyHmacSha256(webhookSecret, rawPayload, signature);
      if (!isValid) {
        return jsonResponse({ error: "Invalid webhook signature" }, 400);
      }
    }

    let parsedBody: any = {};
    try {
      if (rawPayload) {
        parsedBody = JSON.parse(rawPayload);
      }
    } catch {
      return jsonResponse({ error: "Invalid webhook body JSON" }, 400);
    }

    const { event, payload } = parsedBody;
    const subEntity = payload?.subscription?.entity || payload?.payment?.entity;
    const userId = subEntity?.notes?.user_id;

    const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
    const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();

    if (userId && supabaseUrl && serviceKey) {
      const client = createClient(supabaseUrl, serviceKey);

      if (event === "subscription.activated" || event === "subscription.charged" || event === "payment.captured") {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await client
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan: "pro",
            status: "active",
            expires_at: expiresAt,
            current_period_end: expiresAt,
          });
      } else if (event === "subscription.cancelled" || event === "subscription.halted" || event === "subscription.completed") {
        await client
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", userId);
      } else if (event === "subscription.pending" || event === "subscription.paused") {
        await client
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", userId);
      }
    }

    return jsonResponse({ status: "ok" }, 200);
  } catch (err: any) {
    console.error("[Webhook Error]", err);
    return jsonResponse({ error: err?.message || "Webhook processing failed" }, 500);
  }
}
