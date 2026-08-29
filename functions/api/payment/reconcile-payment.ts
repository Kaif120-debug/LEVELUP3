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
  return jsonResponse({ error: `Method ${method} not allowed. Expected POST.` }, 405);
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

  const { userId, email, paymentId, subscriptionId } = body;

  try {
    const supabaseUrl = (env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || "").trim();
    const anonKey = (
      env?.SUPABASE_ANON_KEY ||
      env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      env?.VITE_SUPABASE_ANON_KEY ||
      env?.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();
    const serviceRoleKey = (env?.SUPABASE_SERVICE_ROLE_KEY || "").trim();

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

    let effectiveUserId = userId;
    let userEmail = email;

    if (token && supabaseUrl && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
          userEmail = userData.user.email || userEmail;
        }
      } catch (err: any) {
        console.warn("[Cloudflare Reconcile Auth Check]", err?.message);
      }
    }

    if (!effectiveUserId) {
      return jsonResponse({ success: false, error: "Authenticated user ID is required" }, 400);
    }

    // Resolve Supabase client
    let client: any = null;
    if (supabaseUrl) {
      if (serviceRoleKey) {
        client = createClient(supabaseUrl, serviceRoleKey);
      } else if (anonKey) {
        client = createClient(supabaseUrl, anonKey, {
          global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        });
      }
    }

    // 1. Check existing subscription in Supabase
    if (client) {
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
          success: true,
          reconciled: false,
          alreadyActive: true,
          message: "Subscription is already active in database",
          data: existingSub,
        });
      }
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return jsonResponse({ success: false, error: "Razorpay credentials not configured" }, 500);
    }

    const authHeaderBasic = "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    let matchedPayment: any = null;
    let matchedSubscriptionId: string = subscriptionId || "";

    if (paymentId) {
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { Authorization: authHeaderBasic },
      });
      if (rzpRes.ok) {
        const payData: any = await rzpRes.json();
        if (payData && (payData.status === "captured" || payData.status === "authorized")) {
          matchedPayment = payData;
          matchedSubscriptionId = payData.subscription_id || matchedSubscriptionId;
        }
      }
    }

    if (!matchedPayment) {
      const rzpPaymentsRes = await fetch("https://api.razorpay.com/v1/payments?count=50", {
        headers: { Authorization: authHeaderBasic },
      });
      if (rzpPaymentsRes.ok) {
        const paymentsList: any = await rzpPaymentsRes.json();
        if (paymentsList?.items && Array.isArray(paymentsList.items)) {
          const targetEmail = (userEmail || "").trim().toLowerCase();
          matchedPayment = paymentsList.items.find((p: any) => {
            if (p.status !== "captured" && p.status !== "authorized") return false;
            const payEmail = (p.email || p.notes?.email || "").trim().toLowerCase();
            const payUserId = p.notes?.user_id || p.notes?.userId;
            const matchesUser = payUserId && payUserId === effectiveUserId;
            const matchesEmail = targetEmail && payEmail === targetEmail;
            return matchesUser || matchesEmail;
          });
          if (matchedPayment?.subscription_id) {
            matchedSubscriptionId = matchedPayment.subscription_id;
          }
        }
      }
    }

    if (!matchedPayment && !matchedSubscriptionId) {
      const rzpSubsRes = await fetch("https://api.razorpay.com/v1/subscriptions?count=50", {
        headers: { Authorization: authHeaderBasic },
      });
      if (rzpSubsRes.ok) {
        const subsList: any = await rzpSubsRes.json();
        if (subsList?.items && Array.isArray(subsList.items)) {
          const targetEmail = (userEmail || "").trim().toLowerCase();
          const foundSub = subsList.items.find((s: any) => {
            if (s.status !== "active" && s.status !== "authenticated" && s.status !== "completed") return false;
            const subEmail = (s.notes?.email || "").trim().toLowerCase();
            const subUserId = s.notes?.user_id || s.notes?.userId;
            return (subUserId && subUserId === effectiveUserId) || (targetEmail && subEmail === targetEmail);
          });
          if (foundSub) {
            matchedSubscriptionId = foundSub.id;
            matchedPayment = { id: `pay_rec_${foundSub.id}`, subscription_id: foundSub.id };
          }
        }
      }
    }

    if (!matchedPayment && !matchedSubscriptionId) {
      return jsonResponse({
        success: false,
        error: "No captured payment or active subscription found on Razorpay for this account.",
      }, 404);
    }

    const today = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let persistedRow: any = null;

    if (client) {
      try {
        const { data: existingRow } = await client
          .from("subscriptions")
          .select("*")
          .eq("user_id", effectiveUserId)
          .limit(1)
          .maybeSingle();

        if (existingRow?.id || existingRow?.user_id) {
          let { data: updated, error: updateErr } = await client
            .from("subscriptions")
            .update({
              plan: "pro",
              plan_tier: "pro",
              status: "active",
              started_at: existingRow.started_at || today,
              expires_at: expiresAt,
              current_period_end: expiresAt,
              cancel_at_period_end: false,
              razorpay_subscription_id: matchedSubscriptionId || undefined,
              razorpay_payment_id: matchedPayment?.id || undefined,
              updated_at: today,
            })
            .eq("user_id", effectiveUserId)
            .select()
            .maybeSingle();

          if (updateErr) {
            const retryRes = await client
              .from("subscriptions")
              .update({ plan: "pro", status: "active" })
              .eq("user_id", effectiveUserId)
              .select()
              .maybeSingle();
            if (!retryRes.error && retryRes.data) updated = retryRes.data;
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
              razorpay_subscription_id: matchedSubscriptionId || undefined,
              razorpay_payment_id: matchedPayment?.id || undefined,
              created_at: today,
              updated_at: today,
            })
            .select()
            .maybeSingle();

          if (insertErr) {
            const retryRes = await client
              .from("subscriptions")
              .insert({ user_id: effectiveUserId, plan: "pro", status: "active", started_at: today })
              .select()
              .maybeSingle();
            if (!retryRes.error && retryRes.data) inserted = retryRes.data;
          }
          persistedRow = inserted;
        }

        try {
          await client.from("profiles").update({ is_pro: true, plan: "pro", updated_at: today }).eq("user_id", effectiveUserId);
        } catch {}
      } catch (dbErr: any) {
        console.warn("[Cloudflare Reconcile DB Exception]", dbErr?.message);
      }
    }

    const verifiedSubscriptionData = {
      id: persistedRow?.id || `sub_${Date.now()}`,
      user_id: effectiveUserId,
      plan: "pro",
      plan_tier: "pro",
      status: "active",
      started_at: persistedRow?.started_at || today,
      expires_at: persistedRow?.expires_at || expiresAt,
      current_period_end: persistedRow?.current_period_end || expiresAt,
      cancel_at_period_end: false,
      razorpay_subscription_id: matchedSubscriptionId,
      razorpay_payment_id: matchedPayment?.id,
      created_at: persistedRow?.created_at || today,
      updated_at: today,
    };

    return jsonResponse({
      success: true,
      reconciled: true,
      message: "Captured payment reconciled successfully. LEVELUP Pro is now active.",
      data: verifiedSubscriptionData,
    });
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || "Failed to reconcile payment" }, 500);
  }
}
