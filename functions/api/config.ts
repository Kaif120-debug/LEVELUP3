// Serverless/Worker function to expose public frontend configuration
// Only returns safe, public client configuration (e.g. Supabase URL and Anon Key)
// Never exposes server secrets (RAZORPAY_KEY_SECRET, SUPABASE_SERVICE_ROLE_KEY, etc.)

export async function onRequestGet(context: { env: any }): Promise<Response> {
  const env = context.env || {};
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
  const supabaseAnonKey = (
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  return new Response(
    JSON.stringify({
      supabaseUrl,
      supabaseAnonKey,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    }
  );
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
