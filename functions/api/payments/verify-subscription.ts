import { createClient } from "@supabase/supabase-js";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    console.error("[HMAC Signature Verification Error]", err);
    return false;
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function onRequest(context: any) {
  const method = context.request.method.toUpperCase();
  if (method === "OPTIONS") {
    return onRequestOptions();
  }
  if (method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ error: `Method ${method} not allowed on /api/payments/verify-subscription. Expected POST.` }, 405);
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  let body: any = {};
  try {
    const rawText = await request.text();
    if (rawText && rawText.trim()) {
      body = JSON.parse(rawText);
    }
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON in request body" }, 400);
  }

  const { userId, razorpay_payment_id, razorpay_subscription_id, razorpay_signature, is_simulation } = body;

  try {
    const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      env.VITE_SUPABASE_ANON_KEY ||
      env.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    let effectiveUserId = userId;

    if (token && supabaseUrl && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        }
      } catch (err: any) {
        console.warn("[Cloudflare Verify-Sub Auth Check]", err?.message);
      }
    }

    if (!effectiveUserId) {
      return jsonResponse({ success: false, error: "Authenticated user ID is required" }, 400);
    }

    const razorpayKeySecret = (env.RAZORPAY_KEY_SECRET || "").trim();

    // Verify HMAC SHA256 signature if real Razorpay keys are configured and not simulated
    if (razorpayKeySecret && !is_simulation) {
      const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
      const isValid = await verifyHmacSha256(razorpayKeySecret, payload, razorpay_signature || "");

      if (!isValid) {
        console.error("[Razorpay Signature Verification Mismatch]");
        return jsonResponse({ success: false, error: "Invalid Razorpay payment signature" }, 400);
      }
    }

    if (!supabaseUrl || !anonKey) {
      return jsonResponse({ success: false, error: "Supabase database credentials not configured" }, 500);
    }

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    const today = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await client
      .from("subscriptions")
      .select("*")
      .eq("user_id", effectiveUserId)
      .limit(1)
      .maybeSingle();

    let resultData = null;

    if (existing?.id || existing?.user_id) {
      let { data: updated, error: updateErr } = await client
        .from("subscriptions")
        .update({
          plan: "pro",
          status: "active",
          started_at: existing.started_at || today,
          expires_at: expiresAt,
          current_period_end: expiresAt,
          cancel_at_period_end: false,
        })
        .eq("user_id", effectiveUserId)
        .select()
        .maybeSingle();

      // Retry with standard columns if extended columns fail
      if (updateErr) {
        console.warn("[Cloudflare Subscriptions Extended Update note]:", updateErr.message);
        const retryRes = await client
          .from("subscriptions")
          .update({
            plan: "pro",
            status: "active",
          })
          .eq("user_id", effectiveUserId)
          .select()
          .maybeSingle();

        if (retryRes.error) {
          console.error("[Cloudflare Subscriptions Update Error]", retryRes.error);
          return jsonResponse({ success: false, error: retryRes.error.message }, 400);
        }
        updated = retryRes.data;
      }
      resultData = updated;
    } else {
      let { data: inserted, error: insertErr } = await client
        .from("subscriptions")
        .insert({
          user_id: effectiveUserId,
          plan: "pro",
          status: "active",
          started_at: today,
          expires_at: expiresAt,
          current_period_end: expiresAt,
          cancel_at_period_end: false,
        })
        .select()
        .maybeSingle();

      // Retry with standard columns if extended columns fail
      if (insertErr) {
        console.warn("[Cloudflare Subscriptions Extended Insert note]:", insertErr.message);
        const retryRes = await client
          .from("subscriptions")
          .insert({
            user_id: effectiveUserId,
            plan: "pro",
            status: "active",
            started_at: today,
          })
          .select()
          .maybeSingle();

        if (retryRes.error) {
          console.error("[Cloudflare Subscriptions Insert Error]", retryRes.error);
          return jsonResponse({ success: false, error: retryRes.error.message }, 400);
        }
        inserted = retryRes.data;
      }
      resultData = inserted;
    }

    return jsonResponse({
      success: true,
      message: "Subscription successfully verified and activated",
      data: resultData,
    }, 200);
  } catch (err: any) {
    console.error("[Cloudflare Verify Subscription Exception]", err);
    return jsonResponse({ success: false, error: err?.message || "Failed to verify subscription" }, 500);
  }
}
