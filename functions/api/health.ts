export async function onRequest() {
  return onRequestGet();
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ status: "ok", service: "LEVELUP API Cloudflare Edge" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
