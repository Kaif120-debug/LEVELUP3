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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  const { plan = "pro", status = "active", userId } = body;
  const targetPlan = plan === "LEVELUP_PRO" || plan === "pro" ? "pro" : "free";

  try {
    const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      env.VITE_SUPABASE_ANON_KEY ||
      env.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    if (!supabaseUrl) {
      return jsonResponse({ success: false, error: "Supabase URL is not configured" }, 400);
    }

    let effectiveUserId = userId;

    if (token && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData, error: userErr } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        } else if (userErr) {
          return jsonResponse({ success: false, error: `Authentication failed: ${userErr.message}` }, 401);
        }
      } catch (err: any) {
        console.warn("[Cloudflare Sub Upgrade Auth Check]", err?.message);
      }
    }

    if (!effectiveUserId) {
      return jsonResponse({ success: false, error: "Authenticated user ID is required" }, 400);
    }

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    const { data: existing } = await client
      .from("subscriptions")
      .select("*")
      .eq("user_id", effectiveUserId)
      .limit(1)
      .maybeSingle();

    if (existing?.id || existing?.user_id) {
      const { data: updated, error: updErr } = await client
        .from("subscriptions")
        .update({
          plan: targetPlan,
          status,
        })
        .eq("user_id", effectiveUserId)
        .select()
        .maybeSingle();

      if (updErr) {
        return jsonResponse({ success: false, error: updErr.message }, 400);
      }

      return jsonResponse({ success: true, data: updated, isNew: false }, 200);
    } else {
      const { data: inserted, error: insErr } = await client
        .from("subscriptions")
        .insert({
          user_id: effectiveUserId,
          plan: targetPlan,
          status,
          started_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (insErr) {
        return jsonResponse({ success: false, error: insErr.message }, 400);
      }

      return jsonResponse({ success: true, data: inserted, isNew: true }, 200);
    }
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || "Internal server error" }, 500);
  }
}
