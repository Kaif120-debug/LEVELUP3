// Serverless/Worker function to expose public frontend configuration
// Only returns safe, public client configuration (e.g. Supabase URL and Anon/Publishable Key)
// Never exposes server secrets (RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, etc.)

export async function onRequestGet(context: { env: any }): Promise<Response> {
  const env = context.env || {};

  // Extract public Supabase URL
  const supabaseUrl = (
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== "undefined" && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
    ""
  ).trim();

  // Extract public Supabase Anon / Publishable Key
  const supabaseAnonKey = (
    env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== "undefined" && (
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY
    )) ||
    ""
  ).trim();

  const responsePayload = {
    supabaseUrl,
    supabaseAnonKey,
    supabaseKey: supabaseAnonKey,
    configured: Boolean(supabaseUrl && supabaseAnonKey),
  };

  return new Response(
    JSON.stringify(responsePayload),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-store, no-cache, must-revalidate",
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
