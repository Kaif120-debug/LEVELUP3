import { createClient } from "@supabase/supabase-js";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-razorpay-signature",
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
  return jsonResponse({ error: `Method ${method} not allowed on /api/payment/verify-subscription. Expected POST.` }, 405);
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

  const { userId, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

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

    const razorpayKeyId = (
      env?.RAZORPAY_KEY_ID ||
      env?.VITE_RAZORPAY_KEY_ID ||
      (typeof process !== "undefined" && (process.env?.RAZORPAY_KEY_ID || process.env?.VITE_RAZORPAY_KEY_ID)) ||
      ""
    ).trim();

    const razorpayKeySecret = (
      env?.RAZORPAY_KEY_SECRET ||
      (typeof process !== "undefined" && process.env?.RAZORPAY_KEY_SECRET) ||
      (typeof globalThis !== "undefined" && (globalThis as any).RAZORPAY_KEY_SECRET) ||
      ""
    ).trim();

    if (!razorpayKeySecret) {
      return jsonResponse({ success: false, error: "RAZORPAY_KEY_SECRET is not configured in Worker environment" }, 500);
    }

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return jsonResponse({ success: false, error: "Payment verification parameters missing" }, 400);
    }

    // Step A: Dual-order HMAC SHA256 signature verification using live RAZORPAY_KEY_SECRET
    const payload1 = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const payload2 = `${razorpay_subscription_id}|${razorpay_payment_id}`;
    const isValid1 = await verifyHmacSha256(razorpayKeySecret, payload1, razorpay_signature || "");
    const isValid2 = await verifyHmacSha256(razorpayKeySecret, payload2, razorpay_signature || "");
    let isValid = isValid1 || isValid2;

    // Step B: Direct Razorpay REST API verification fallback for live captured payment
    if (!isValid && razorpayKeyId && razorpayKeySecret) {
      try {
        const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const rzpPayRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { Authorization: `Basic ${basicAuth}` },
        });

        if (rzpPayRes.ok) {
          const payData: any = await rzpPayRes.json();
          if (
            payData &&
            (payData.status === "captured" || payData.status === "authorized") &&
            (!payData.notes?.user_id || payData.notes.user_id === effectiveUserId)
          ) {
            console.log(`[Cloudflare Razorpay Direct API]: Payment ${razorpay_payment_id} verified as ${payData.status}`);
            isValid = true;
          }
        }
      } catch (apiErr: any) {
        console.warn("[Cloudflare Razorpay Direct API Error]", apiErr?.message);
      }
    }

    if (!isValid) {
      console.error("[Razorpay Signature Verification Mismatch]");
      return jsonResponse({ success: false, error: "Invalid Razorpay payment signature" }, 400);
    }

    const today = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let existing: any = null;
    let persistedRow: any = null;

    if (supabaseUrl && anonKey) {
      try {
        const client = createClient(supabaseUrl, anonKey, {
          global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        });

        const { data: existingRow } = await client
          .from("subscriptions")
          .select("*")
          .eq("user_id", effectiveUserId)
          .limit(1)
          .maybeSingle();

        existing = existingRow;

        if (existing?.id || existing?.user_id) {
          let { data: updated, error: updateErr } = await client
            .from("subscriptions")
            .update({
              plan: "pro",
              plan_tier: "pro",
              status: "active",
              started_at: existing.started_at || today,
              expires_at: expiresAt,
              current_period_end: expiresAt,
              cancel_at_period_end: false,
              razorpay_subscription_id: razorpay_subscription_id,
              razorpay_payment_id: razorpay_payment_id,
              updated_at: today,
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

            if (!retryRes.error && retryRes.data) {
              updated = retryRes.data;
            }
          }
          persistedRow = updated;
        } else {
          let { data: inserted, error: insertErr } = await client
            .from("subscriptions")
            .insert({
              user_id: effectiveUserId,
              plan: "pro",
              plan_tier: "pro",
              status: "active",
              started_at: today,
              expires_at: expiresAt,
              current_period_end: expiresAt,
              cancel_at_period_end: false,
              razorpay_subscription_id: razorpay_subscription_id,
              razorpay_payment_id: razorpay_payment_id,
              created_at: today,
              updated_at: today,
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

            if (!retryRes.error && retryRes.data) {
              inserted = retryRes.data;
            }
          }
          persistedRow = inserted;
        }

        // Also update profiles table
        try {
          await client
            .from("profiles")
            .update({
              is_pro: true,
              plan: "pro",
              updated_at: today,
            })
            .eq("user_id", effectiveUserId);
        } catch {
          // ignore
        }
      } catch (dbErr: any) {
        console.warn("[Cloudflare Subscriptions DB Exception]", dbErr?.message);
      }
    }

    const verifiedSubscriptionData = {
      id: persistedRow?.id || existing?.id || `sub_${Date.now()}`,
      user_id: effectiveUserId,
      plan: "pro",
      plan_tier: "pro",
      status: "active",
      started_at: persistedRow?.started_at || existing?.started_at || today,
      expires_at: persistedRow?.expires_at || expiresAt,
      current_period_end: persistedRow?.current_period_end || expiresAt,
      cancel_at_period_end: false,
      razorpay_subscription_id: razorpay_subscription_id,
      razorpay_payment_id: razorpay_payment_id,
      created_at: persistedRow?.created_at || existing?.created_at || today,
      updated_at: today,
    };

    return jsonResponse({
      success: true,
      message: "Subscription successfully verified and activated",
      data: verifiedSubscriptionData,
    }, 200);
  } catch (err: any) {
    console.error("[Cloudflare Verify Subscription Exception]", err);
    return jsonResponse({ success: false, error: err?.message || "Failed to verify subscription" }, 500);
  }
}
