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
  return jsonResponse({ error: `Method ${method} not allowed on /api/payments/create-subscription. Expected POST.` }, 405);
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
  } catch (parseErr: any) {
    return jsonResponse({ success: false, error: "Invalid JSON in request body" }, 400);
  }

  const { userId, email, name } = body;

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
    let userEmail = email;

    // Verify token with Supabase Auth
    if (token && supabaseUrl && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
          userEmail = userData.user.email || userEmail;
        }
      } catch (err: any) {
        console.warn("[Cloudflare Create-Sub Auth Check]", err?.message);
      }
    }

    if (!effectiveUserId) {
      return jsonResponse({ success: false, error: "Authentication required to create subscription" }, 400);
    }

    // Check if user already has an active subscription
    if (supabaseUrl && anonKey) {
      try {
        const client = createClient(supabaseUrl, anonKey, {
          global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        });

        const { data: existingSub } = await client
          .from("subscriptions")
          .select("*")
          .eq("user_id", effectiveUserId)
          .limit(1)
          .maybeSingle();

        if (
          existingSub &&
          (existingSub.status === "active" || existingSub.status === "trial") &&
          (existingSub.plan === "pro" || existingSub.plan_tier === "pro" || existingSub.plan === "LEVELUP_PRO")
        ) {
          return jsonResponse({
            success: false,
            error: "You already have an active LEVELUP PRO subscription.",
            isAlreadySubscribed: true,
          }, 400);
        }
      } catch (checkErr: any) {
        console.warn("[Cloudflare Existing Subscription Check]", checkErr?.message);
      }
    }

    const razorpayKeyId = (
      env?.RAZORPAY_KEY_ID ||
      (typeof process !== "undefined" && process.env?.RAZORPAY_KEY_ID) ||
      (typeof globalThis !== "undefined" && (globalThis as any).RAZORPAY_KEY_ID) ||
      ""
    ).trim();
    const razorpayKeySecret = (
      env?.RAZORPAY_KEY_SECRET ||
      (typeof process !== "undefined" && process.env?.RAZORPAY_KEY_SECRET) ||
      (typeof globalThis !== "undefined" && (globalThis as any).RAZORPAY_KEY_SECRET) ||
      ""
    ).trim();
    const razorpayPlanId = (
      env?.RAZORPAY_PLAN_ID ||
      (typeof process !== "undefined" && process.env?.RAZORPAY_PLAN_ID) ||
      (typeof globalThis !== "undefined" && (globalThis as any).RAZORPAY_PLAN_ID) ||
      ""
    ).trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      return jsonResponse({
        success: false,
        error: "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in Worker environment variables.",
      }, 500);
    }

    if (!razorpayPlanId) {
      return jsonResponse({
        success: false,
        error: "RAZORPAY_PLAN_ID is not configured in Cloudflare environment variables.",
      }, 500);
    }

    const authHeaderBasic = "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // Razorpay monthly recurring subscription:
    // `total_count: 120` represents 120 monthly billing cycles (10 years, Razorpay's supported maximum).
    // Razorpay automatically computes the valid end date and handles monthly auto-recurring debits (UPI Autopay, Cards, Net Banking).
    // We do not send `end_at` or `expire_by` so Razorpay applies valid defaults without timestamp validation errors.
    const subPayload = {
      plan_id: razorpayPlanId,
      total_count: 120, // 10 years (120 monthly billing cycles)
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: effectiveUserId,
        email: userEmail || "",
        name: name || "",
      },
    };

    const rzpSubRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeaderBasic,
      },
      body: JSON.stringify(subPayload),
    });

    const rzpRawText = await rzpSubRes.text();
    let rzpSubData: any = null;
    try {
      if (rzpRawText) {
        rzpSubData = JSON.parse(rzpRawText);
      }
    } catch {
      rzpSubData = null;
    }

    if (!rzpSubRes.ok || !rzpSubData?.id) {
      console.error("[Cloudflare Razorpay Subscription Error]", rzpSubData || rzpRawText);
      const detailedErr = rzpSubData?.error?.description || (typeof rzpSubData?.error === 'string' ? rzpSubData.error : '') || rzpRawText || "Failed to create Razorpay subscription on gateway";
      return jsonResponse({
        success: false,
        error: detailedErr,
        razorpay_error: rzpSubData?.error,
      }, rzpSubRes.status || 400);
    }

    return jsonResponse({
      success: true,
      subscription_id: rzpSubData.id,
      key_id: razorpayKeyId,
      plan_id: razorpayPlanId,
      currency: "INR",
      name: "LEVELUP",
      description: "LEVELUP PRO Subscription (₹129/month)",
    }, 200);
  } catch (err: any) {
    console.error("[Cloudflare Create Subscription Exception]", err);
    return jsonResponse({
      success: false,
      error: err?.message || "Failed to initiate subscription session",
    }, 500);
  }
}
