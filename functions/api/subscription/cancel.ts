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

  const { userId } = body;

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
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        }
      } catch (err: any) {
        console.warn("[Cloudflare Sub Cancel Auth Check]", err?.message);
      }
    }

    if (!effectiveUserId) {
      return jsonResponse({ success: false, error: "Authenticated user ID is required" }, 400);
    }

    function formatSupabaseUrl(raw: string): string {
      if (!raw) return "";
      let clean = raw.trim();
      const dashboardMatch = clean.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
      if (dashboardMatch && dashboardMatch[1]) {
        return `https://${dashboardMatch[1]}.supabase.co`;
      }
      return clean.replace(/\/+$/, '');
    }

    const cleanUrl = formatSupabaseUrl(supabaseUrl);
    const client = createClient(cleanUrl, anonKey, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    const candidateStatuses = ["cancelled", "inactive", "canceled"];
    let lastError: any = null;
    let cancelSucceeded = false;

    for (const testStatus of candidateStatuses) {
      const { error: cancelErr } = await client
        .from("subscriptions")
        .update({
          plan: "free",
          status: testStatus,
        })
        .eq("user_id", effectiveUserId);

      if (!cancelErr) {
        cancelSucceeded = true;
        break;
      }
      lastError = cancelErr;
      if (cancelErr.code !== "23514") {
        break;
      }
    }

    if (!cancelSucceeded && lastError) {
      return jsonResponse({ success: false, error: lastError.message }, 400);
    }

    return jsonResponse({ success: true, message: "Subscription cancelled" }, 200);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || "Internal server error" }, 500);
  }
}
