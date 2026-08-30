import { onRequestPost as createSubPost, onRequestOptions as createSubOptions } from "./functions/api/payment/create-subscription";
import { onRequestPost as verifySubPost, onRequestOptions as verifySubOptions } from "./functions/api/payment/verify-subscription";
import { onRequestPost as reconcilePost, onRequestOptions as reconcileOptions } from "./functions/api/payment/reconcile-payment";
import { onRequestPost as webhookPost } from "./functions/api/payment/razorpay-webhook";
import { onRequestPost as upgradePost, onRequestOptions as upgradeOptions } from "./functions/api/subscription/upgrade";
import { onRequestPost as cancelPost, onRequestOptions as cancelOptions } from "./functions/api/subscription/cancel";
import { onRequestGet as healthGet } from "./functions/api/health";
import { onRequestGet as configGet, onRequestOptions as configOptions } from "./functions/api/config";
import { onRequestPost as generatePlanPost, onRequestOptions as generatePlanOptions } from "./functions/api/ai/workout/generate-plan";
import { onRequestPost as regenerateDayPost, onRequestOptions as regenerateDayOptions } from "./functions/api/ai/workout/regenerate-day";
import { onRequestPost as generateWorkoutPost, onRequestOptions as generateWorkoutOptions } from "./functions/api/ai/generate-workout";
import { onRequestPost as macroCalculatePost, onRequestOptions as macroCalculateOptions } from "./functions/api/ai/macro-coach/calculate";
import { onRequestPost as macroChatPost, onRequestOptions as macroChatOptions } from "./functions/api/ai/macro-coach/chat";

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

    // 1. Health check & Public configuration
    if (pathname === "/api/health" || pathname === "/health") {
      return healthGet();
    }

    if (
      pathname === "/api/config" ||
      pathname === "/config" ||
      pathname === "/api/public-config" ||
      pathname === "/public-config"
    ) {
      if (method === "OPTIONS") {
        return configOptions();
      }
      return configGet(context);
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

    // 3b. Razorpay Subscription Reconcile routes
    if (
      pathname === "/api/payment/reconcile-payment" ||
      pathname === "/api/subscription/reconcile" ||
      pathname === "/api/payment/reconcile"
    ) {
      if (method === "POST") {
        return reconcilePost(context);
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

    // 6. AI Workout Generator routes
    if (pathname === "/api/ai/workout/generate-plan") {
      if (method === "POST") {
        return generatePlanPost(context);
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

    if (pathname === "/api/ai/workout/regenerate-day") {
      if (method === "POST") {
        return regenerateDayPost(context);
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

    if (pathname === "/api/ai/generate-workout") {
      if (method === "POST") {
        return generateWorkoutPost(context);
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

    // 7. AI Macro Coach routes
    if (pathname === "/api/ai/macro-coach/calculate") {
      if (method === "POST") {
        return macroCalculatePost(context);
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

    if (pathname === "/api/ai/macro-coach/chat") {
      if (method === "POST") {
        return macroChatPost(context);
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

    // 8. Fallback for unmatched API routes
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
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && request.method === "GET" && !pathname.startsWith("/api/")) {
        const urlClone = new URL(request.url);
        urlClone.pathname = "/index.html";
        return env.ASSETS.fetch(new Request(urlClone.toString(), request));
      }
      return assetRes;
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
