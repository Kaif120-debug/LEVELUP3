import { onRequestPost as createSubPost, onRequestOptions as createSubOptions } from "./functions/api/payment/create-subscription";
import { onRequestPost as verifySubPost, onRequestOptions as verifySubOptions } from "./functions/api/payment/verify-subscription";
import { onRequestPost as webhookPost } from "./functions/api/payment/razorpay-webhook";
import { onRequestPost as upgradePost, onRequestOptions as upgradeOptions } from "./functions/api/subscription/upgrade";
import { onRequestPost as cancelPost, onRequestOptions as cancelOptions } from "./functions/api/subscription/cancel";
import { onRequestGet as healthGet } from "./functions/api/health";

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = (url.pathname.replace(/\/+$/, "").toLowerCase()) || "/";
    const method = request.method.toUpperCase();

    console.log(`[Cloudflare Worker] ${method} ${pathname}`);

    // CORS preflight handling
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-razorpay-signature",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const context = { request, env, ctx, params: {} };

    // 1. Health check
    if (pathname === "/api/health") {
      return healthGet();
    }

    // 2. Razorpay Subscription Creation routes (supports both /payment/ and /payments/)
    if (
      pathname === "/api/payment/create-subscription" ||
      pathname === "/api/payments/create-subscription"
    ) {
      if (method === "POST") {
        return createSubPost(context);
      }
      return new Response(
        JSON.stringify({ error: `Method ${method} not allowed on ${pathname}. Expected POST.` }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Allow: "POST, OPTIONS",
          },
        }
      );
    }

    // 3. Razorpay Subscription Verification routes (supports both /payment/ and /payments/)
    if (
      pathname === "/api/payment/verify-subscription" ||
      pathname === "/api/payments/verify-subscription"
    ) {
      if (method === "POST") {
        return verifySubPost(context);
      }
      return new Response(
        JSON.stringify({ error: `Method ${method} not allowed on ${pathname}. Expected POST.` }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Allow: "POST, OPTIONS",
          },
        }
      );
    }

    // 4. Razorpay Webhook routes
    if (
      pathname === "/api/payment/razorpay-webhook" ||
      pathname === "/api/payments/razorpay-webhook" ||
      pathname === "/api/payment/webhook"
    ) {
      if (method === "POST") {
        return webhookPost(context);
      }
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 5. Subscription direct upgrade/cancel routes
    if (pathname === "/api/subscription/upgrade") {
      if (method === "POST") {
        return upgradePost(context);
      }
    }

    if (pathname === "/api/subscription/cancel") {
      if (method === "POST") {
        return cancelPost(context);
      }
    }

    // 6. Fallback for unmatched API routes
    if (pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ error: `API endpoint ${pathname} not found` }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 7. For static asset requests when deployed as Cloudflare Pages / Workers
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
