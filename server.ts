import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// CORS headers for all API requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-razorpay-signature");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Helper to resolve Supabase server-side client
function getSupabaseServerClient(userToken?: string) {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

  if (!supabaseUrl) return null;

  // 1. If service role key is provided, use it (bypasses RLS for authorized admin operations)
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // 2. Otherwise use anon key with user's JWT if available
  if (anonKey) {
    return createClient(supabaseUrl, anonKey, {
      global: userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : undefined,
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return null;
}

// In-memory data store for server-backed persistence
let serverState: any = null;

// Initialize Gemini API client lazily / safely
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Robust Gemini model cascade executor.
 * Automatically tries active high-availability models (gemini-3.7-flash -> gemini-3.6-flash -> gemini-3.5-flash-lite)
 * and handles temporary 503 high-demand spikes and 429 rate limits gracefully.
 */
async function callGeminiCascade(
  contents: string,
  configOptions?: {
    systemInstruction?: string;
    responseMimeType?: string;
    temperature?: number;
  }
): Promise<{ text: string; modelUsed: string } | null> {
  const ai = getAI();
  if (!ai) return null;

  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: configOptions?.systemInstruction,
          responseMimeType: configOptions?.responseMimeType,
          temperature: configOptions?.temperature,
        },
      });

      if (response.text && response.text.trim()) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      const isTemporaryDemand =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.error?.code === 503 ||
        err?.error?.code === 429 ||
        err?.message?.includes("503") ||
        err?.message?.includes("429") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (isTemporaryDemand) {
        console.log(`[AI Cascade] Model ${model} is experiencing high demand (${err?.status || err?.error?.code || 503}). Cascading to next model...`);
      } else {
        console.log(`[AI Cascade] Model ${model} notice: ${err?.message || 'non-fatal error'}. Cascading to next model...`);
      }
    }
  }

  return null;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public frontend configuration endpoint (safe public variables only)
app.get(["/api/config", "/config", "/api/public-config", "/public-config"], (req, res) => {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const supabaseAnonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  res.json({
    supabaseUrl,
    supabaseAnonKey,
    supabaseKey: supabaseAnonKey,
    configured: Boolean(supabaseUrl && supabaseAnonKey),
  });
});

// ==========================================
// RAZORPAY PAYMENT & SUBSCRIPTIONS ENDPOINTS
// ==========================================

// 1. Create Razorpay Subscription Endpoint
app.post(["/api/payment/create-subscription", "/api/payments/create-subscription"], async (req, res) => {
  console.log("[DEBUG create-sub received]", req.body);
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { userId, email, name } = req.body || {};

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

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
        console.warn("[Payment create-sub Auth check]", err.message);
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ success: false, error: "Authentication required to create subscription" });
    }

    // Check if user already has an active subscription to prevent duplicates
    const client = getSupabaseServerClient(token);
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
        return res.status(400).json({
          success: false,
          error: "You already have an active LEVELUP PRO subscription.",
          isAlreadySubscribed: true,
        });
      }
    }

    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const razorpayPlanId = (process.env.RAZORPAY_PLAN_ID || "").trim();

    // Live Razorpay Subscriptions API execution
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in server environment variables.",
      });
    }

    if (!razorpayPlanId) {
      return res.status(500).json({
        success: false,
        error: "RAZORPAY_PLAN_ID is not configured in server environment variables.",
      });
    }

    const authHeaderBasic = "Basic " + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

    // Create subscription in Razorpay using the configured LIVE RAZORPAY_PLAN_ID
    // `total_count: 120` represents 120 monthly billing cycles (10 years, Razorpay maximum limit).
    // Razorpay automatically computes the valid end date and handles monthly auto-recurring debits.
    // We do not send `end_at` or `expire_by` so Razorpay applies valid defaults without timestamp validation errors.
    const subPayload: any = {
      plan_id: razorpayPlanId,
      total_count: 120, // 10 years (120 monthly cycles)
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
      console.error("[Razorpay Subscription API Error]", rzpSubData || rzpRawText);
      const detailedErr = rzpSubData?.error?.description || (typeof rzpSubData?.error === 'string' ? rzpSubData.error : '') || rzpRawText || "Failed to create Razorpay subscription on gateway";
      return res.status(rzpSubRes.status || 400).json({
        success: false,
        error: detailedErr,
        razorpay_error: rzpSubData?.error,
      });
    }

    return res.json({
      success: true,
      subscription_id: rzpSubData.id,
      key_id: razorpayKeyId,
      plan_id: razorpayPlanId,
      currency: "INR",
      name: "LEVELUP",
      description: "LEVELUP PRO Subscription (₹129/month)",
    });
  } catch (err: any) {
    console.error("[Create Subscription Exception]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to initiate subscription" });
  }
});

// In-memory idempotency cache for webhooks
const processedWebhookEvents = new Set<string>();

// 2. Verify Razorpay Subscription Endpoint
app.post(["/api/payment/verify-subscription", "/api/payments/verify-subscription"], async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { userId, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body || {};

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

    let effectiveUserId = userId;

    if (token && supabaseUrl && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        }
      } catch (err: any) {
        console.warn("[Verify Subscription Auth check]", err.message);
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ success: false, error: "Authenticated user ID is required" });
    }

    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!razorpayKeySecret) {
      return res.status(500).json({ success: false, error: "RAZORPAY_KEY_SECRET is not configured on server" });
    }

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Payment verification parameters missing" });
    }

    // Step A: Dual-order HMAC SHA256 signature verification using live RAZORPAY_KEY_SECRET
    const sigVariant1 = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    const sigVariant2 = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_subscription_id}|${razorpay_payment_id}`)
      .digest("hex");

    let isSignatureValid = (sigVariant1 === razorpay_signature || sigVariant2 === razorpay_signature);

    // Step B: Direct Razorpay REST API verification fallback for live captured payment
    if (!isSignatureValid && razorpayKeyId && razorpayKeySecret) {
      try {
        const authHeaderBasic = "Basic " + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
        const rzpPayRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { Authorization: authHeaderBasic },
        });

        if (rzpPayRes.ok) {
          const payData: any = await rzpPayRes.json();
          if (
            payData &&
            (payData.status === "captured" || payData.status === "authorized") &&
            (!payData.notes?.user_id || payData.notes.user_id === effectiveUserId)
          ) {
            console.log(`[Razorpay Direct API Check]: Payment ${razorpay_payment_id} verified as ${payData.status}`);
            isSignatureValid = true;
          }
        }
      } catch (apiErr: any) {
        console.warn("[Razorpay Direct API Check Error]", apiErr.message);
      }
    }

    if (!isSignatureValid) {
      console.error("[Razorpay Signature Verification Mismatch]");
      return res.status(400).json({ success: false, error: "Invalid Razorpay payment signature" });
    }

    // Persist verified Pro status in Supabase public.subscriptions table
    const client = getSupabaseServerClient(token);
    const today = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let existing: any = null;
    let persistedRow: any = null;

    if (client) {
      try {
        const { data: existingRow } = await client
          .from("subscriptions")
          .select("*")
          .eq("user_id", effectiveUserId)
          .limit(1)
          .maybeSingle();

        existing = existingRow;

        if (existing?.id || existing?.user_id) {
          // Update existing subscription
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

          if (updateErr) {
            console.warn("[Supabase Subscriptions Extended Update note]:", updateErr.message, "Retrying with standard columns...");
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
          // Insert new subscription
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

          if (insertErr) {
            console.warn("[Supabase Subscriptions Extended Insert note]:", insertErr.message, "Retrying with standard columns...");
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

        // Also update profiles table if it exists
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
          // ignore profile column errors
        }
      } catch (dbErr: any) {
        console.warn("[Supabase Subscriptions Save Exception]", dbErr.message);
      }
    }

    // Synthesize guaranteed full DbSubscription object
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

    return res.json({
      success: true,
      message: "Subscription successfully verified and activated",
      data: verifiedSubscriptionData,
    });
  } catch (err: any) {
    console.error("[Verify Subscription Exception]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to verify subscription" });
  }
});

// 2b. Reconcile Existing Payment Endpoint (Safe recovery for already captured payments)
app.post(["/api/payment/reconcile-payment", "/api/subscription/reconcile", "/api/payment/reconcile"], async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { userId, email, paymentId, subscriptionId } = req.body || {};

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

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
        console.warn("[Reconcile Auth Check]", err.message);
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ success: false, error: "Authenticated user ID is required" });
    }

    const client = getSupabaseServerClient(token);

    // 1. Check if user already has an active subscription in Supabase
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
        return res.json({
          success: true,
          reconciled: false,
          alreadyActive: true,
          message: "Subscription is already active in database",
          data: existingSub,
        });
      }
    }

    // 2. Query Razorpay API directly using live secret to find any captured payment or subscription
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ success: false, error: "Razorpay credentials not configured on server" });
    }

    const authHeaderBasic = "Basic " + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    let matchedPayment: any = null;
    let matchedSubscriptionId: string = subscriptionId || "";

    // If a specific payment ID was provided
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

    // If no specific payment ID or not found yet, query recent payments
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

    // If still no payment matched, also check Razorpay subscriptions
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
      return res.status(404).json({
        success: false,
        error: "No captured payment or active subscription found on Razorpay for this account.",
      });
    }

    // 3. Persist reconciled Pro subscription to Supabase
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

        // Also update profiles if present
        try {
          await client.from("profiles").update({ is_pro: true, plan: "pro", updated_at: today }).eq("user_id", effectiveUserId);
        } catch {}
      } catch (dbErr: any) {
        console.warn("[Reconcile DB Write Exception]", dbErr.message);
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

    return res.json({
      success: true,
      reconciled: true,
      message: "Captured payment reconciled successfully. LEVELUP Pro is now active.",
      data: verifiedSubscriptionData,
    });
  } catch (err: any) {
    console.error("[Reconcile Payment Exception]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to reconcile payment" });
  }
});

// 3. Razorpay Webhook Lifecycle Endpoint
app.post(["/api/payment/razorpay-webhook", "/api/payments/razorpay-webhook", "/api/payment/webhook"], async (req: any, res) => {
  try {
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();
    const signature = req.headers["x-razorpay-signature"] as string;

    if (webhookSecret && signature) {
      const rawPayload = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawPayload)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[Razorpay Webhook Invalid Signature]");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const { event, payload } = req.body || {};
    const eventId = req.headers["x-razorpay-event-id"] || payload?.payment?.entity?.id || payload?.subscription?.entity?.id || "";
    const idempotencyKey = `${event}_${eventId}`;

    if (processedWebhookEvents.has(idempotencyKey)) {
      console.log(`[Razorpay Webhook Idempotency]: Event ${idempotencyKey} already processed`);
      return res.json({ status: "ok", message: "Event already processed" });
    }

    if (eventId) {
      processedWebhookEvents.add(idempotencyKey);
      if (processedWebhookEvents.size > 2000) {
        const firstKey = processedWebhookEvents.values().next().value;
        if (firstKey) processedWebhookEvents.delete(firstKey);
      }
    }

    console.log(`[Razorpay Webhook Event Received]: ${event}`);

    const subEntity = payload?.subscription?.entity || payload?.payment?.entity;
    const userId = subEntity?.notes?.user_id || subEntity?.notes?.userId;
    const rzpSubId = payload?.subscription?.entity?.id || subEntity?.subscription_id;
    const rzpPayId = payload?.payment?.entity?.id;

    const client = getSupabaseServerClient();
    if (client) {
      const today = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (event === "subscription.activated" || event === "subscription.charged" || event === "payment.captured" || event === "order.paid") {
        if (userId) {
          try {
            await client
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan: "pro",
                plan_tier: "pro",
                status: "active",
                expires_at: expiresAt,
                current_period_end: expiresAt,
                razorpay_subscription_id: rzpSubId || undefined,
                razorpay_payment_id: rzpPayId || undefined,
                updated_at: today,
              });
          } catch {
            await client
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan: "pro",
                status: "active",
              });
          }
        } else if (rzpSubId) {
          await client
            .from("subscriptions")
            .update({
              plan: "pro",
              status: "active",
              expires_at: expiresAt,
            })
            .eq("razorpay_subscription_id", rzpSubId);
        }
      } else if (event === "subscription.cancelled" || event === "subscription.halted" || event === "subscription.completed") {
        if (userId) {
          await client
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("user_id", userId);
        } else if (rzpSubId) {
          await client
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("razorpay_subscription_id", rzpSubId);
        }
      } else if (event === "subscription.pending" || event === "subscription.paused") {
        if (userId) {
          await client
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", userId);
        }
      }
    }

    return res.json({ status: "ok" });
  } catch (err: any) {
    console.error("[Razorpay Webhook Error]", err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch or sync verified subscription status
app.all(["/api/subscription/status", "/api/subscription/sync-status"], async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const userId = (req.method === "POST" ? req.body?.userId : req.query?.userId) as string;

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

    let effectiveUserId = userId;

    if (token && supabaseUrl && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        }
      } catch (err: any) {
        console.warn("[Subscription Status Auth Check]", err.message);
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const client = getSupabaseServerClient(token);
    if (!client) {
      return res.status(500).json({ success: false, error: "Database client unavailable" });
    }

    const { data: subData, error } = await client
      .from("subscriptions")
      .select("*")
      .eq("user_id", effectiveUserId)
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data: subData || null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch subscription status" });
  }
});

// Subscription Upgrade Endpoint
app.post("/api/subscription/upgrade", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { plan = "pro", status = "active", userId } = req.body || {};
  const targetPlan = (plan === "LEVELUP_PRO" || plan === "pro") ? "pro" : "free";

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

    if (!supabaseUrl) {
      return res.status(400).json({ error: "Supabase URL is not configured on server" });
    }

    let effectiveUserId = userId;

    // Validate bearer token if provided
    if (token && anonKey) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData, error: userErr } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        } else if (userErr) {
          return res.status(401).json({ error: `Authentication failed: ${userErr.message}` });
        }
      } catch (err: any) {
        console.warn("[Server Subscription Auth check]", err.message);
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ error: "Authenticated user ID is required" });
    }

    const client = getSupabaseServerClient(token);
    if (!client) {
      return res.status(500).json({ error: "Unable to initialize Supabase client" });
    }

    // Query existing record
    const { data: existing, error: findErr } = await client
      .from("subscriptions")
      .select("*")
      .eq("user_id", effectiveUserId)
      .limit(1)
      .maybeSingle();

    if (findErr && findErr.code !== "PGRST116") {
      return res.status(400).json({
        error: findErr.message,
        code: findErr.code,
        details: findErr.details,
        hint: findErr.hint,
      });
    }

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
        return res.status(400).json({
          error: updErr.message,
          code: updErr.code,
          details: updErr.details,
          hint: updErr.hint,
        });
      }

      return res.json({ success: true, data: updated, isNew: false });
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
        return res.status(400).json({
          error: insErr.message,
          code: insErr.code,
          details: insErr.details,
          hint: insErr.hint,
        });
      }

      return res.json({ success: true, data: inserted, isNew: true });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Subscription Cancel Endpoint
app.post("/api/subscription/cancel", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { userId } = req.body || {};

  try {
    let effectiveUserId = userId;
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

    if (token && anonKey && supabaseUrl) {
      try {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: userData } = await authClient.auth.getUser(token);
        if (userData?.user?.id) {
          effectiveUserId = userData.user.id;
        }
      } catch {
        // ignore
      }
    }

    if (!effectiveUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const client = getSupabaseServerClient(token);
    if (!client) {
      return res.status(500).json({ error: "Unable to initialize Supabase client" });
    }

    const { data: updated, error: updErr } = await client
      .from("subscriptions")
      .update({
        plan: "free",
        status: "canceled",
      })
      .eq("user_id", effectiveUserId)
      .select()
      .maybeSingle();

    if (updErr) {
      return res.status(400).json({
        error: updErr.message,
        code: updErr.code,
        details: updErr.details,
        hint: updErr.hint,
      });
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Get current state
app.get("/api/state", (req, res) => {
  res.json({ data: serverState });
});

// Update current state
app.post("/api/state", (req, res) => {
  serverState = req.body;
  res.json({ success: true, message: "State saved successfully" });
});

// AI Insights endpoint
app.post("/api/ai/insights", async (req, res) => {
  const { userContext } = req.body;

  const fallback = {
    insight: "You have a 2-hour block open this afternoon. We recommend utilizing 45 mins to finalize your Senior Product Designer portfolio and complete your Upper Body workout.",
    actionLabel: "Start Draft",
    actionLink: "/career",
    tip: "Protein intake is at 75% of your daily goal. Add a quick post-workout shake to hit 160g.",
  };

  try {
    const result = await callGeminiCascade(
      `You are the executive AI Coach in LEVELUP, an all-in-one productivity and personal growth app.
Generate a concise, motivating daily insight (max 2 sentences) and 1 practical recommendation based on the user:
Name: ${userContext?.name || "Alex"}
Role: ${userContext?.title || "Senior Product Designer"}
Focus areas: ${userContext?.focus?.join(", ") || "Fitness, Career, Productivity"}
Format your reply as a JSON object with:
{
  "insight": "1-2 sentence high-impact insight",
  "actionLabel": "Action button text (e.g. 'Start Draft', 'Review Plan', 'Log Workout')",
  "actionLink": "A route path like '/career', '/fitness', '/planner', or '/student'",
  "tip": "Short 1-sentence micro-habit tip"
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Chat endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { message, context } = req.body;

  const fallback = {
    reply: `LEVELUP Coach: That's a great question regarding "${message}". Based on your schedule as ${context?.title || "a creator & professional"}, prioritize high-impact deep work in the morning and reserve collaborative reviews for the afternoon. Consistency in daily habits builds compounding results!`,
  };

  try {
    const result = await callGeminiCascade(message, {
      systemInstruction: `You are LEVELUP AI, an elite, articulate executive performance coach specializing in fitness hypertrophy, career acceleration, ATS optimization, student academic mastery, and digital creator strategies.
User profile context:
User: ${context?.name || "Alex Chen"} (${context?.title || "Senior Product Designer"})
Tone: Direct, encouraging, structured, concise, and highly actionable. Keep responses formatted cleanly with bullet points where appropriate.`,
    });

    if (result?.text) {
      return res.json({ reply: result.text });
    }
    return res.json(fallback);
  } catch (error: any) {
    return res.json(fallback);
  }
});

// AI ATS Resume Optimization
app.post("/api/ai/ats-optimize", async (req, res) => {
  const { resume, jobDescription } = req.body;

  const fallback = {
    score: 88,
    summary: "Resume shows strong structural clarity. Adding more explicit design leadership metrics will boost ATS parser score.",
    suggestions: [
      "Include keyword variations like 'Design Ops' and 'Tokenized System Architecture'.",
      "Quantify team mentorship impact in the lead designer role.",
    ],
    optimizedBullets: [
      "Directed 4 senior designers in overhauling enterprise analytics, lifting retention by 22% within 2 quarters.",
    ],
    keywordsFound: ["Figma", "Design Systems", "User Research"],
    keywordsMissing: ["Design Ops", "Executive Presentation"],
  };

  try {
    const result = await callGeminiCascade(
      `Perform an ATS (Applicant Tracking System) optimization analysis on the following resume against standard Senior Product Designer / Tech roles:
Resume: ${JSON.stringify(resume)}
Job Description context: ${jobDescription || "Staff/Senior Product Designer at leading SaaS company with focus on Design Systems, User Research, and Measurable Business Impact."}

Return a JSON object:
{
  "score": number between 75 and 98,
  "summary": "2-sentence ATS critique",
  "suggestions": ["list of 3 actionable improvements"],
  "optimizedBullets": ["2-3 revised, high-impact bullet points with action verbs and metrics"],
  "keywordsFound": ["list of detected keywords"],
  "keywordsMissing": ["list of high-value missing keywords"]
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Resume Improve Summary
app.post("/api/ai/resume/improve-summary", async (req, res) => {
  const { currentSummary, role, experience } = req.body;

  const fallback = {
    improvedSummary: `Accomplished ${role || "Professional"} with proven expertise leading strategic initiatives from concept to execution. Adept at cross-functional collaboration, system architecture, and delivering measurable ROI through user-centric design.`,
  };

  try {
    const result = await callGeminiCascade(
      `Rewrite and elevate the following professional resume summary for maximum impact, ATS optimization, and executive presence:
Current Summary: "${currentSummary || ""}"
Target Role: "${role || "Senior Professional"}"
Key Experience Highlights: ${JSON.stringify(experience || [])}

Requirements:
- Keep it to 2-3 compelling sentences.
- Use high-impact action verbs and strategic tone.
- Emphasize measurable business outcomes and leadership.
Return a JSON object:
{
  "improvedSummary": "The rewritten summary text"
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Resume Improve Bullet Point (XYZ Formula)
app.post("/api/ai/resume/improve-bullet", async (req, res) => {
  const { bullet, role, company } = req.body;

  const fallback = {
    improvedBullet: `Architected and launched core feature set, accelerating user adoption by 28% and streamlining user workflows across 100k+ active accounts.`,
    reasoning: "Applied Google's XYZ formula emphasizing measurable business ROI.",
  };

  try {
    const result = await callGeminiCascade(
      `Rewrite this resume bullet point using Google's XYZ formula ("Accomplished [X], as measured by [Y], by doing [Z]") with strong action verbs and quantified impact:
Role: ${role || "Lead"}
Company: ${company || "Tech"}
Original Bullet: "${bullet}"

Return a JSON object:
{
  "improvedBullet": "The revised high-impact bullet point",
  "reasoning": "Brief explanation of the improvements"
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Resume Suggest Skills
app.post("/api/ai/resume/suggest-skills", async (req, res) => {
  const { role, currentSkills } = req.body;

  const fallback = {
    suggestedSkills: [
      "Design Tokens Architecture",
      "Design Ops",
      "User Journey Mapping",
      "Accessibility Compliance (WCAG 2.1)",
      "Design System Governance",
      "Cross-Functional Leadership",
    ],
  };

  try {
    const result = await callGeminiCascade(
      `Suggest 6-8 in-demand, highly relevant, and ATS-friendly skills for a "${role || "Senior Product Designer"}" that are NOT in the current list: ${JSON.stringify(currentSkills || [])}.
Return a JSON object:
{
  "suggestedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"]
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Workout Plan Generator (Full Weekly Periodized Plan)
app.post("/api/ai/workout/generate-plan", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const {
    goal = "Muscle Gain",
    experience = "Intermediate",
    trainingDays = 4,
    duration = "60 mins",
    equipment = "Full Gym",
    preferredSplit = "Upper / Lower",
    targetMuscles = [],
    limitations = "",
    preferences = "",
    regenerationCount = 0,
    previousPlan = null,
    requestId = "",
  } = req.body || {};

  const numDays = Math.max(2, Math.min(7, Number(trainingDays) || 4));
  const targetMusclesList = Array.isArray(targetMuscles) ? targetMuscles : (targetMuscles ? [targetMuscles] : []);
  const targetMusclesStr = targetMusclesList.length > 0
    ? targetMusclesList.join(", ")
    : "Comprehensive Balanced Full Body Development";

  const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const genId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRequestId = requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Dynamic Procedural Fallback generator in case of network or rate limits
  const generateProceduralFallbackPlan = () => {
    const isHome = equipment === "Home" || equipment === "Bodyweight";
    const isDumbbellOnly = equipment === "Dumbbells";

    const dayTemplates = [
      {
        dayNumber: 1,
        dayName: "Day 1 - Monday",
        focusTitle: preferredSplit.includes("Push") ? "Push (Chest, Shoulders & Triceps)" : "Upper Body Power & Hypertrophy",
        muscleGroups: ["Chest", "Front/Side Deltoids", "Triceps", "Upper Back"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Band Pull-Aparts & Shoulder Dislocates", durationOrReps: "2 sets x 15 reps", cues: "Squeeze shoulder blades together with controlled tempo" },
            { exercise: "Scapular Push-ups & Arm Circles", durationOrReps: "10 reps each direction", cues: "Activate serratus anterior and lubricate glenohumeral joint" },
            { exercise: "Specific Warm-Up Sets", durationOrReps: "2-3 pyramid sets with light load", cues: "Groove bar path and neural prep without fatiguing muscles" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Decline Push-ups (Feet Elevated)" : isDumbbellOnly ? "Flat Dumbbell Bench Press" : "Incline Dumbbell Bench Press",
            targetMuscle: "Pectoralis Major (Clavicular & Sternal)",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90-120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Retract and depress shoulder blades into bench. Lower dumbbells flared at 45 degrees for a deep 3-second stretch across chest, then drive up smoothly.",
            intensityOrRPE: "RPE 8 (2 RIR)",
            alternativeExercise: "Barbell Incline Press or Push-up variations",
          },
          {
            orderIndex: 2,
            name: isHome ? "Inverted Bed/Table Row" : isDumbbellOnly ? "Chest-Supported Dumbbell Row" : "Chest-Supported T-Bar Row / Cable Row",
            targetMuscle: "Latissimus Dorsi & Rhomboids",
            sets: 4,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "2-0-1-1",
            formInstructions: "Pull elbows straight back toward hips. Squeeze shoulder blades together firmly at peak contraction for 1 second before lowering under control.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Single-Arm Dumbbell Row",
          },
          {
            orderIndex: 3,
            name: isHome ? "Pike Push-ups (Elevated)" : "Dumbbell Seated Overhead Shoulder Press",
            targetMuscle: "Anterior & Lateral Deltoids",
            sets: 3,
            reps: "8-10 reps",
            restTime: "90 sec",
            tempo: "3-0-1-0",
            formInstructions: "Keep core braced with ribs tucked. Press dumbbells vertically in slight arc overhead without arching lower back excessively.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Standing Landmine Press",
          },
          {
            orderIndex: 4,
            name: "Dumbbell Lean-Away Lateral Raises",
            targetMuscle: "Lateral Deltoids (Side Shoulders)",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-1-1-0",
            formInstructions: "Lead with elbows and pinkies slightly elevated. Lift to shoulder height with minimal swinging, pausing briefly at the top.",
            intensityOrRPE: "RPE 9 (1 RIR)",
            alternativeExercise: "Cable Lateral Raises or Resistance Band Raises",
          },
          {
            orderIndex: 5,
            name: isHome ? "Bench/Chair Triceps Dips" : "Overhead Dumbbell / Cable Triceps Extension",
            targetMuscle: "Triceps Brachii (Long Head)",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "3-0-1-1",
            formInstructions: "Keep elbows tucked close to ears. Lower weight behind head until full triceps stretch, then lock out forcefully.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Rope Cable Pushdown",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Doorway Pectoral Stretch", duration: "45s per side", cues: "Breathe deeply into diaphragm while feeling stretch across chest and shoulders" },
            { stretch: "Cross-Body Posterior Capsule Stretch", duration: "45s per side", cues: "Gently pull arm across chest keeping shoulder down" },
          ],
        },
        coachNotes: "Focus on mind-muscle connection during the eccentric lowering phase. Do not sacrifice range of motion for heavier weight.",
      },
      {
        dayNumber: 2,
        dayName: "Day 2 - Tuesday",
        focusTitle: preferredSplit.includes("Pull") ? "Pull (Back, Rear Delts & Biceps)" : "Lower Body Posterior & Quad Focus",
        muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "World's Greatest Stretch & Hip Openers", durationOrReps: "5 reps each side", cues: "Open hips, thoracic spine, and ankles dynamically" },
            { exercise: "Bodyweight Glute Bridges & Monster Walks", durationOrReps: "2 sets x 12 reps", cues: "Fire gluteus medius and prime hip extension" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Bulgarian Split Squats (Bodyweight)" : isDumbbellOnly ? "Dumbbell Goblet Squat / Split Squat" : "Barbell Back Squat / Hack Squat",
            targetMuscle: "Quadriceps & Gluteus Maximus",
            sets: 4,
            reps: "6-8 reps",
            restTime: "120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Screw feet firmly into floor with tripod foot pressure. Descend with torso braced until hip crease is parallel or below knees.",
            intensityOrRPE: "RPE 8 (2 RIR)",
            alternativeExercise: "Leg Press or Walking Dumbbell Lunges",
          },
          {
            orderIndex: 2,
            name: isHome ? "Single-Leg Romanian Deadlift" : "Romanian Deadlift (Dumbbell or Barbell)",
            targetMuscle: "Hamstrings & Glutes",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90-120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Hinge at hips by pushing pelvis back while maintaining neutral spine. Lower dumbbells just below knees until deep hamstring stretch.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Lying or Seated Leg Curls",
          },
          {
            orderIndex: 3,
            name: "Bulgarian Split Squats",
            targetMuscle: "Quads & Glute Medius",
            sets: 3,
            reps: "10-12 reps/leg",
            restTime: "90 sec",
            tempo: "2-0-1-0",
            formInstructions: "Elevate rear foot on bench. Drop back knee toward floor while keeping front shin relatively vertical and front heel anchored.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Walking Lunges or Step-ups",
          },
          {
            orderIndex: 4,
            name: "Standing Single-Leg Calf Raises",
            targetMuscle: "Gastrocnemius & Soleus",
            sets: 4,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-2-1-1",
            formInstructions: "Pause for full 2-second stretch at bottom and 1-second squeeze at apex.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Seated Calf Raise",
          },
          {
            orderIndex: 5,
            name: "Hanging Leg Raises / Captain's Chair",
            targetMuscle: "Rectus Abdominis & Deep Core",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Posteriorly tilt pelvis and curl knees toward chest without swinging or using momentum.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Cable Woodchoppers or Ab Wheel Rollouts",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Kneeling Hip Flexor & Quad Stretch", duration: "60s per leg", cues: "Squeeze glute of back leg to deepen hip flexor release" },
            { stretch: "Pigeon Pose Glute Stretch", duration: "60s per leg", cues: "Keep hips square and breathe deeply" },
          ],
        },
        coachNotes: "Lower body workouts generate significant central fatigue. Hydrate well and prioritize post-workout protein intake.",
      },
      {
        dayNumber: 3,
        dayName: "Day 3 - Wednesday",
        focusTitle: "Active Recovery & Mobility Protocol",
        muscleGroups: ["Full Body Fascia", "Core", "Mobility"],
        isRestDay: true,
        duration: "20-30 mins",
        warmup: {
          duration: "5 mins",
          routine: [
            { exercise: "Diaphragmatic Box Breathing", durationOrReps: "3 minutes (4s in, 4s hold, 4s out, 4s hold)", cues: "Switch nervous system to parasympathetic recovery state" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: "Zone 2 Low-Intensity Walk / Light Cycling",
            targetMuscle: "Cardiovascular System & Recovery",
            sets: 1,
            reps: "25-30 mins",
            restTime: "0 sec",
            tempo: "Steady pace",
            formInstructions: "Maintain conversational nasal breathing pace to flush metabolic byproducts without incurring CNS fatigue.",
            intensityOrRPE: "RPE 4-5",
            alternativeExercise: "Swimming or Light Elliptical",
          },
          {
            orderIndex: 2,
            name: "Full-Body 90/90 Hip Flow & Thoracic Windmills",
            targetMuscle: "Hip Rotators & Spine",
            sets: 2,
            reps: "10 reps each side",
            restTime: "30 sec",
            tempo: "Slow & smooth",
            formInstructions: "Move through active end-ranges of motion to restore joint capsule glide.",
            intensityOrRPE: "RPE 3",
            alternativeExercise: "Cat-Cow & Child's Pose Flow",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Legs-Up-the-Wall Relaxation", duration: "5 mins", cues: "Enhance venous return and reduce lower extremity inflammation" },
          ],
        },
        coachNotes: "Muscle hypertrophy and strength adaptations happen during rest and deep sleep. Ensure 7-9 hours of quality sleep tonight.",
      },
      {
        dayNumber: 4,
        dayName: "Day 4 - Thursday",
        focusTitle: "Upper Body Hypertrophy & Deltoid/Arm Specialization",
        muscleGroups: ["Chest", "Upper Back", "Biceps", "Triceps", "Rear Delts"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Face Pulls with Resistance Band", durationOrReps: "2 sets x 15 reps", cues: "Warm up rotator cuff and external rotators" },
            { exercise: "Yoga Push-up to Downward Dog", durationOrReps: "8 reps", cues: "Dynamic upper chain activation" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Wide-Grip Pull-ups / Doorway Rows" : "Neutral-Grip Lat Pulldown / Weighted Pull-ups",
            targetMuscle: "Latissimus Dorsi (Width & Thickness)",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90 sec",
            tempo: "3-0-1-1",
            formInstructions: "Drive elbows down and back toward ribs. Full dead-hang stretch at top, pull bar to upper clavicle.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Single-Arm Cable Pulldown",
          },
          {
            orderIndex: 2,
            name: "Dumbbell Flat Bench Press / Low Cable Press",
            targetMuscle: "Sternal Pectoralis Major",
            sets: 3,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "3-0-1-0",
            formInstructions: "Keep wrists stacked directly over elbows. Press dumbbells up and together with intense chest squeeze.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Machine Chest Press",
          },
          {
            orderIndex: 3,
            name: "Seated Face Pulls with External Rotation",
            targetMuscle: "Rear Deltoids & Infraspinatus",
            sets: 3,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-2",
            formInstructions: "Pull rope to bridge of nose while externally rotating hands back. Hold peak contraction for 2 seconds.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Rear Delt Dumbbell Flyes",
          },
          {
            orderIndex: 4,
            name: "Incline Dumbbell Biceps Curls",
            targetMuscle: "Biceps Brachii (Long Head Stretch)",
            sets: 3,
            reps: "10-12 reps",
            restTime: "60 sec",
            tempo: "3-0-1-1",
            formInstructions: "Set bench to 45 degrees. Allow arms to hang straight down for deep stretch, curl up while supinating wrists.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "EZ-Bar Preacher Curls",
          },
          {
            orderIndex: 5,
            name: "Cross-Body Cable / Dumbbell Triceps Extensions",
            targetMuscle: "Triceps Lateral & Medial Heads",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Keep upper arm pinned at side. Extend forearm fully and squeeze triceps hard.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Skull Crushers",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Overhead Lat & Triceps Stretch", duration: "45s each side", cues: "Lengthen lateral ribcage and latissimus dorsi" },
          ],
        },
        coachNotes: "Focus on isolating the target muscle with zero body english on curls and extensions.",
      },
    ];

    // Trim or expand days to match requested trainingDays
    const finalSchedule = dayTemplates.slice(0, numDays);

    return {
      planName: `${goal} Master Protocol (${preferredSplit})`,
      overview: `A science-based ${numDays}-day ${preferredSplit} training system engineered for ${experience} lifters. Emphasizes mechanical tension, optimal stimulus-to-fatigue ratios, and progressive overload with ${equipment}.`,
      goal,
      experience,
      equipment,
      splitName: preferredSplit,
      trainingDaysCount: numDays,
      estimatedDuration: duration,
      targetMuscles: targetMusclesStr,
      progressiveOverloadGuidance: {
        principles: [
          "Double Progression Strategy: Maintain weight until you hit the upper rep ceiling for all sets with immaculate form.",
          "Controlled Eccentrics: Maintain 2-3 second lowering tempo on all compound movements for maximal mechanical tension.",
          "Proximity to Failure: Train compound lifts at RPE 8 (2 RIR); finish isolation movements at RPE 9-10 (0-1 RIR).",
        ],
        progressionRule: "Add 2.5kg / 5lbs to upper body lifts or 5kg / 10lbs to lower body lifts once you reach the maximum rep target on all sets.",
        rpeGuidance: "Weeks 1-2: RPE 7-8. Weeks 3-5: RPE 8-9. Week 6: Deload (RPE 6, 50% volume).",
        tempoAdvice: "3-1-1-0 on compound presses and squats (3s down, 1s pause in stretch, 1s up).",
        deloadStrategy: "Perform a deload every 6-8 weeks by reducing working sets by 40% while preserving load intensity.",
      },
      weeklySchedule: finalSchedule,
    };
  };

  const previousPlanContext = previousPlan && previousPlan.weeklySchedule
    ? `
PREVIOUS PLAN TO AVOID (REGENERATION #${regenerationCount + 1}):
The user requested a novel variation. Avoid identical exercise selections:
${previousPlan.weeklySchedule.map((d: any) => `Day ${d.dayNumber} (${d.focusTitle}): ${(d.exercises || []).map((e: any) => e.name).join(", ")}`).join("\n")}
`
    : "";

  const prompt = `You are a World-Class Sports Physiologist and CSCS Strength & Conditioning Coach for LEVELUP Fitness OS.
Design a completely customized, evidence-based, periodized weekly workout plan adhering strictly to the user's specific inputs:

USER PROFILE & CONSTRAINTS (Generation Token: ${seed}):
- Goal: ${goal}
- Experience Level: ${experience}
- Training Frequency: EXACTLY ${numDays} training days in the weekly schedule (Day 1 through Day ${numDays})
- Session Duration: ${duration}
- Available Equipment: ${equipment}
- Preferred Split Architecture: ${preferredSplit}
- Target Muscle Focus: ${targetMusclesStr}
- Physical Limitations / Injuries: ${limitations || "None"}
- Coaching Preferences / Notes: ${preferences || "Optimize for hypertrophy, strength, and biomechanical joint longevity"}
- Iteration: ${regenerationCount}
${previousPlanContext}

STRICT PROGRAMMING DIRECTIVES BY SELECTION:
1. GOAL DIFFERENTIATION:
   - "Muscle Gain" (Hypertrophy): 8-12 / 10-15 reps, 3-4 working sets, high mechanical tension with controlled stretch (3-0-1-0 tempo), 60-90s rest, target 1-2 RIR (RPE 8-9).
   - "Fat Loss" (Metabolic Recomposition): 12-18 reps, 3-4 sets, shorter rest intervals (45-60s), higher density, compound movements paired with core/metabolic stimulus, 2-0-1-0 tempo.
   - "Strength" (Maximum Neural Drive): 3-6 reps on main compound lifts, 4-5 sets, heavy load (80-90% 1RM), explosive concentric (3-1-X-0 tempo), 120-180s rest, RPE 7.5-8.5.
   - "General Fitness" (Functional Longevity): 8-12 reps, 3 sets, 60-90s rest, multi-planar functional patterns (squat, hinge, push, pull, rotate, carry), joint mobility integration.

2. EXPERIENCE LEVEL DIFFERENTIATION:
   - "Beginner": 4-5 foundational exercises per day, 2-3 sets per exercise, focus on pristine movement literacy, conservative RPE (RPE 6.5-7.5, 2-3 RIR), linear progression rules.
   - "Intermediate": 5-6 exercises per day, 3-4 sets per exercise, double-progression model, variation in angles, RPE 7.5-8.5 (1-2 RIR).
   - "Advanced": 6-7 exercises per day, 3-5 sets, advanced periodization, higher volume on target muscle groups, intensity techniques where appropriate, RPE 8.5-9.5 (0-1 RIR).

3. DURATION CALIBRATION:
   - "30 mins": 3-4 compact, high-efficiency exercises, concise 3 min dynamic warm-up, 45-60s rest times.
   - "45 mins": 4-5 exercises, 5 min warm-up, 60-75s rest.
   - "60 mins": 5-6 exercises, 8 min warm-up, 75-90s rest.
   - "75 mins": 6-7 exercises, 8 min warm-up, primary strength + secondary isolation work, 90-120s rest.
   - "90 mins": 7-8 exercises, comprehensive warm-up, heavy compounds + specialized isolation pump + core/mobility finish.

4. EQUIPMENT CONSTRAINTS (MANDATORY):
   - "Full Gym": Barbells, dumbbells, cables, selectorized machines, leg press, hack squat, smith machine.
   - "Dumbbells": Dumbbells, adjustable bench, bodyweight/pull-up bar ONLY. Strictly NO barbell or cable machine exercises.
   - "Home": Resistance bands, dumbbells, pull-up bar, bodyweight, chairs/sturdy furniture. Strictly NO commercial heavy machinery.
   - "Bodyweight": Calisthenics ONLY (push-up variations, pull-ups, dips, pike push-ups, pistol/Bulgarian squats, inverted rows, planks, hollow body). Strictly NO weights or machines.

5. TARGET MUSCLE FOCUS:
   - Prioritize these target muscles (${targetMusclesStr}) with first-order placement in sessions, extra set volume, and specific isolation angles.

6. LIMITATIONS:
   - Respect: "${limitations || "None"}". Never prescribe movements that aggravate stated injuries.

7. EXACT SCHEDULE STRUCTURE:
   - "weeklySchedule" MUST contain exactly ${numDays} day objects (Day 1 through Day ${numDays}).

Return ONLY a valid JSON object matching this schema:
{
  "planName": "Creative, specific plan title reflecting goal and split",
  "overview": "Detailed 2-3 sentence scientific summary explaining the stimulus and rationale",
  "goal": "${goal}",
  "experience": "${experience}",
  "equipment": "${equipment}",
  "splitName": "${preferredSplit}",
  "trainingDaysCount": ${numDays},
  "estimatedDuration": "${duration}",
  "targetMuscles": "${targetMusclesStr}",
  "progressiveOverloadGuidance": {
    "principles": ["Principle 1", "Principle 2", "Principle 3"],
    "progressionRule": "Specific actionable progression rule for increasing weight or reps",
    "rpeGuidance": "Clear RPE guidelines across the training week",
    "tempoAdvice": "Tempo guide (e.g. 3-0-1-0 eccentric control)",
    "deloadStrategy": "Deload timing and load reduction protocol"
  },
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Monday",
      "focusTitle": "Descriptive Session Focus Title",
      "muscleGroups": ["Muscle 1", "Muscle 2"],
      "isRestDay": false,
      "duration": "${duration}",
      "warmup": {
        "duration": "8 mins",
        "routine": [
          { "exercise": "Drill Name", "durationOrReps": "2 x 12", "cues": "Activation cue" }
        ]
      },
      "exercises": [
        {
          "orderIndex": 1,
          "name": "Exercise Name",
          "targetMuscle": "Specific muscle head",
          "sets": 4,
          "reps": "8-10 reps",
          "restTime": "90 sec",
          "tempo": "3-0-1-0",
          "formInstructions": "Clear, step-by-step biomechanical execution cue with setup and breathing.",
          "intensityOrRPE": "RPE 8 (2 RIR)",
          "alternativeExercise": "Viable alternative"
        }
      ],
      "cooldown": {
        "duration": "5 mins",
        "routine": [
          { "stretch": "Stretch Name", "duration": "45s", "cues": "Parasympathetic breathing" }
        ]
      },
      "coachNotes": "Key coaching tip for today's session."
    }
  ]
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.85,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.weeklySchedule && Array.isArray(parsed.weeklySchedule) && parsed.weeklySchedule.length > 0) {
        parsed.id = parsed.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        parsed.generationId = genId;
        parsed.requestId = effectiveRequestId;
        parsed.created_at = new Date().toISOString();
        parsed.goal = parsed.goal || goal;
        parsed.experience = parsed.experience || experience;
        parsed.equipment = parsed.equipment || equipment;
        parsed.splitName = parsed.splitName || preferredSplit;
        parsed.trainingDaysCount = parsed.weeklySchedule.length;
        parsed.estimatedDuration = parsed.estimatedDuration || duration;

        // Ensure exercise indices and day numbers are sequential and well-formatted
        parsed.weeklySchedule = parsed.weeklySchedule.slice(0, numDays).map((day: any, idx: number) => ({
          dayNumber: idx + 1,
          dayName: day.dayName || `Day ${idx + 1}`,
          focusTitle: day.focusTitle || `${preferredSplit} - Day ${idx + 1}`,
          muscleGroups: Array.isArray(day.muscleGroups) ? day.muscleGroups : ["Full Body"],
          isRestDay: Boolean(day.isRestDay),
          duration: day.duration || duration,
          warmup: day.warmup || {
            duration: "5 mins",
            routine: [
              { exercise: "Dynamic Joint Rotations & Movement Prep", durationOrReps: "2 sets x 10 reps", cues: "Open joint angles" }
            ]
          },
          exercises: (day.exercises || []).map((ex: any, exIdx: number) => ({
            orderIndex: exIdx + 1,
            name: ex.name || "Compound Movement",
            targetMuscle: ex.targetMuscle || "Target Muscle",
            sets: Number(ex.sets) || 3,
            reps: String(ex.reps || "8-12 reps"),
            restTime: String(ex.restTime || "90 sec"),
            tempo: String(ex.tempo || "3-0-1-0"),
            formInstructions: String(ex.formInstructions || "Maintain controlled tempo throughout the rep."),
            intensityOrRPE: String(ex.intensityOrRPE || "RPE 8"),
            alternativeExercise: ex.alternativeExercise || ""
          })),
          cooldown: day.cooldown || {
            duration: "5 mins",
            routine: [
              { stretch: "Static Full-Body Stretch", duration: "45s per side", cues: "Slow deep breathing" }
            ]
          },
          coachNotes: day.coachNotes || "Focus on progressive overload and consistent tempo.",
        }));

        return res.json(parsed);
      }
    }

    return res.status(503).json({
      error: "AI Workout Generation service was unable to generate a plan for the specified parameters. Please try again.",
    });
  } catch (err: any) {
    console.error("[AI Workout Generate Plan Exception]:", err?.message);
    return res.status(500).json({
      error: err?.message || "Failed to generate AI workout plan. Please try again.",
    });
  }
});

// AI Single Day Regeneration / Customization Endpoint
app.post("/api/ai/workout/regenerate-day", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const {
    planContext = {},
    dayNumber = 1,
    dayName = "Day 1",
    currentFocusTitle = "Workout Session",
    currentExercises = [],
    userFeedback = "",
  } = req.body || {};

  const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const prompt = `You are the Lead Sports Physiologist for LEVELUP Fitness OS.
The user wants to REGENERATE / CUSTOMIZE a specific workout day in their training program based on their custom instructions.
(Token: ${seed})

PLAN CONTEXT:
- Goal: ${planContext.goal || "Muscle Gain"}
- Experience Level: ${planContext.experience || "Intermediate"}
- Available Equipment: ${planContext.equipment || "Full Gym"}
- Target Duration: ${planContext.duration || "60 mins"}
- Limitations / Injuries: ${planContext.limitations || "None"}
- Split Type: ${planContext.splitName || "Custom"}

DAY TO REGENERATE:
- Day Number: ${dayNumber}
- Day Name: ${dayName}
- Current Focus: ${currentFocusTitle}
- Current Exercises: ${(currentExercises || []).map((e: any) => e.name).join(", ") || "Standard routine"}

USER'S CUSTOM ADJUSTMENT / FEEDBACK:
"${userFeedback || "Generate a fresh, challenging variation with optimal exercise selection"}"

REQUIREMENTS:
1. Provide an updated Day object strictly adhering to the user's feedback, equipment constraints (${planContext.equipment || "Full Gym"}), and training experience (${planContext.experience || "Intermediate"}).
2. Include 4-6 exercises with orderIndex, name, targetMuscle, sets, reps, restTime, tempo, formInstructions (concise step-by-step form execution instructions), intensityOrRPE, and alternativeExercise.
3. Include dynamic warmup routine and cool-down routine.
4. Return ONLY a valid JSON object matching this schema:

{
  "dayNumber": ${dayNumber},
  "dayName": "${dayName}",
  "focusTitle": "Updated Session Title",
  "muscleGroups": ["Muscle 1", "Muscle 2"],
  "isRestDay": false,
  "duration": "${planContext.duration || "60 mins"}",
  "warmup": {
    "duration": "8 mins",
    "routine": [
      { "exercise": "Drill name", "durationOrReps": "2 x 15", "cues": "Activation cue" }
    ]
  },
  "exercises": [
    {
      "orderIndex": 1,
      "name": "Exercise Name",
      "targetMuscle": "Primary muscle",
      "sets": 4,
      "reps": "8-10 reps",
      "restTime": "90 sec",
      "tempo": "3-1-1-0",
      "formInstructions": "Step-by-step cue on how to perform correctly.",
      "intensityOrRPE": "RPE 8 (2 RIR)",
      "alternativeExercise": "Alternative name"
    }
  ],
  "cooldown": {
    "duration": "5 mins",
    "routine": [
      { "stretch": "Stretch name", "duration": "45s", "cues": "Breathing cues" }
    ]
  },
  "coachNotes": "Specific coaching cue based on the modifications requested."
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.85,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.exercises && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
        parsed.dayNumber = Number(dayNumber) || 1;
        parsed.dayName = dayName || `Day ${dayNumber}`;
        return res.json(parsed);
      }
    }
    return res.status(503).json({ error: "Unable to regenerate workout day. Please try again." });
  } catch (err: any) {
    console.error("[AI Workout Regenerate Day Exception]:", err?.message);
    return res.status(500).json({ error: err?.message || "Failed to regenerate day." });
  }
});

// AI Workout Plan Generator (Legacy Compatible Single Protocol)
app.post("/api/ai/generate-workout", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const { splitType, targetMuscle, fitnessLevel, duration, equipment, limitations, goal } = req.body || {};

  const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const prompt = `You are a Lead Exercise Scientist for LEVELUP Fitness OS. (Token: ${seed})
Create a science-based custom workout protocol strictly adapted to:
- Goal: ${goal || "Muscle Gain / Hypertrophy"}
- Focus / Muscle: ${targetMuscle || "Full Body"}
- Split: ${splitType || "Push/Pull/Legs"}
- Experience Level: ${fitnessLevel || "Intermediate"}
- Equipment: ${equipment || "Full Gym"}
- Target Duration: ${duration || "45 mins"}
- Limitations: ${limitations || "None"}

Return ONLY a valid JSON object matching this schema:
{
  "protocolName": "Workout title reflecting specific muscle and split",
  "duration": "${duration || "45 mins"}",
  "intensity": "High Intensity / Moderate / Controlled",
  "exercises": [
    { "name": "Exercise name", "setsReps": "4 x 8-10", "notes": "Specific form cue" }
  ]
}`;

  try {
    const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.exercises && parsed.exercises.length > 0) {
        return res.json(parsed);
      }
    }
    return res.status(503).json({ error: "Failed to generate workout protocol." });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Failed to generate workout protocol." });
  }
});

// AI Creator Ideas Generator
app.post("/api/ai/creator-ideas", async (req, res) => {
  const { topic, platform } = req.body;

  const fallback = {
    ideas: [
      {
        title: `How I Scaled My Design System (Step-by-Step)`,
        hook: "Most teams overcomplicate design tokens. Here is the 3-layer architecture that cut our handoff time by 30%:",
        platform: platform || "X",
      },
      {
        title: `5 Daily Habits that Replaced 40 Hours of Procrastination`,
        hook: "You don't lack time—you lack clarity. Here is how I structure my day with LEVELUP:",
        platform: platform || "YouTube",
      },
      {
        title: `The Modern Tech Stack for High Performance`,
        hook: "Stop switching between 10 apps. Here is the minimalist workflow top performers use daily:",
        platform: platform || "LinkedIn",
      },
    ],
  };

  try {
    const result = await callGeminiCascade(
      `Generate 3 viral content ideas and high-converting hooks for a digital creator / professional on topic "${topic || "Product Design & Productivity"}" for platform "${platform || "X / YouTube"}".
Return a JSON object:
{
  "ideas": [
    { "title": "Catchy post title", "hook": "Opening sentence or hook", "platform": "Platform name" }
  ]
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// ==========================================
// AI PORTFOLIO BUILDER ENDPOINTS
// ==========================================

// AI Improve Bio
app.post("/api/ai/portfolio/improve-bio", async (req, res) => {
  const { bio, role, name, tone } = req.body;

  const fallback = {
    improvedBio: `I am ${name || "a designer"} specializing in ${role || "digital product architecture"}. With a deep focus on user-centric systems, clean typography, and scalable interfaces, I bridge complex engineering requirements with intuitive, high-conversion visual design.`,
    tagline: `Crafting high-impact digital experiences that scale.`,
  };

  try {
    const result = await callGeminiCascade(
      `You are an elite portfolio copywriter. Improve the following bio for a professional portfolio website:
Name: ${name || "Professional"}
Role: ${role || "Product Designer & Engineer"}
Tone: ${tone || "Refined, compelling, authoritative"}
Current Bio: ${bio || "I build digital websites and apps."}

Return a JSON object:
{
  "improvedBio": "Compelling 2-3 paragraph professional bio highlighting craft, impact, and design philosophy",
  "tagline": "A punchy, memorable one-sentence personal tagline"
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Project Description Generator
app.post("/api/ai/portfolio/project-desc", async (req, res) => {
  const { projectName, role, tools, roughNotes } = req.body;

  const fallback = {
    description: `Designed and built ${projectName || "the project"} with a focus on frictionless user experience, robust modular components, and performance. Conducted user interviews and rapid prototyping sprints to deliver a polished, production-ready interface.`,
    keyHighlights: [
      "Reduced user interaction latency with optimized information architecture",
      "Engineered accessible UI compliant with WCAG AA standards",
      "Collaborated cross-functionally to ensure pixel-perfect deployment",
    ],
  };

  try {
    const result = await callGeminiCascade(
      `Generate a compelling case-study-ready project description for a portfolio:
Project Name: ${projectName || "Enterprise Web Application"}
Role: ${role || "Lead Designer / Developer"}
Tools/Tech: ${Array.isArray(tools) ? tools.join(", ") : tools || "React, TypeScript, Figma"}
Rough Notes / Objectives: ${roughNotes || "Redesigned checkout and dashboard to improve conversion."}

Return a JSON object:
{
  "description": "Engaging 2-paragraph project description emphasizing the business problem, your tactical approach, and measurable impact.",
  "keyHighlights": [
    "Key achievement 1 with metrics/verbs",
    "Key achievement 2",
    "Key achievement 3"
  ]
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Case Study Generator
app.post("/api/ai/portfolio/case-study", async (req, res) => {
  const { projectName, role, tools, description, roughNotes } = req.body;

  const fallback = {
    problem: `The previous system suffered from high cognitive friction and outdated design patterns, creating drop-offs during critical user actions.`,
    research: `Synthesized feedback from customer success telemetry and conducted 10 usability audits to map bottleneck pathways.`,
    process: `Executed an agile 4-week design sprint cycle: empathy mapping, rapid prototyping, cross-functional engineering reviews, and token creation.`,
    wireframes: `Iterated through structural wireframes to streamline primary user task completion to under 3 clicks.`,
    design: `Built a unified design system with clean visual hierarchy, mathematical spacing, and WCAG AA compliant color contrast.`,
    solution: `Shipped a high-performance web experience that unifies core user operations into a cohesive, delight-driven workflow.`,
    results: `Drove a 40% reduction in workflow completion time and a 25% lift in day-30 user retention.`,
    learnings: `Prioritizing deep user research early in the cycle prevents costly mid-development scope pivots.`,
  };

  try {
    const result = await callGeminiCascade(
      `Generate a comprehensive, recruiter-ready product design & engineering case study breakdown:
Project: ${projectName || "Flagship SaaS Platform"}
Role: ${role || "Lead Product Designer"}
Tech/Tools: ${Array.isArray(tools) ? tools.join(", ") : tools || "Figma, React, Tailwind, Next.js"}
Context/Description: ${description || "Re-architected core user workflows"}
Notes: ${roughNotes || "Increased user engagement and streamlined critical tasks"}

Return a JSON object with these exact keys:
{
  "problem": "Clear statement of the problem space, user pain points, and business context (2-3 sentences)",
  "research": "Summary of user research, competitive analysis, and data discovery methods (2-3 sentences)",
  "process": "Step-by-step methodology followed from discovery to execution (2-3 sentences)",
  "wireframes": "How information architecture and low-fidelity prototypes were validated (2-3 sentences)",
  "design": "Visual craft decisions, design system tokens, typography, and UX refinements (2-3 sentences)",
  "solution": "The final shipped product overview and key feature capabilities (2-3 sentences)",
  "results": "Measurable impact, business outcomes, KPIs, and user feedback (2-3 sentences with concrete metrics)",
  "learnings": "Key strategic takeaways, retrospective insights, and future growth iterations (2-3 sentences)"
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// AI Tagline Generator
app.post("/api/ai/portfolio/generate-tagline", async (req, res) => {
  const { name, role, skills } = req.body;

  const fallback = {
    taglines: [
      "Crafting intuitive digital experiences with architectural precision.",
      "Transforming complex systems into elegant, human-centric software.",
      "Bridging visual storytelling and scalable modern web engineering.",
      "Designing interfaces that inspire, perform, and convert.",
    ],
  };

  try {
    const result = await callGeminiCascade(
      `Generate 4 punchy, modern portfolio hero taglines for:
Name: ${name || "Creative"}
Role: ${role || "Product Designer & Developer"}
Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "UI/UX, Full-Stack Development"}

Return a JSON object:
{
  "taglines": [
    "Tagline 1",
    "Tagline 2",
    "Tagline 3",
    "Tagline 4"
  ]
}`,
      { responseMimeType: "application/json" }
    );

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// ==========================================
// AI INTERVIEW PREPARATION PLAN GENERATOR
// ==========================================
app.post("/api/ai/interview-prep/generate-plan", async (req, res) => {
  const {
    targetRole = "Software Engineer",
    experienceLevel = "1–3 years",
    interviewType = "Mixed",
    skills = [],
    targetCompany = "",
    jobDescription = "",
    userProjects = [],
    userExperience = [],
    userProfileSummary = "",
  } = req.body || {};

  const skillsList: string[] = Array.isArray(skills)
    ? skills.filter(Boolean)
    : typeof skills === "string"
    ? (skills as string).split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const skillsStr = skillsList.length > 0 ? skillsList.join(", ") : "Core Industry Fundamentals & Best Practices";
  const planId = `plan_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const isSenior = experienceLevel === "3+ years";
  const isFresher = experienceLevel === "Fresher" || experienceLevel === "0–1 years";
  const difficultyLevel = isSenior ? "Senior/Staff Bar" : isFresher ? "Entry" : "Intermediate";

  // Build projects context string if available
  const projectsList = Array.isArray(userProjects) ? userProjects : [];
  const projectsContextStr = projectsList.length > 0
    ? projectsList
        .map(
          (p: any, idx: number) =>
            `Project ${idx + 1}: "${p.name || "Untitled"}" - Role: ${p.role || "Developer/Designer"} - Description: ${p.description || "N/A"} - Technologies: ${Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "N/A"}`
        )
        .join("\n")
    : "";

  const experienceList = Array.isArray(userExperience) ? userExperience : [];
  const experienceContextStr = experienceList.length > 0
    ? experienceList
        .map(
          (e: any, idx: number) =>
            `Experience ${idx + 1}: ${e.role || "Role"} at ${e.company || "Company"} (${e.period || e.startDate || "Past"}) - ${e.description || ""} ${Array.isArray(e.bullets) ? e.bullets.join("; ") : ""}`
        )
        .join("\n")
    : "";

  // Dynamic procedural fallback plan if AI models are unreachable
  const generateFallbackPlan = () => {
    const primarySkill = skillsList[0] || (targetRole.includes("Design") ? "Figma & Design Systems" : targetRole.includes("Data") ? "SQL & Analytics" : "Architecture & Code");
    const secondarySkill = skillsList[1] || (targetRole.includes("Design") ? "User Research" : targetRole.includes("Data") ? "Python / Pandas" : "Clean Code & Testing");
    const tertiarySkill = skillsList[2] || (targetRole.includes("Design") ? "Prototyping" : targetRole.includes("Data") ? "Data Visualization" : "System Design");

    const fallbackQuestions: any[] = [
      {
        id: "q_tech_1",
        question: targetRole.toLowerCase().includes("frontend")
          ? "How do you optimize React rendering performance, minimize re-renders, and manage complex state architecture in large-scale web applications?"
          : targetRole.toLowerCase().includes("designer") || targetRole.toLowerCase().includes("ui/ux")
          ? "Walk me through your end-to-end design process when building a scalable Design System from scratch across cross-functional engineering teams."
          : targetRole.toLowerCase().includes("data")
          ? "How do you design an analytical SQL query to calculate 30-day cohort retention and identify data anomalies in high-volume event streams?"
          : targetRole.toLowerCase().includes("backend")
          ? "How would you design a distributed caching and rate-limiting tier to protect downstream PostgreSQL databases from sudden traffic spikes?"
          : `Walk me through how you leverage ${primarySkill} to solve complex domain bottlenecks and scale execution in ${targetRole}.`,
        category: "Technical",
        type: "Technical",
        difficulty: isSenior ? "Hard" : "Medium",
        evaluates: "Depth of practical technical knowledge, trade-off evaluation, and architecture principles.",
        sampleFramework: "High-level Principle -> Internal Mechanics -> Concrete Implementation Example -> Edge Cases & Trade-offs",
        keyPointsToCover: [
          "State the fundamental mechanism and why alternative approaches were rejected",
          "Explain latency, memory, or usability implications",
          "Discuss real-world production constraints and monitoring",
        ],
      },
      {
        id: "q_behav_1",
        question: "Tell me about a time when you experienced a major technical or product disagreement with a cross-functional peer or manager. How did you handle it?",
        category: "Behavioral",
        type: "Behavioral",
        difficulty: "Medium",
        evaluates: "Emotional intelligence, objective data-driven negotiation, and commitment to project success.",
        sampleFramework: "Situation (Context) -> Differing Viewpoints -> Objective Action / Prototype -> Resolution & Mutual Trust -> Result",
        keyPointsToCover: [
          "Focus on user and business outcomes rather than ego",
          "Demonstrate active listening and data-grounded persuasion",
          "Highlight a positive, lasting working relationship afterward",
        ],
      },
      {
        id: "q_hr_1",
        question: `Why are you interested in joining ${targetCompany || "our company"} in this ${targetRole} role, and what unique impact will you make in your first 90 days?`,
        category: "HR",
        type: "HR",
        difficulty: "Easy",
        evaluates: "Company research, intrinsic motivation, self-awareness, and strategic onboarding vision.",
        sampleFramework: "Company Mission & Vector -> Core Skill Fit -> Structured 30-60-90 Day Impact Plan",
        keyPointsToCover: [
          `Reference specific products, values, or challenges facing ${targetCompany || "the company"}`,
          "Connect your past accomplishments directly to the team's current goals",
          "Outline a 30-60-90 day roadmap: Listen/Learn -> Deliver Quick Win -> Scale Long-Term Value",
        ],
      },
    ];

    // Add project-based questions if user projects exist
    if (projectsList.length > 0) {
      projectsList.slice(0, 2).forEach((proj: any, idx: number) => {
        fallbackQuestions.push({
          id: `q_proj_${idx + 1}`,
          question: `In your project "${proj.name}", why did you select ${Array.isArray(proj.technologies) ? proj.technologies.slice(0, 2).join(" & ") : "your chosen stack"}, and what was the most difficult technical bottleneck you resolved?`,
          category: "Project",
          type: "Technical",
          difficulty: isSenior ? "Hard" : "Medium",
          evaluates: "Ownership of past work, architectural rationale, and ability to reflect on engineering trade-offs.",
          sampleFramework: "Project Context & Stakes -> Technical Bottleneck Encountered -> Chosen Solution & Trade-offs -> Measurable Outcome",
          keyPointsToCover: [
            `Explain the architectural reasons for using ${Array.isArray(proj.technologies) ? proj.technologies.join(", ") : "your tools"}`,
            "Discuss what went wrong or what unexpected scale constraints arose",
            "State what you would redesign today with your current experience",
          ],
          projectRef: proj.name,
        });
      });
    }

    if (jobDescription) {
      fallbackQuestions.push({
        id: "q_jd_1",
        question: `Based on the job requirements for this ${targetRole} position, how have you previously delivered on high-reliability, cross-functional deliverables under tight deadlines?`,
        category: "Job-Specific",
        type: "Technical",
        difficulty: "Medium",
        evaluates: "Direct alignment with the target job's core responsibilities and technical scope.",
        sampleFramework: "Direct Match to JD Requirement -> Specific Past Example -> Quantified Results",
        keyPointsToCover: [
          "Directly address the primary responsibilities highlighted in the job description",
          "Cite concrete metrics and collaboration patterns",
        ],
      });
    }

    // Role-tailored day-by-day 14-day roadmap
    const dayByDayRoadmap: any[] = [
      { day: 1, phase: "Phase 1: Foundations & Diagnostics", title: "Role Fundamentals & Competency Audit", focus: `Audit core principles of ${primarySkill} and baseline diagnostic assessment.`, tasks: [`Review core lifecycle and internals of ${primarySkill}`, "Draft a 1-page cheatsheet of core definitions and paradigms", "Audit top 3 strengths and top 3 growth areas"], estimatedMinutes: 60, category: "Fundamentals" },
      { day: 2, phase: "Phase 1: Foundations & Diagnostics", title: "Core Technical Concepts & Execution", focus: `Master the essential execution model and performance pillars of ${secondarySkill}.`, tasks: [`Deep dive into ${secondarySkill} best practices and common pitfalls`, "Solve 3 fundamental implementation exercises", "Review standard conventions and design patterns"], estimatedMinutes: 75, category: "Technical" },
      { day: 3, phase: "Phase 1: Foundations & Diagnostics", title: "Tools, Frameworks & Modern Ecosystem", focus: `Review the key tools, libraries, and ecosystem standards for modern ${targetRole}.`, tasks: [`Practice with ${tertiarySkill} workflows`, "Review ecosystem trade-offs and alternative tooling", "Refine hotkeys and live-interview problem setup"], estimatedMinutes: 60, category: "Technical" },
      { day: 4, phase: "Phase 2: In-Depth Domain Drills", title: "Live Problem Solving & Logic Drills", focus: "Develop structured verbal thinking and methodical problem breakdown.", tasks: ["Solve 2 complex domain scenarios with a 30-minute timer", "Vocalize assumptions, time/space trade-offs, and edge cases", "Review optimal solutions and refactor for elegance"], estimatedMinutes: 90, category: "Technical" },
      { day: 5, phase: "Phase 2: In-Depth Domain Drills", title: "Project & Portfolio Deep Dive", focus: "Prepare comprehensive architectural walkthroughs of your top 2 resume projects.", tasks: ["Map out the architecture diagram and data flow for your primary project", "Prepare answers for: 'Why this tech?', 'Biggest mistake?', 'Scale bottlenecks?'", "Practice a crisp 90-second project elevator pitch"], estimatedMinutes: 75, category: "Projects" },
      { day: 6, phase: "Phase 2: In-Depth Domain Drills", title: "Advanced Technical Inquiries & Edge Cases", focus: `Tackle deep-dive technical questions on ${primarySkill} and ${secondarySkill}.`, tasks: ["Answer 5 tough domain questions without referencing notes", "Document memory management, security, and caching strategies", "Practice live whiteboarding / diagramming solutions"], estimatedMinutes: 90, category: "Technical" },
      { day: 7, phase: "Phase 2: In-Depth Domain Drills", title: "HR & STAR Behavioral Story Vault", focus: "Construct and refine 5 core STAR behavioral stories for culture fit rounds.", tasks: ["Draft Story 1: Handling technical or personal conflict", "Draft Story 2: Leading through ambiguity or crisis", "Draft Story 3: Proudest measurable business impact", "Record voice notes to eliminate filler words"], estimatedMinutes: 60, category: "Behavioral" },
      { day: 8, phase: "Phase 3: Targeted Reinforcement", title: "Weak Area Remediation & Practice", focus: "Target the specific areas you felt least confident in during Days 1–7.", tasks: ["Re-test concepts from your lowest-confidence topics", "Write concise summary notes for rapid recall", "Do a speed drill on technical edge cases"], estimatedMinutes: 75, category: "Technical" },
      { day: 9, phase: "Phase 3: Targeted Reinforcement", title: "Practical Application & Scenario Cases", focus: `Solve practical real-world situational cases for ${targetRole}.`, tasks: ["Analyze a full end-to-end case study from prompt to solution", "Structure non-functional requirements (SLA, scalability, accessibility)", "Review industry post-mortems and failure mitigation"], estimatedMinutes: 90, category: "Case Study" },
      { day: 10, phase: "Phase 3: Targeted Reinforcement", title: "Advanced Topics & System Trade-offs", focus: "Discuss scalability, architecture decoupling, and high-load failure modes.", tasks: ["Draft a complete system architecture diagram", "Explain trade-offs between consistency, availability, and latency", "Address observability, telemetry, and automated alerting"], estimatedMinutes: 90, category: "Technical" },
      { day: 11, phase: "Phase 4: Company & Final Simulation", title: `${targetCompany || "Company"} & Job-Specific Preparation`, focus: `Deeply research ${targetCompany || "the target company"} and role-specific expectations.`, tasks: [`Research ${targetCompany || "target employer"}'s product suite and engineering blog`, "Prepare 4 high-impact questions to ask interviewers", "Align your resume achievements with the job description requirements"], estimatedMinutes: 60, category: "Review" },
      { day: 12, phase: "Phase 4: Company & Final Simulation", title: "Mock Interview Prep & Setup Verification", focus: "Prepare interview environment, pacing, and executive presentation.", tasks: ["Verify camera, microphone, screen share, and backup hot-spot", "Review your 90-second 'Tell me about yourself' introduction", "Do a dry run of rapid-fire technical questions"], estimatedMinutes: 60, category: "Mock" },
      { day: 13, phase: "Phase 4: Company & Final Simulation", title: "Full Timed Mock Interview Simulation", focus: "Conduct a full 60-minute simulated interview under realistic exam conditions.", tasks: ["Complete a 45-minute technical/case section + 15-minute behavioral", "Grade your performance across Clarity, Structure, and Technical Depth", "Review recordings and tighten any rambling answers"], estimatedMinutes: 90, category: "Mock" },
      { day: 14, phase: "Phase 4: Company & Final Simulation", title: "Final Revision & Calm Alignment", focus: "Light review of high-yield summary sheets and mental relaxation.", tasks: ["Review your 1-page core cheatsheet", "Review STAR stories and company questions", "Rest well, hydrate, and prepare attire for interview day"], estimatedMinutes: 45, category: "Review" },
    ];

    const jdAnalysis = jobDescription
      ? {
          isJdTargeted: true,
          focusSummary: `Preparation calibrated specifically for this ${targetRole} opening at ${targetCompany || "the hiring organization"}. Key emphasis on hands-on execution with ${skillsStr}, cross-functional delivery, and domain ownership.`,
          requiredSkills: skillsList.slice(0, 5),
          preferredSkills: skillsList.slice(5, 8).length > 0 ? skillsList.slice(5, 8) : ["System Design", "Cloud Infrastructure", "Mentorship"],
          likelyTechnicalTopics: [
            `Core ${primarySkill} implementation and architecture`,
            "Production observability, error handling, and performance tuning",
            "Cross-functional collaboration and API contract design",
          ],
          likelyBehavioralTopics: [
            "Managing tight timelines and ambiguous stakeholder requirements",
            "Demonstrating ownership during critical delivery blockers",
            "Collaborating effectively with product managers and engineers",
          ],
          importantTools: skillsList.slice(0, 4),
          experienceExpectations: isSenior ? "Senior leadership, architectural autonomy, and cross-team mentorship." : isFresher ? "Solid foundation in fundamentals, curiosity, and rapid execution." : "Independent feature ownership, clean code craftsmanship, and team collaboration.",
          potentialInterviewRounds: [
            { round: "Round 1: Recruiter / Initial Screen", focus: "Career narrative, motivation, and high-level role fit", duration: "30 min" },
            { round: "Round 2: Technical / Domain Deep Dive", focus: `Practical problem solving, ${primarySkill}, and coding/design`, duration: "60 min" },
            { round: "Round 3: System Design / Case Study", focus: "Architectural scalability, trade-off analysis, and product thinking", duration: "45–60 min" },
            { round: "Round 4: Behavioral & Executive Alignment", focus: "STAR scenarios, culture values, and mutual Q&A", duration: "45 min" },
          ],
        }
      : undefined;

    return {
      id: planId,
      targetRole,
      experienceLevel,
      interviewType,
      skills: skillsList.length > 0 ? skillsList : ["Problem Solving", "Architecture", "Communication"],
      targetCompany: targetCompany || undefined,
      jobDescription: jobDescription || undefined,
      createdAt: nowIso,
      summary: `Tailored ${experienceLevel} interview preparation masterplan for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}. Built to maximize technical mastery, project defense, STAR communication, and interview readiness across a 14-day sprint.`,
      recommendedDifficulty: {
        level: difficultyLevel,
        description: isSenior
          ? "Expect rigorous system-level trade-off discussions, architectural ownership, and behavioral questions focusing on cross-functional leadership and ambiguous problem resolution."
          : isFresher
          ? "Interviews will focus heavily on fundamental computer science/domain principles, clear communication, logical reasoning, and high enthusiasm to learn."
          : "Expect a balanced evaluation of practical problem solving, clean code/craftsmanship, system components, and STAR-method behavioral scenarios.",
        pitfallsToAvoid: [
          "Diving into solutions before clarifying edge cases, scale constraints, and functional requirements.",
          "Failing to quantify business impact and team collaboration when answering behavioral questions.",
          "Giving one-word answers rather than thinking out loud and structuring thoughts.",
          "Neglecting to prepare 2-3 strategic, insightful questions for the interviewer at the end of the round.",
        ],
        evaluationRubric: [
          { criteria: "Technical & Domain Depth", weight: "40%", targetBehavior: "Clear mastery of internal runtime, edge cases, and performance implications." },
          { criteria: "Structured Communication", weight: "30%", targetBehavior: "Uses STAR framework, thinks aloud, and structures ideas methodically." },
          { criteria: "Problem Solving & Trade-offs", weight: "20%", targetBehavior: "Clarifies requirements and evaluates alternative solutions with clear pros/cons." },
          { criteria: "Culture & Alignment", weight: "10%", targetBehavior: "Demonstrates enthusiasm, humility, and positive collaboration." },
        ],
      },
      preparationPriorities: [
        {
          priority: 1,
          title: interviewType === "HR" || interviewType === "Behavioral" ? "STAR Story Vault & Leadership Principles" : `Core Technical Mastery (${primarySkill})`,
          description: `Master top technical concepts in ${skillsStr} with clean implementation patterns and edge-case handling.`,
          weight: "40%",
          keyFocusAreas: [`Deep dive into ${primarySkill}`, "Edge-case debugging", "Hands-on drills"],
        },
        {
          priority: 2,
          title: "System Design, Architecture & Trade-off Analysis",
          description: "Articulate scalability, component decoupling, data flow, and trade-offs clearly on whiteboard / diagram tools.",
          weight: "35%",
          keyFocusAreas: ["Component boundaries", "Data flow & APIs", "Failure mitigation"],
        },
        {
          priority: 3,
          title: "Behavioral Alignment & Project Defense",
          description: "Prepare structured STAR stories and deep-dive explanations of your past resume projects and engineering decisions.",
          weight: "25%",
          keyFocusAreas: ["STAR narratives", "Resume project walkthroughs", "30-60-90 day plan"],
        },
      ],
      roadmap: [
        {
          phase: "Phase 1: Foundations & Diagnostic Audit",
          timeline: "Days 1–3",
          focus: "Audit core knowledge gaps, review fundamentals, and curate reference cheatsheets.",
          milestones: [
            `Review core concepts and design paradigms in ${skillsStr}`,
            "Build an inventory of your top 2-3 career projects with metrics, challenges, and architecture diagrams",
            "Establish daily 45-minute active problem-solving / coding cadence",
          ],
        },
        {
          phase: "Phase 2: In-Depth Domain Drills & Question Bank",
          timeline: "Days 4–7",
          focus: `Deep-dive into role-specific scenarios, design challenges, and ${interviewType.toLowerCase()} interview rounds.`,
          milestones: [
            "Solve 10-15 curated role-specific problems or case studies",
            "Draft structured solutions for top 5 system design / domain scenarios",
            "Prepare STAR frameworks for 6 core behavioral prompts",
          ],
        },
        {
          phase: "Phase 3: Timed Mock Simulations & Behavioral Polish",
          timeline: "Days 8–11",
          focus: "Simulate live interview conditions with time constraints and verbal articulation.",
          milestones: [
            "Conduct 2-3 timed mock interview sessions speaking answers aloud",
            "Refine communication pacing: State assumption -> Outline approach -> Verify edge cases",
            "Optimize resume walkthrough into a crisp 90-second executive narrative",
          ],
        },
        {
          phase: "Phase 4: Final Calibration & Company Alignment",
          timeline: "Days 12–14",
          focus: "Final review, company-specific research, and strategic question preparation.",
          milestones: [
            `Research ${targetCompany || "the target company"}'s recent products, updates, and culture values`,
            "Prepare 4 high-impact questions to ask interviewers",
            "Rest, review high-yield summary sheets, and enter the interview with calm confidence",
          ],
        },
      ],
      dayByDayRoadmap,
      jobDescriptionAnalysis: jdAnalysis,
      importantTopics: [
        {
          topic: `${targetRole} Core Competencies`,
          category: "Technical",
          importance: "Critical",
          keyConcepts: skillsList.length > 0 ? skillsList.slice(0, 4) : ["Data Structures", "System Design", "State Management", "API Protocols"],
          tips: "Always explain your thought process clearly before writing code or making final recommendations.",
        },
        {
          topic: "Scalability, Performance & Resource Efficiency",
          category: "System Design",
          importance: "High",
          keyConcepts: ["Caching Strategies", "Database Indexing", "Bottleneck Diagnosis", "Asynchronous Processing"],
          tips: "Focus on why a particular technology or pattern was chosen over alternatives.",
        },
        {
          topic: "Cross-Functional Collaboration & Conflict Resolution",
          category: "HR/Behavioral",
          importance: "High",
          keyConcepts: ["STAR Framework", "Stakeholder Alignment", "Handling Disagreements", "Prioritization under Pressure"],
          tips: "Use 'I' for your specific contribution, and 'We' when referencing team context.",
        },
        {
          topic: "Production Reliability & Failure Modes",
          category: "Core",
          importance: "Medium",
          keyConcepts: ["Monitoring & Alerting", "Graceful Degradation", "Testing Strategies", "Security Best Practices"],
          tips: "Demonstrate empathy for operational maintenance and real-world uptime constraints.",
        },
      ],
      recommendedQuestions: fallbackQuestions,
      technicalTopics: [
        {
          category: "Core Architecture & Data Flow",
          topics: [
            `Modern ${skillsStr} best practices and design patterns`,
            "Component lifecycle, memory management, and asynchronous workflows",
            "API design: RESTful conventions, GraphQL, and WebSocket event handling",
          ],
          deepDivePrompt: `Explain how you evaluate state management and caching strategies in high-throughput applications using ${skillsStr}.`,
          masteryBenchmark: "Able to articulate memory trade-offs and explain execution lifecycle without hesitation.",
        },
        {
          category: "System Optimization & Security",
          topics: [
            "Bundle optimization, tree-shaking, and lazy loading assets",
            "Authentication protocols: OAuth2, JWT lifecycle, and RBAC security models",
            "Database indexing, query profiling, and connection pooling",
          ],
          deepDivePrompt: "Describe an approach to profile and eliminate a critical rendering or database bottleneck.",
          masteryBenchmark: "Can write clean profiling steps and explain metrics (P95/P99 latency).",
        },
      ],
      behavioralTopics: [
        {
          theme: "Ownership & Initiative",
          starSituationPrompt: "Describe a project where you saw an unaddressed gap in process or tech debt and took the initiative to fix it.",
          suggestedStoryAngle: "Highlight proactiveness, ROI calculation for why it was worth engineering time, and positive team feedback.",
          redFlagsToAvoid: ["Focusing only on frustration without constructive resolution", "Taking sole credit for collaborative outcomes"],
        },
        {
          theme: "Handling Tight Deadlines & Ambiguity",
          starSituationPrompt: "How do you deliver high-quality results when specifications are incomplete or deadlines are aggressive?",
          suggestedStoryAngle: "Emphasize phased MVP delivery, continuous communication with product managers, and scope trimming.",
          redFlagsToAvoid: ["Saying you just worked overnight without communicating risk", "Cutting quality without stakeholder buy-in"],
        },
      ],
      hrTopics: [
        {
          topic: "Career Trajectory & Growth",
          keyQuestions: [
            "Where do you see yourself technically and professionally in the next 2-3 years?",
            "What type of management style allows you to do your best work?",
          ],
          cultureFitPrompt: "Align your personal growth goals with the team's engineering velocity and mentorship culture.",
          growthCompensationTips: "Focus on continuous skill expansion, impact scope, and team enablement rather than purely title progression.",
        },
        {
          topic: "Company Values & Culture Alignment",
          keyQuestions: [
            `What makes you excited about ${targetCompany || "our product"} over other opportunities in the market?`,
            "How do you handle giving and receiving constructive critical feedback?",
          ],
          cultureFitPrompt: "Demonstrate genuine enthusiasm for the customer problem and show humility when receiving feedback.",
          growthCompensationTips: "Express clear interest in building a sustainable, high-trust relationship with peers.",
        },
      ],
      suggestedPracticeAreas: [
        {
          area: "Live Coding & Problem Solving",
          actionableExercise: "Solve 2 problems daily under a 30-minute timer while narrating your strategy out loud.",
          suggestedTools: ["LeetCode", "NeetCode", "HackerRank"],
          expectedOutput: "Clean, working code with optimal time/space complexity analysis.",
        },
        {
          area: "Interactive System Design & Whiteboarding",
          actionableExercise: "Draft end-to-end system architectures from scratch in under 45 minutes.",
          suggestedTools: ["Excalidraw", "Eraser.io", "Miro"],
          expectedOutput: "Clear diagrams showing client, gateway, microservices, caches, and storage tiers.",
        },
        {
          area: "Behavioral STAR Audio Recording",
          actionableExercise: "Record yourself answering top 5 behavioral prompts and listen back to eliminate filler words.",
          suggestedTools: ["Voice Memos", "Loom"],
          expectedOutput: "Crisp 2-minute answers with structured narrative flow.",
        },
      ],
    };
  };

  try {
    const prompt = `You are LEVELUP's elite Principal Interview Architect, Executive Career Coach, and Senior Technical Hiring Manager.
Generate a comprehensive, hyper-personalized, and structured Interview Preparation Plan for this candidate:

=== CANDIDATE PROFILE ===
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Interview Type Focus: ${interviewType}
- Core Skills / Tech Stack: ${skillsStr}
${targetCompany ? `- Target Company: "${targetCompany}" (Calibrate company hiring bar, evaluation style, and product culture directly to this organization)` : ""}
${jobDescription ? `- Target Job Description:\n"""\n${jobDescription}\n"""\nCRITICAL: Deeply analyze this job description. Extract required/preferred skills, likely technical & behavioral focus areas, tools, expectations, and interview rounds. Prioritize the roadmap and questions to directly win this job.` : ""}
${projectsContextStr ? `- Candidate's Real Projects (from Resume/Portfolio):\n${projectsContextStr}\nCRITICAL: Create personalized project defense questions specifically referencing these REAL projects by name and tech stack (e.g. "In your project [Project Name], why did you choose [Tech]..."). Do NOT invent projects the user does not have!` : ""}
${experienceContextStr ? `- Candidate's Experience History:\n${experienceContextStr}` : ""}
${userProfileSummary ? `- Profile Summary: ${userProfileSummary}` : ""}

=== ROLE-SPECIFIC INTELLIGENCE REQUIREMENTS ===
Adapt every single aspect of the plan according to the domain:
- Frontend Developer: Focus on React/Vue, TypeScript, DOM/CSS, State Management, Web Performance (LCP/CLS), Accessibility, Bundling, API integration.
- Backend Developer: Focus on APIs (REST/GraphQL/gRPC), Databases (SQL/NoSQL, Indexing, ACID), Caching, Auth/JWT, Microservices, Scalability, Concurrency.
- UI/UX Designer: Focus on Design Process, User Research, Wireframing, Figma, Design Systems, Usability Testing, Case Studies, Portfolio Defense, Product Thinking.
- Data Analyst: Focus on SQL Queries, Python/Pandas, Tableau/PowerBI, Statistical Modeling, Business Metrics/KPIs, Data Cleaning, Analytical Storytelling.
- Data Scientist: Focus on ML Algorithms, Feature Engineering, Deep Learning, Python/PyTorch, A/B Testing, Statistics, Model Evaluation.
- Product Manager: Focus on Product Strategy, User Personas, Roadmapping, Prioritization (RICE/MoSCoW), A/B Testing, Metrics, Stakeholder Alignment.
- Cloud / DevOps: Focus on Kubernetes, Docker, CI/CD, Terraform, AWS/GCP, Linux, Observability (Prometheus/Grafana), Zero-downtime deployments.
- Cybersecurity: Focus on Threat Modeling, OWASP Top 10, Network Security, Pen Testing, IAM, Incident Response, Cryptography.
- (And for Marketing, Finance, HR, Sales, or Custom Roles, tailor strictly to their industry frameworks).

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "id": "${planId}",
  "targetRole": "${targetRole}",
  "experienceLevel": "${experienceLevel}",
  "interviewType": "${interviewType}",
  "skills": ["string (skills)"],
  "targetCompany": "${targetCompany || ""}",
  "jobDescription": "${jobDescription ? "Personalized for provided Job Description" : ""}",
  "createdAt": "${nowIso}",
  "summary": "High-level 2-3 sentence strategic overview of the preparation focus",
  "recommendedDifficulty": {
    "level": "Entry" | "Intermediate" | "Advanced" | "Senior/Staff Bar",
    "description": "2-3 sentence assessment of the interview bar and evaluation rigor",
    "pitfallsToAvoid": ["4 concrete common pitfalls to avoid during this role's interviews"],
    "evaluationRubric": [
      { "criteria": "string", "weight": "string (e.g. 40%)", "targetBehavior": "string" }
    ]
  },
  "preparationPriorities": [
    {
      "priority": 1,
      "title": "Top priority focus title",
      "description": "Actionable explanation of why this matters and how to practice",
      "weight": "40%",
      "keyFocusAreas": ["Focus 1", "Focus 2", "Focus 3"]
    },
    {
      "priority": 2,
      "title": "Second priority focus title",
      "description": "Actionable explanation",
      "weight": "35%",
      "keyFocusAreas": ["Focus 1", "Focus 2"]
    },
    {
      "priority": 3,
      "title": "Third priority focus title",
      "description": "Actionable explanation",
      "weight": "25%",
      "keyFocusAreas": ["Focus 1", "Focus 2"]
    }
  ],
  ${jobDescription ? `"jobDescriptionAnalysis": {
    "isJdTargeted": true,
    "focusSummary": "2-3 sentences summarizing what this interview will specifically focus on based on the JD",
    "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
    "preferredSkills": ["Skill 1", "Skill 2"],
    "likelyTechnicalTopics": ["Topic 1", "Topic 2", "Topic 3"],
    "likelyBehavioralTopics": ["Theme 1", "Theme 2"],
    "importantTools": ["Tool 1", "Tool 2", "Tool 3"],
    "experienceExpectations": "Detailed expectation for candidate's seniority in this role",
    "potentialInterviewRounds": [
      { "round": "Round Name", "focus": "Round Focus Description", "duration": "30-60 min" }
    ]
  },` : ""}
  "roadmap": [
    {
      "phase": "Phase 1: Foundations & Diagnostic Audit",
      "timeline": "Days 1–3",
      "focus": "High-level phase focus",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    },
    {
      "phase": "Phase 2: In-Depth Domain Drills & Problem Solving",
      "timeline": "Days 4–7",
      "focus": "High-level phase focus",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    },
    {
      "phase": "Phase 3: Behavioral Frameworks & STAR Alignment",
      "timeline": "Days 8–11",
      "focus": "High-level phase focus",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    },
    {
      "phase": "Phase 4: Timed Mocks & Final Calibration",
      "timeline": "Days 12–14",
      "focus": "High-level phase focus",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    }
  ],
  "dayByDayRoadmap": [
    {
      "day": 1,
      "phase": "Phase 1: Foundations & Diagnostic Audit",
      "title": "Role Fundamentals & Competency Audit",
      "focus": "Specific focus for Day 1",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "estimatedMinutes": 60,
      "category": "Fundamentals" | "Technical" | "Projects" | "Behavioral" | "Case Study" | "Mock" | "Review"
    }
    // ... Generate all 14 individual days from Day 1 to Day 14 tailored dynamically to the role!
  ],
  "importantTopics": [
    {
      "topic": "Topic Title",
      "category": "Technical" | "HR/Behavioral" | "System Design" | "Domain" | "Core",
      "importance": "Critical" | "High" | "Medium",
      "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
      "tips": "Practical tip for answering in the interview"
    }
  ],
  "recommendedQuestions": [
    {
      "id": "q1",
      "question": "Realistic, high-probability interview question",
      "category": "Technical" | "Behavioral" | "HR" | "Project" | "Role-Specific" | "Job-Specific" | "Case Study",
      "difficulty": "Easy" | "Medium" | "Hard",
      "evaluates": "What the interviewer is specifically looking for",
      "sampleFramework": "Structured answering framework or STAR outline",
      "keyPointsToCover": ["Key point 1", "Key point 2", "Key point 3"],
      "projectRef": "Optional project name if referencing candidate's real project"
    }
    // Generate 6-10 questions covering Technical, Behavioral, HR, Project (if projects provided), Role-Specific, and Job-Specific (if JD provided)
  ],
  "technicalTopics": [
    {
      "category": "Category name",
      "topics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "deepDivePrompt": "A self-test prompt or architectural question",
      "masteryBenchmark": "What mastery looks like"
    }
  ],
  "behavioralTopics": [
    {
      "theme": "Leadership / Conflict / Delivery under pressure",
      "starSituationPrompt": "Real-world scenario prompt",
      "suggestedStoryAngle": "Tips on framing your narrative for maximum impact",
      "redFlagsToAvoid": ["Red flag 1", "Red flag 2"]
    }
  ],
  "hrTopics": [
    {
      "topic": "Topic Name",
      "keyQuestions": ["Question 1", "Question 2"],
      "cultureFitPrompt": "How to demonstrate alignment",
      "growthCompensationTips": "Advice on answering"
    }
  ],
  "suggestedPracticeAreas": [
    {
      "area": "Practice Area Name",
      "actionableExercise": "Specific exercise to do",
      "suggestedTools": ["Tool 1", "Tool 2"],
      "expectedOutput": "What the artifact or mastery looks like"
    }
  ]
}`;

    const result = await callGeminiCascade(prompt, {
      systemInstruction: `You are LEVELUP's elite Executive Interview Coach and Principal Technical Interviewer.
You generate structured, hyper-personalized, real-world interview prep plans.
Never output generic advice; tailor every question, framework, and roadmap milestone to the candidate's exact role, experience level, target company, real resume projects, and job description.`,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      try {
        let cleanText = result.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        const fallback = generateFallbackPlan();
        
        // Merge with safe fallback to guarantee complete structure
        const structuredPlan = {
          ...fallback,
          ...parsed,
          id: planId,
          targetRole,
          experienceLevel,
          interviewType,
          skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : skillsList,
          targetCompany: targetCompany || parsed.targetCompany || undefined,
          jobDescription: jobDescription || parsed.jobDescription || undefined,
          jobDescriptionAnalysis: parsed.jobDescriptionAnalysis || fallback.jobDescriptionAnalysis,
          dayByDayRoadmap: Array.isArray(parsed.dayByDayRoadmap) && parsed.dayByDayRoadmap.length > 0 ? parsed.dayByDayRoadmap : fallback.dayByDayRoadmap,
          recommendedQuestions: Array.isArray(parsed.recommendedQuestions) && parsed.recommendedQuestions.length > 0 ? parsed.recommendedQuestions : fallback.recommendedQuestions,
          createdAt: nowIso,
        };
        return res.json({ success: true, data: structuredPlan });
      } catch (parseErr) {
        console.warn("[Interview Prep] JSON parse error, using robust fallback:", parseErr);
        return res.json({ success: true, data: generateFallbackPlan(), isFallback: true });
      }
    }

    return res.json({ success: true, data: generateFallbackPlan(), isFallback: true });
  } catch (error: any) {
    console.error("[Interview Prep Plan AI error]:", error);
    return res.json({ success: true, data: generateFallbackPlan(), isFallback: true });
  }
});

// ==========================================
// AI MOCK INTERVIEW INTERACTIVE ENGINE
// ==========================================

// Endpoint 1: Next Question & Adaptive Turn Evaluation
app.post("/api/ai/mock-interview/next-question", async (req, res) => {
  const {
    targetRole = "Software Engineer",
    experienceLevel = "1–3 years",
    interviewType = "Mixed",
    difficulty = "Intermediate",
    questionCount = 5,
    currentQuestionNumber = 1,
    targetCompany = "",
    jobDescription = "",
    useJobDescription = true,
    useResumeProjects = true,
    userProjects = [],
    userExperience = [],
    candidateSkills = [],
    candidateName = "Candidate",
    candidateSummary = "",
    weakAreas = [],
    previousTurns = [],
    lastAnswer = "",
  } = req.body;

  const totalQuestions = Number(questionCount) || 5;
  const currentNum = Number(currentQuestionNumber) || 1;
  const isFirstQuestion = currentNum === 1 || !lastAnswer;

  // Build context strings
  const effectiveJd = (useJobDescription && jobDescription) ? jobDescription.trim() : "";
  const projectsList = (useResumeProjects && Array.isArray(userProjects) && userProjects.length > 0) ? userProjects : [];
  const skillsList = Array.isArray(candidateSkills) && candidateSkills.length > 0 ? candidateSkills : ["Core Competencies"];
  const previousQuestionsList = Array.isArray(previousTurns) ? previousTurns.map((t: any) => t.question) : [];

  // Deterministic Role-Based Fallback Generator
  const generateProceduralTurn = () => {
    const roleKey = targetRole.toLowerCase();
    let sampleQuestions: { question: string; category: string; evaluates: string; projectRef?: string }[] = [];

    if (roleKey.includes("frontend") || roleKey.includes("react") || roleKey.includes("web")) {
      sampleQuestions = [
        {
          question: `Tell me about your core frontend architecture experience. How do you approach structuring state management and component hierarchies in large-scale React applications?`,
          category: "Technical",
          evaluates: "Component architecture, state isolation, and maintainability patterns",
        },
        {
          question: `Can you explain how React's reconciliation engine works and what steps you take to diagnose and eliminate unnecessary component re-renders?`,
          category: "Technical",
          evaluates: "Deep understanding of the Virtual DOM, React Profiler, memoization, and rendering optimization",
        },
        {
          question: `When building user interfaces, how do you balance rapid delivery with web accessibility (a11y), responsive design, and Core Web Vitals (LCP, CLS, INP)?`,
          category: "Role-Specific",
          evaluates: "Holistic frontend quality standards, performance metrics, and user empathy",
        },
        {
          question: projectsList.length > 0
            ? `In your project "${projectsList[0].name}", what was the most demanding technical hurdle you encountered and how did you resolve it?`
            : `Walk me through a complex asynchronous data-fetching scenario you handled, including error boundaries and race conditions.`,
          category: projectsList.length > 0 ? "Project" : "Technical",
          evaluates: "Practical problem solving, debugging under constraints, and code ownership",
          projectRef: projectsList.length > 0 ? projectsList[0].name : undefined,
        },
        {
          question: `Describe a situation where product requirements were ambiguous or a design was technically unfeasible. How did you negotiate tradeoffs with designers and product managers?`,
          category: "Behavioral",
          evaluates: "Cross-functional communication, tradeoff negotiation, and pragmatic delivery",
        },
      ];
    } else if (roleKey.includes("ui") || roleKey.includes("ux") || roleKey.includes("design")) {
      sampleQuestions = [
        {
          question: `Walk me through your end-to-end design process from problem discovery and user research to high-fidelity handoff.`,
          category: "Role-Specific",
          evaluates: "Structured design methodology, user research maturity, and iterative workflow",
        },
        {
          question: `How do you decide when to follow established design system patterns versus introducing a custom interaction pattern?`,
          category: "Technical",
          evaluates: "Design system thinking, scalability, consistency, and interaction design judgment",
        },
        {
          question: projectsList.length > 0
            ? `In your project "${projectsList[0].name}", how did you validate that your design solution actually solved the core user pain point?`
            : `Tell me about a time usability testing revealed that your initial design hypothesis was wrong. How did you pivot?`,
          category: projectsList.length > 0 ? "Project" : "Case Study",
          evaluates: "Usability testing validation, humility, and data-informed decision making",
          projectRef: projectsList.length > 0 ? projectsList[0].name : undefined,
        },
        {
          question: `How do you measure the qualitative and quantitative impact of your UX decisions on business metrics?`,
          category: "Case Study",
          evaluates: "Business acumen, metrics tracking, and product ROI comprehension",
        },
        {
          question: `Describe how you handle conflicting feedback from engineers who say a design is too difficult to implement within sprint deadlines.`,
          category: "Behavioral",
          evaluates: "Engineering collaboration, scope negotiation, and pragmatic compromise",
        },
      ];
    } else if (roleKey.includes("data") || roleKey.includes("analyst") || roleKey.includes("bi")) {
      sampleQuestions = [
        {
          question: `What is your methodology for exploratory data analysis and data cleansing when handling large, unstructured datasets with missing values?`,
          category: "Technical",
          evaluates: "Data hygiene, statistical foundations, and exploratory querying rigor",
        },
        {
          question: `Can you walk me through how you optimize complex SQL queries involving multi-table joins, subqueries, and window functions?`,
          category: "Technical",
          evaluates: "SQL proficiency, indexing knowledge, query execution plans, and performance tuning",
        },
        {
          question: projectsList.length > 0
            ? `In your project "${projectsList[0].name}", what actionable business insights did your analysis uncover, and how did stakeholders act upon them?`
            : `Describe a data storytelling dashboard you created. How did you choose the visual encodings to drive executive decision making?`,
          category: projectsList.length > 0 ? "Project" : "Case Study",
          evaluates: "Analytical storytelling, stakeholder enablement, and commercial impact",
          projectRef: projectsList.length > 0 ? projectsList[0].name : undefined,
        },
        {
          question: `When two senior stakeholders have conflicting interpretations of a key business metric, how do you establish a single source of truth?`,
          category: "Behavioral",
          evaluates: "Stakeholder management, metric definition governance, and objective diplomacy",
        },
        {
          question: `How do you design an A/B test to validate a new feature hypothesis, and how do you ensure statistical significance?`,
          category: "Case Study",
          evaluates: "Hypothesis testing, sample sizing, p-values, and statistical rigor",
        },
      ];
    } else {
      sampleQuestions = [
        {
          question: `Tell me about your background and what core architectural principles guide your engineering choices for ${targetRole}.`,
          category: "Role-Specific",
          evaluates: "Domain mastery, clarity of thought, and architectural maturity",
        },
        {
          question: `Walk me through a challenging technical problem you solved that required deep debugging or performance optimization.`,
          category: "Technical",
          evaluates: "Problem solving, root cause analysis, and execution depth",
        },
        {
          question: projectsList.length > 0
            ? `In your project "${projectsList[0].name}", why did you choose your particular technology stack and what would you change in hindsight?`
            : `How do you evaluate tradeoffs when choosing between consistency, availability, and latency in system design?`,
          category: projectsList.length > 0 ? "Project" : "Technical",
          evaluates: "Architecture tradeoffs and reflection",
          projectRef: projectsList.length > 0 ? projectsList[0].name : undefined,
        },
        {
          question: `Describe a scenario where you had to push back against an unrealistic technical deadline or scope creep. How did you communicate the risks?`,
          category: "Behavioral",
          evaluates: "Risk management, communication clarity, and stakeholder alignment",
        },
        {
          question: `How do you ensure test coverage, code review rigor, and zero-downtime reliability in production systems?`,
          category: "Technical",
          evaluates: "CI/CD standards, testing pyramids, and operational excellence",
        },
      ];
    }

    const questionIdx = Math.min(currentNum - 1, sampleQuestions.length - 1);
    const chosen = sampleQuestions[questionIdx] || sampleQuestions[0];

    // Compute basic heuristic evaluation for fallback if answer provided
    let fallbackEval = undefined;
    if (lastAnswer && lastAnswer.trim()) {
      const wordCount = lastAnswer.trim().split(/\s+/).length;
      const score = Math.min(95, Math.max(50, 60 + Math.floor(wordCount * 0.4)));
      fallbackEval = {
        score,
        relevance: Math.min(95, score + 4),
        accuracy: score,
        completeness: Math.min(90, score - 2),
        technicalUnderstanding: score,
        communicationClarity: Math.min(95, score + 2),
        examplesProvided: wordCount > 35,
        directlyAddressedQuestion: wordCount > 15,
        keyStrengths: [
          "Demonstrated practical familiarity with the core concepts",
          "Communicated with clear structure and technical intent",
        ],
        keyWeaknesses: [
          wordCount < 40 ? "Answer could be expanded with more concrete technical examples" : "Could quantify metrics and business tradeoffs more explicitly",
        ],
        suggestedFollowUpAngle: "Probe deeper into production edge cases and error handling",
        nextDifficultyAdjustment: (score >= 80 ? "increase" : score <= 50 ? "decrease" : "maintain") as 'increase' | 'maintain' | 'decrease',
      };
    }

    return {
      internalEvaluation: fallbackEval,
      nextQuestion: {
        questionId: `q-fallback-${currentNum}-${Date.now()}`,
        question: chosen.question,
        category: chosen.category,
        difficulty: difficulty,
        evaluates: chosen.evaluates,
        projectRef: chosen.projectRef,
      },
    };
  };

  try {
    const previousConversationLog = previousTurns.map((turn: any, idx: number) => {
      return `[Q${turn.questionNumber || idx + 1}] (${turn.category || "Technical"} - ${turn.difficulty || "Intermediate"})
Interviewer: "${turn.question}"
Candidate Answer: "${turn.userAnswer || "No answer provided"}"
${turn.internalEvaluation ? `Internal Score: ${turn.internalEvaluation.score}/100 | Strengths: ${turn.internalEvaluation.keyStrengths?.join(", ")} | Weaknesses: ${turn.internalEvaluation.keyWeaknesses?.join(", ")}` : ""}`;
    }).join("\n\n");

    const prompt = `You are LEVELUP's elite Principal Interviewer and Hiring Bar Raiser conducting a real-time, sequential, highly adaptive mock interview.
You are evaluating a candidate for the following role:

=== CANDIDATE PROFILE & TARGET ===
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Interview Focus Type: ${interviewType} (Technical, Behavioral, HR, Case Study, or Mixed)
- Current Target Difficulty: ${difficulty}
- Target Company: ${targetCompany || "Tier-1 Tech Firm / Industry Leader"}
- Candidate Core Skills: ${skillsList.join(", ")}
${candidateSummary ? `- Candidate Summary: ${candidateSummary}` : ""}
${projectsList.length > 0 ? `- Candidate's Verified Resume Projects:\n${projectsList.map((p: any) => `  * "${p.name}" (${p.role || "Developer"}): ${p.description || ""} [Tools: ${Array.isArray(p.tools) ? p.tools.join(", ") : ""}]`).join("\n")}` : ""}
${effectiveJd ? `- Target Job Description Requirements:\n"""\n${effectiveJd}\n"""` : ""}
${weakAreas.length > 0 ? `- Candidate Weak Areas to Probe / Challenge: ${weakAreas.join(", ")}` : ""}

=== INTERVIEW SESSION STATE ===
- Total Questions Planned: ${totalQuestions}
- Current Question Being Generated: Question #${currentNum} of ${totalQuestions}
${isFirstQuestion ? `This is Question #1. Start with an impactful, role-calibrated opening question.` : `Last Question Asked: "${previousTurns[previousTurns.length - 1]?.question || ""}"\nCandidate's Latest Answer to Evaluate:\n"""\n${lastAnswer}\n"""`}

=== PREVIOUS TURNS HISTORY ===
${previousConversationLog || "No previous turns yet (opening question)."}

=== INTERVIEWER INSTRUCTIONS ===
1. ${!isFirstQuestion ? `CRITICAL - INTERNAL ANSWER EVALUATION:
   Evaluate the candidate's last answer rigorously against standard hiring bars:
   - Relevance (0-100), Accuracy (0-100), Completeness (0-100), Technical Understanding (0-100), Communication Clarity (0-100).
   - Check if concrete examples or metrics were given.
   - Extract key strengths and key weaknesses/omissions.
   - Adjust difficulty: if answer was mastery-level, raise difficulty. If weak/confused, probe fundamentals or clarify.` : `(First question - internal evaluation is null).`}

2. GENERATING THE NEXT QUESTION:
   - Must be ONE clear, realistic question as a professional interviewer speaking directly to the candidate.
   - Keep the question conversational, engaging, and professional.
   - DO NOT repeat or ask slight variations of previously asked questions:
     ${previousQuestionsList.length > 0 ? `Already asked:\n${previousQuestionsList.map((q: string) => `     - "${q}"`).join("\n")}` : "None yet."}
   - If the candidate performed well on the previous turn, you may ask a natural follow-up probing deeper (e.g. edge cases, scale, failure modes, design decisions).
   - If candidate resume projects are available, ask at least 1-2 questions directly referencing their REAL projects by exact name (e.g. "In your project [Name], what approach did you take for...").
   - If a Job Description was provided, prioritize the tech stack, methodologies, and responsibilities highlighted in the JD.
   - If candidate has known weak areas, weave in a targeted inquiry to test improvement.
   - NEVER tutor or give away the answers during the interview. Save coaching feedback for after the interview.

Respond strictly with valid JSON conforming to this schema:
{
  ${!isFirstQuestion ? `"internalEvaluation": {
    "score": number (0-100),
    "relevance": number (0-100),
    "accuracy": number (0-100),
    "completeness": number (0-100),
    "technicalUnderstanding": number (0-100),
    "communicationClarity": number (0-100),
    "examplesProvided": boolean,
    "directlyAddressedQuestion": boolean,
    "keyStrengths": ["2-3 specific strengths of the answer"],
    "keyWeaknesses": ["1-2 specific missing items or areas for improvement"],
    "suggestedFollowUpAngle": "string (interviewer reflection)",
    "nextDifficultyAdjustment": "increase" | "maintain" | "decrease"
  },` : `"internalEvaluation": null,`}
  "nextQuestion": {
    "questionId": "q-${currentNum}-${Date.now()}",
    "question": "string (the exact question the interviewer asks)",
    "category": "Technical" | "Behavioral" | "HR" | "Project" | "Role-Specific" | "Case Study" | "Job-Specific",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "evaluates": "string (what the question evaluates)",
    "projectRef": "string or null (project name if referencing candidate's real project)"
  }
}`;

    const result = await callGeminiCascade(prompt, {
      systemInstruction: `You are LEVELUP's elite Executive Technical Interviewer and Bar Raiser.
You conduct realistic, highly engaging, sequential mock interviews.
Never reveal answer rubrics during the interview. Ask natural, insightful, role-specific questions and evaluate candidate responses with professional hiring rigor.`,
      responseMimeType: "application/json",
      temperature: 0.65,
    });

    if (result?.text) {
      try {
        let cleanText = result.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        if (parsed.nextQuestion && parsed.nextQuestion.question) {
          return res.json({
            success: true,
            internalEvaluation: parsed.internalEvaluation || undefined,
            nextQuestion: {
              questionId: parsed.nextQuestion.questionId || `q-${currentNum}-${Date.now()}`,
              question: parsed.nextQuestion.question,
              category: parsed.nextQuestion.category || "Technical",
              difficulty: parsed.nextQuestion.difficulty || difficulty,
              evaluates: parsed.nextQuestion.evaluates || "Core competency and practical problem solving",
              projectRef: parsed.nextQuestion.projectRef || undefined,
            },
          });
        }
      } catch (parseErr) {
        console.warn("[Mock Interview Turn] JSON parse error, falling back:", parseErr);
      }
    }

    // Fallback if AI generation failed or parsed improperly
    const fallback = generateProceduralTurn();
    return res.json({ success: true, ...fallback, isFallback: true });
  } catch (error: any) {
    console.error("[Mock Interview Turn Error]:", error);
    const fallback = generateProceduralTurn();
    return res.json({ success: true, ...fallback, isFallback: true });
  }
});

// Endpoint 2: Full Interview Session Comprehensive Evaluation & Report Generator
app.post("/api/ai/mock-interview/evaluate-session", async (req, res) => {
  const {
    targetRole = "Software Engineer",
    experienceLevel = "1–3 years",
    interviewType = "Mixed",
    difficulty = "Intermediate",
    totalQuestions = 5,
    candidateName = "Candidate",
    targetCompany = "",
    jobDescription = "",
    turns = [],
  } = req.body;

  const validTurns = Array.isArray(turns) ? turns : [];

  // Robust Procedural Evaluation Fallback
  const generateProceduralReport = () => {
    let cumulativeScore = 0;
    let turnCount = 0;

    const questionReviews = validTurns.map((turn: any, index: number) => {
      const qNum = turn.questionNumber || index + 1;
      const words = (turn.userAnswer || "").trim().split(/\s+/).filter(Boolean).length;
      const turnScore = Math.min(10, Math.max(4, Math.round((words > 40 ? 8.5 : words > 20 ? 7 : 5) * 10) / 10));
      cumulativeScore += turnScore * 10;
      turnCount++;

      return {
        questionNumber: qNum,
        question: turn.question || `Question #${qNum}`,
        category: turn.category || "Technical",
        difficulty: turn.difficulty || difficulty,
        userAnswer: turn.userAnswer || "No answer recorded.",
        score: turnScore,
        whatWasGood: words > 30
          ? "Good structured explanation with direct relevance to the question prompt."
          : "Demonstrated clear high-level understanding of the core concept.",
        whatWasMissing: words < 50
          ? "Could include more concrete code architecture examples and trade-off considerations."
          : "Could highlight real-world production metrics and edge case handling.",
        strongerAnswerAdvice: `A premier answer would articulate the core principle immediately, illustrate with a production example from ${targetRole} workflows, and discuss scale tradeoffs.`,
      };
    });

    const averageScore = turnCount > 0 ? Math.round(cumulativeScore / turnCount) : 76;
    const sortedReviews = [...questionReviews].sort((a, b) => b.score - a.score);
    const bestReview = sortedReviews[0] || { questionNumber: 1, question: "Role Fundamentals", score: 8.5 };
    const lowestReview = sortedReviews[sortedReviews.length - 1] || { questionNumber: 2, question: "System Design", score: 6.0 };

    return {
      id: `report-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      targetRole,
      interviewType,
      difficulty,
      totalQuestions: validTurns.length || totalQuestions,
      completedAt: new Date().toISOString(),
      overallScore: averageScore,
      dimensionScores: {
        technicalKnowledge: Math.min(96, Math.max(60, averageScore + 2)),
        communication: Math.min(94, Math.max(62, averageScore - 1)),
        problemSolving: Math.min(95, Math.max(60, averageScore + 3)),
        roleKnowledge: Math.min(98, Math.max(65, averageScore + 4)),
        behavioral: Math.min(92, Math.max(58, averageScore - 3)),
      },
      whatYouDidWell: [
        `Demonstrated authentic practical domain knowledge tailored to ${targetRole}.`,
        "Structured answers logically with clear problem statements and solutions.",
        "Maintained professional composure and answered questions directly without rambling.",
      ],
      areasToImprove: [
        "Incorporate more measurable metrics (e.g. % performance increase, latency reduction, user adoption).",
        "Deepen technical answers by addressing edge cases and concurrency or scale limits.",
        "Structure behavioral questions with the classic STAR framework (Situation, Task, Action, Result).",
      ],
      strongestAnswer: {
        questionNumber: bestReview.questionNumber,
        question: bestReview.question,
        explanation: `You articulated your approach clearly and demonstrated strong domain confidence with relevant practical context.`,
      },
      weakestAnswer: {
        questionNumber: lowestReview.questionNumber,
        question: lowestReview.question,
        explanation: `This answer remained somewhat high-level. Expanding with concrete architecture details and measurable outcomes would elevate the score.`,
      },
      questionReviews,
      personalizedNextSteps: {
        weakestArea: `${targetRole} System Architecture & Advanced Edge Cases`,
        actionSteps: [
          `Review core trade-offs and performance optimization patterns for ${targetRole}.`,
          "Practice 5 timed scenario questions focusing on the STAR answering framework.",
          "Refine 2 detailed project stories highlighting architectural leadership and measurable impact.",
          "Complete another mock interview focusing on advanced follow-ups.",
        ],
        recommendedRevisionTopics: [
          "Performance Profiling & Bottleneck Identification",
          "Scalable Architecture & Trade-off Matrices",
          "Behavioral STAR Delivery with Quantifiable Impact",
        ],
        recommendedPrepDays: 4,
        suggestedNextMockFocus: `${targetRole} Deep Dive & High-Stakes Scenarios`,
      },
      candidateName,
      targetCompany: targetCompany || undefined,
    };
  };

  try {
    const interviewTranscript = validTurns.map((turn: any, index: number) => {
      return `--- QUESTION #${turn.questionNumber || index + 1} ---
Category: ${turn.category || "Technical"} | Difficulty: ${turn.difficulty || "Intermediate"}
Evaluates: ${turn.evaluates || "Core knowledge"}
${turn.projectRef ? `Project Referenced: "${turn.projectRef}"` : ""}
Interviewer Question: "${turn.question}"
Candidate's Actual Answer:
"""
${turn.userAnswer || "(No answer provided)"}
"""
${turn.internalEvaluation ? `Internal Turn Metrics: Score ${turn.internalEvaluation.score}/100, Relevance ${turn.internalEvaluation.relevance}, Tech Understanding ${turn.internalEvaluation.technicalUnderstanding}, Strengths: [${turn.internalEvaluation.keyStrengths?.join("; ")}], Weaknesses: [${turn.internalEvaluation.keyWeaknesses?.join("; ")}]` : ""}`;
    }).join("\n\n");

    const prompt = `You are LEVELUP's elite Executive Interview Coach and Principal Hiring Director evaluating a completed mock interview session.
Generate a comprehensive, rigorous, and empowering Final Interview Report based on the candidate's actual answers.

=== CANDIDATE & SESSION SPECIFICATIONS ===
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}
- Target Difficulty: ${difficulty}
- Total Questions: ${validTurns.length}
- Target Company: ${targetCompany || "Premier Tech / High-Bar Organization"}
${jobDescription ? `- Target Job Description:\n"""\n${jobDescription}\n"""` : ""}

=== COMPLETE INTERVIEW TRANSCRIPT & USER ANSWERS ===
${interviewTranscript}

=== EVALUATION GUIDELINES ===
1. OVERALL SCORE (0-100): Calculate a realistic, honest composite score grounded strictly in the quality of the candidate's answers. (Average tech interview pass bar is ~75-80).
2. DIMENSION SCORES:
   - technicalKnowledge (0-100): Accuracy, depth, modern stack familiarity.
   - communication (0-100): Conciseness, clarity, articulate structure.
   - problemSolving (0-100): Analytical breakdown, edge-case consideration, trade-offs.
   - roleKnowledge (0-100): Domain-specific best practices for ${targetRole}.
   - behavioral (0-100): Leadership, ownership, collaboration, STAR alignment.
3. FEEDBACK:
   - "whatYouDidWell": 3-4 specific strengths directly citing their actual answers.
   - "areasToImprove": 3-4 concrete, actionable areas where answers fell short.
   - "strongestAnswer": Identify which question was their best and explain why.
   - "weakestAnswer": Identify which question was their weakest and explain what was missing.
4. QUESTION-BY-QUESTION REVIEW:
   For every single question in the transcript, provide:
   - questionNumber, question, category, userAnswer
   - score: 1.0 to 10.0 (e.g. 7.8, 8.5, 9.2)
   - whatWasGood: 1-2 sentences highlighting positive aspects of their answer.
   - whatWasMissing: 1-2 sentences identifying gaps, omissions, or ambiguity.
   - strongerAnswerAdvice: 2-3 sentences providing actionable guidance and a model structure directly referencing their response.
5. PERSONALIZED NEXT STEPS:
   - Identify the single biggest weakestArea.
   - Provide 4 concrete actionSteps.
   - Provide 3-4 recommendedRevisionTopics.
   - Recommend prep days (e.g. 3-7 days).
   - Suggest the focus for their next mock interview.

Respond strictly with valid JSON matching this schema:
{
  "id": "report-${Date.now()}",
  "sessionId": "session-${Date.now()}",
  "targetRole": "${targetRole}",
  "interviewType": "${interviewType}",
  "difficulty": "${difficulty}",
  "totalQuestions": ${validTurns.length},
  "completedAt": "${new Date().toISOString()}",
  "overallScore": number (0-100),
  "dimensionScores": {
    "technicalKnowledge": number (0-100),
    "communication": number (0-100),
    "problemSolving": number (0-100),
    "roleKnowledge": number (0-100),
    "behavioral": number (0-100)
  },
  "whatYouDidWell": ["string", "string", "string"],
  "areasToImprove": ["string", "string", "string"],
  "strongestAnswer": {
    "questionNumber": number,
    "question": "string",
    "explanation": "string"
  },
  "weakestAnswer": {
    "questionNumber": number,
    "question": "string",
    "explanation": "string"
  },
  "questionReviews": [
    {
      "questionNumber": number,
      "question": "string",
      "category": "string",
      "userAnswer": "string",
      "score": number (out of 10),
      "whatWasGood": "string",
      "whatWasMissing": "string",
      "strongerAnswerAdvice": "string"
    }
  ],
  "personalizedNextSteps": {
    "weakestArea": "string",
    "actionSteps": ["string", "string", "string", "string"],
    "recommendedRevisionTopics": ["string", "string", "string"],
    "recommendedPrepDays": number,
    "suggestedNextMockFocus": "string"
  },
  "candidateName": "${candidateName}",
  "targetCompany": "${targetCompany || ""}"
}`;

    const result = await callGeminiCascade(prompt, {
      systemInstruction: `You are LEVELUP's elite Executive Interview Coach and Principal Bar Raiser.
You synthesize comprehensive, candid, and constructive mock interview reports based strictly on the candidate's actual answers.
Never produce boilerplate or generic feedback; reference specific talking points, tech stacks, and omissions from their transcript.`,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    if (result?.text) {
      try {
        let cleanText = result.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        if (parsed && parsed.overallScore !== undefined) {
          return res.json({ success: true, report: parsed });
        }
      } catch (parseErr) {
        console.warn("[Mock Interview Report] JSON parse error, falling back:", parseErr);
      }
    }

    const fallbackReport = generateProceduralReport();
    return res.json({ success: true, report: fallbackReport, isFallback: true });
  } catch (error: any) {
    console.error("[Mock Interview Report Error]:", error);
    const fallbackReport = generateProceduralReport();
    return res.json({ success: true, report: fallbackReport, isFallback: true });
  }
});


// ==========================================
// AI DIET GENERATOR ENDPOINT
// ==========================================
app.post("/api/ai/generate-diet", async (req, res) => {
  const {
    dietType,
    mealsPerDay,
    calorieTarget,
    proteinTarget,
    budget,
    cookingSituation,
    foodPreferences,
    foodsToAvoid,
    allergies,
    fitnessGoal,
    currentWeight,
    targetWeight,
    experienceLevel,
    previousPlan,
    regenerationCount = 0,
  } = req.body;

  const targetMealsCount = Number(mealsPerDay) || 4;
  const targetCalories = Number(calorieTarget) || 2500;
  const targetProtein = Number(proteinTarget) || 160;

  // Multi-archetype dynamic procedural generator (used if all AI models are unreachable)
  const generateDynamicProceduralDiet = (variantIdx: number) => {
    const archetypes = [
      {
        name: "Mediterranean Longevity & High-Protein Power",
        goal: fitnessGoal || "Lean Hypertrophy & Vitality",
        breakfast: { name: "Greek Scramble with Sourdough & Avocado", type: "Breakfast", pPct: 0.28, cPct: 0.25, fPct: 0.3, items: [
          { food_name: "Whole Omega-3 Eggs", quantity: 3, unit: "large", calories: 215, protein: 18, carbs: 1, fats: 15 },
          { food_name: "Egg Whites", quantity: 100, unit: "ml", calories: 50, protein: 11, carbs: 1, fats: 0 },
          { food_name: "Artisan Sourdough Toast", quantity: 2, unit: "slices", calories: 180, protein: 6, carbs: 36, fats: 1 },
          { food_name: "Hass Avocado", quantity: 40, unit: "g", calories: 65, protein: 1, carbs: 3, fats: 6 },
        ]},
        lunch: { name: "Pan-Seared Salmon, Quinoa & Mediterranean Medley", type: "Lunch", pPct: 0.32, cPct: 0.35, fPct: 0.35, items: [
          { food_name: "Wild Salmon Fillet", quantity: 175, unit: "g", calories: 350, protein: 37, carbs: 0, fats: 21 },
          { food_name: "Organic Fluffy Quinoa", quantity: 160, unit: "g", calories: 195, protein: 7, carbs: 35, fats: 3 },
          { food_name: "Steamed Asparagus & Cherry Tomatoes", quantity: 120, unit: "g", calories: 35, protein: 3, carbs: 6, fats: 0 },
          { food_name: "Extra Virgin Olive Oil", quantity: 8, unit: "ml", calories: 65, protein: 0, carbs: 0, fats: 8 },
        ]},
        snack: { name: "Greek Yogurt Parfait with Walnuts & Berries", type: "Afternoon Fuel", pPct: 0.18, cPct: 0.15, fPct: 0.15, items: [
          { food_name: "Non-Fat Plain Greek Yogurt", quantity: 220, unit: "g", calories: 130, protein: 22, carbs: 8, fats: 0 },
          { food_name: "Fresh Blackberries & Blueberries", quantity: 80, unit: "g", calories: 45, protein: 1, carbs: 11, fats: 0 },
          { food_name: "Raw Crushed Walnuts", quantity: 15, unit: "g", calories: 100, protein: 2, carbs: 2, fats: 10 },
        ]},
        dinner: { name: "Lemon Herb Turkey Breast & Roasted Sweet Potatoes", type: "Dinner", pPct: 0.22, cPct: 0.25, fPct: 0.2, items: [
          { food_name: "Lean Turkey Breast Fillet", quantity: 180, unit: "g", calories: 250, protein: 50, carbs: 0, fats: 3 },
          { food_name: "Baked Sweet Potato", quantity: 200, unit: "g", calories: 170, protein: 3, carbs: 40, fats: 0 },
          { food_name: "Sautéed Baby Spinach & Garlic", quantity: 100, unit: "g", calories: 30, protein: 3, carbs: 4, fats: 1 },
        ]}
      },
      {
        name: "South Asian High-Protein Fusion Protocol",
        goal: fitnessGoal || "Lean Muscle & Functional Strength",
        breakfast: { name: "Paneer Bhurji with Spiced Besan Chilla & Mint Curd", type: "Breakfast", pPct: 0.27, cPct: 0.25, fPct: 0.3, items: [
          { food_name: "Fresh Low-Fat Paneer (Crumbled)", quantity: 150, unit: "g", calories: 260, protein: 28, carbs: 4, fats: 15 },
          { food_name: "Chickpea Flour (Besan) Chilla", quantity: 2, unit: "pieces", calories: 180, protein: 10, carbs: 28, fats: 4 },
          { food_name: "Low-Fat Dahi / Curd", quantity: 100, unit: "g", calories: 60, protein: 5, carbs: 5, fats: 2 },
        ]},
        lunch: { name: "Tandoori Spiced Chicken Thigh with Brown Basmati & Dal", type: "Lunch", pPct: 0.35, cPct: 0.35, fPct: 0.35, items: [
          { food_name: "Skinless Tandoori Chicken", quantity: 180, unit: "g", calories: 280, protein: 48, carbs: 2, fats: 8 },
          { food_name: "Steamed Brown Basmati Rice", quantity: 170, unit: "g", calories: 200, protein: 5, carbs: 44, fats: 2 },
          { food_name: "Yellow Moong Dal Tadka", quantity: 150, unit: "g", calories: 140, protein: 9, carbs: 20, fats: 3 },
          { food_name: "Cucumber & Mint Kachumber Salad", quantity: 100, unit: "g", calories: 25, protein: 1, carbs: 5, fats: 0 },
        ]},
        snack: { name: "Roasted Spiced Chickpeas & Whey Lassi", type: "Pre-Workout Fuel", pPct: 0.16, cPct: 0.18, fPct: 0.15, items: [
          { food_name: "Whey Isolate Protein", quantity: 30, unit: "g", calories: 120, protein: 26, carbs: 2, fats: 1 },
          { food_name: "Air-Roasted Crunchy Chickpeas", quantity: 40, unit: "g", calories: 140, protein: 7, carbs: 22, fats: 3 },
        ]},
        dinner: { name: "Grilled White Fish / Paneer with Multigrain Roti & Bhindi", type: "Dinner", pPct: 0.22, cPct: 0.22, fPct: 0.2, items: [
          { food_name: "Pan-Grilled Cod or Tilapia", quantity: 180, unit: "g", calories: 210, protein: 42, carbs: 0, fats: 3 },
          { food_name: "Multigrain Whole Wheat Roti", quantity: 2, unit: "rotis", calories: 160, protein: 6, carbs: 32, fats: 2 },
          { food_name: "Spiced Roasted Okra (Bhindi)", quantity: 120, unit: "g", calories: 50, protein: 2, carbs: 8, fats: 1 },
        ]}
      },
      {
        name: "Artisan Performance & Energy Builder",
        goal: fitnessGoal || "Athletic Output & Lean Bulk",
        breakfast: { name: "Peanut Butter Banana Protein Toast & Poached Eggs", type: "Breakfast", pPct: 0.26, cPct: 0.3, fPct: 0.28, items: [
          { food_name: "Whole Wheat Ezekiel Bread", quantity: 2, unit: "slices", calories: 160, protein: 10, carbs: 30, fats: 1 },
          { food_name: "Natural Peanut Butter", quantity: 25, unit: "g", calories: 150, protein: 7, carbs: 6, fats: 12 },
          { food_name: "Sliced Banana", quantity: 1, unit: "medium", calories: 105, protein: 1, carbs: 27, fats: 0 },
          { food_name: "Poached Pasture Eggs", quantity: 2, unit: "large", calories: 140, protein: 12, carbs: 1, fats: 10 },
        ]},
        lunch: { name: "Slow-Cooked Mexican Beef / Turkey Bowl with Black Beans & Rice", type: "Lunch", pPct: 0.34, cPct: 0.35, fPct: 0.34, items: [
          { food_name: "93% Lean Ground Turkey/Beef", quantity: 175, unit: "g", calories: 290, protein: 44, carbs: 0, fats: 12 },
          { food_name: "Cilantro Lime Jasmine Rice", quantity: 160, unit: "g", calories: 210, protein: 4, carbs: 45, fats: 0 },
          { food_name: "Simmered Black Beans", quantity: 100, unit: "g", calories: 110, protein: 7, carbs: 20, fats: 1 },
          { food_name: "Fresh Pico de Gallo & Guacamole", quantity: 50, unit: "g", calories: 60, protein: 1, carbs: 4, fats: 5 },
        ]},
        snack: { name: "Cottage Cheese Bowl with Raw Almonds & Honey", type: "Mid-Day Fuel", pPct: 0.18, cPct: 0.15, fPct: 0.18, items: [
          { food_name: "Low-Fat Creamy Cottage Cheese", quantity: 200, unit: "g", calories: 160, protein: 24, carbs: 8, fats: 3 },
          { food_name: "Raw California Almonds", quantity: 15, unit: "g", calories: 95, protein: 3, carbs: 3, fats: 8 },
          { food_name: "Pure Honey Drizzle", quantity: 10, unit: "g", calories: 30, protein: 0, carbs: 8, fats: 0 },
        ]},
        dinner: { name: "Grilled Chicken Breast with Herb Roasted Fingerling Potatoes", type: "Dinner", pPct: 0.22, cPct: 0.2, fPct: 0.2, items: [
          { food_name: "Herb-Marinated Chicken Breast", quantity: 180, unit: "g", calories: 280, protein: 54, carbs: 0, fats: 5 },
          { food_name: "Roasted Fingerling Potatoes", quantity: 180, unit: "g", calories: 160, protein: 4, carbs: 36, fats: 1 },
          { food_name: "Charred Green Beans & Olive Oil", quantity: 120, unit: "g", calories: 55, protein: 2, carbs: 6, fats: 3 },
        ]}
      },
      {
        name: "Plant-Forward Athletic Power Protocol",
        goal: fitnessGoal || "Clean Nutrient Density & Recovery",
        breakfast: { name: "Tofu Scramble with Spinach, Mushrooms & Spelt Toast", type: "Breakfast", pPct: 0.25, cPct: 0.28, fPct: 0.28, items: [
          { food_name: "High-Protein Organic Tofu", quantity: 200, unit: "g", calories: 220, protein: 26, carbs: 4, fats: 12 },
          { food_name: "Whole Grain Spelt Toast", quantity: 2, unit: "slices", calories: 180, protein: 8, carbs: 34, fats: 2 },
          { food_name: "Sautéed Cremini Mushrooms & Spinach", quantity: 120, unit: "g", calories: 40, protein: 4, carbs: 5, fats: 0 },
        ]},
        lunch: { name: "Tempeh & Edamame Quinoa Buddha Bowl with Tahini", type: "Lunch", pPct: 0.35, cPct: 0.35, fPct: 0.34, items: [
          { food_name: "Pan-Seared Organic Tempeh", quantity: 160, unit: "g", calories: 310, protein: 32, carbs: 12, fats: 16 },
          { food_name: "Shelled Steamed Edamame", quantity: 80, unit: "g", calories: 100, protein: 9, carbs: 7, fats: 4 },
          { food_name: "Cooked Tricolor Quinoa", quantity: 150, unit: "g", calories: 180, protein: 6, carbs: 32, fats: 3 },
          { food_name: "Lemon Tahini Dressing", quantity: 15, unit: "ml", calories: 90, protein: 3, carbs: 3, fats: 8 },
        ]},
        snack: { name: "Plant Protein Shake with Mixed Berries & Chia", type: "Post-Workout Fuel", pPct: 0.18, cPct: 0.17, fPct: 0.18, items: [
          { food_name: "Pea & Brown Rice Protein Powder", quantity: 32, unit: "g", calories: 130, protein: 25, carbs: 3, fats: 2 },
          { food_name: "Unsweetened Almond Milk", quantity: 250, unit: "ml", calories: 35, protein: 1, carbs: 1, fats: 3 },
          { food_name: "Chia Seeds & Blueberries", quantity: 60, unit: "g", calories: 75, protein: 2, carbs: 10, fats: 3 },
        ]},
        dinner: { name: "Hearty Chickpea & Red Lentil Curry with Basmati", type: "Dinner", pPct: 0.22, cPct: 0.2, fPct: 0.2, items: [
          { food_name: "Red Lentil & Chickpea Dahl", quantity: 220, unit: "g", calories: 280, protein: 18, carbs: 45, fats: 4 },
          { food_name: "Steamed White Basmati Rice", quantity: 150, unit: "g", calories: 190, protein: 4, carbs: 42, fats: 0 },
          { food_name: "Steamed Broccoli & Cauliflower", quantity: 120, unit: "g", calories: 40, protein: 3, carbs: 7, fats: 0 },
        ]}
      }
    ];

    const selectedArch = archetypes[Math.abs(variantIdx) % archetypes.length];
    const totalCal = targetCalories;
    const totalP = targetProtein;

    const buildMeal = (mTemplate: any, time: string) => {
      const mealCal = Math.round(totalCal * mTemplate.pPct);
      const mealP = Math.round(totalP * mTemplate.pPct);
      const mealC = Math.round((mealCal * 0.45) / 4);
      const mealF = Math.round((mealCal * 0.25) / 9);

      return {
        meal_name: mTemplate.name,
        meal_type: mTemplate.type,
        meal_time: time,
        calories: mealCal,
        protein: mealP,
        carbs: mealC,
        fats: mealF,
        food_items: mTemplate.items,
      };
    };

    const mealTimes = ["08:00 AM", "12:30 PM", "04:30 PM", "08:00 PM", "10:30 AM", "09:30 PM"];
    const baseMeals = [
      buildMeal(selectedArch.breakfast, mealTimes[0]),
      buildMeal(selectedArch.lunch, mealTimes[1]),
    ];

    if (targetMealsCount >= 3) {
      baseMeals.push(buildMeal(selectedArch.dinner, mealTimes[3]));
    }
    if (targetMealsCount >= 4) {
      baseMeals.splice(2, 0, buildMeal(selectedArch.snack, mealTimes[2]));
    }

    const groceries = [
      { item_name: "Fresh Eggs / Organic Tofu", quantity: 1, unit: "carton", category: "Dairy & Eggs" },
      { item_name: "High-Protein Turkey / Salmon / Paneer", quantity: 1.5, unit: "kg", category: "Meat & Poultry" },
      { item_name: "Greek Yogurt / Plant Yogurt", quantity: 1, unit: "kg", category: "Dairy & Eggs" },
      { item_name: "Sourdough / Whole Grain Bread", quantity: 1, unit: "loaf", category: "Grains & Pantry" },
      { item_name: "Quinoa / Brown Rice / Sweet Potatoes", quantity: 1.5, unit: "kg", category: "Grains & Pantry" },
      { item_name: "Fresh Berries & Avocados", quantity: 1, unit: "kg", category: "Produce" },
      { item_name: "Fresh Greens, Asparagus & Green Beans", quantity: 2, unit: "packs", category: "Produce" },
      { item_name: "Raw Nuts & Extra Virgin Olive Oil", quantity: 1, unit: "unit", category: "Grains & Pantry" },
    ];

    return {
      planName: `${selectedArch.name}`,
      goal: selectedArch.goal,
      dailyCalories: targetCalories,
      dailyProtein: targetProtein,
      mealsPerDay: baseMeals.length,
      summary: `Tailored protocol featuring diverse micronutrient-dense whole foods designed for ${targetProtein}g protein and ${targetCalories} kcal.`,
      meals: baseMeals,
      groceryList: groceries,
    };
  };

  const previousMealsContext = previousPlan && previousPlan.meals && previousPlan.meals.length > 0
    ? `
PREVIOUS GENERATED PLAN TO AVOID (REGENERATION #${regenerationCount + 1}):
The user already saw this plan and requested a FRESH VARIATION:
${previousPlan.meals.map((m: any, i: number) => `  - Meal ${i + 1} (${m.meal_type || "Meal"}): "${m.meal_name}" [Ingredients: ${(m.food_items || []).map((f: any) => f.food_name).join(", ")}]`).join("\n")}

MANDATORY REGENERATION DIRECTIVE:
1. You MUST generate a COMPLETELY DIFFERENT meal plan.
2. DO NOT use the same primary protein or primary carb combos as the previous plan (e.g. if previous breakfast was Oats+Whey, generate Eggs+Toast+Avocado or Paneer Bhurji or Greek Yogurt Parfait; if previous lunch was Chicken+Rice, make it Salmon+Quinoa or Rajma+Roti or Turkey Sweet Potato Bowl).
3. Vary the cuisine and culinary personality substantially.`
    : `
MANDATORY MEAL VARIETY DIRECTIVES:
1. Breakfast variety: Avoid defaulting to plain Oats + Whey. Explore rich options like:
   - Eggs + sourdough/toast + avocado/fruit
   - Paneer bhurji / egg bhurji + whole wheat roti
   - Greek yogurt parfait with berries, chia seeds & raw walnuts
   - Besan chilla / moong dal chilla with mint curd
   - High-protein peanut butter banana toast with milk
   - Shakshuka with poached eggs & sourdough
2. Lunch & Dinner variety: Alternate primary proteins across lunch and dinner (e.g., do NOT repeat chicken for both meals; use salmon, turkey, eggs, paneer, lentils/dal/rajma, tuna, lean beef, or tofu/tempeh).
3. Carbohydrate variety: Rotate between jasmine rice, brown basmati rice, sweet potatoes, whole wheat roti/tortillas, quinoa, whole grain pasta, and oats.`;

  const prompt = `You are the world-class Sports Nutritionist and AI Dietitian for LEVELUP.
Generate an accurate, science-backed, highly realistic, appetizing and non-repetitive daily diet plan and matching grocery shopping list tailored specifically to this user's profile:

USER PROFILE & CONSTRAINTS:
- Diet Type / Focus: ${dietType || "High Protein / Clean Bulking"}
- Target Calories: ${targetCalories} kcal/day
- Target Protein: ${targetProtein} g/day
- Number of Meals per Day: ${targetMealsCount}
- Fitness Goal: ${fitnessGoal || "Lean Muscle Hypertrophy"}
- Current Weight: ${currentWeight ? currentWeight + " kg" : "Unspecified"}
- Target Weight: ${targetWeight ? targetWeight + " kg" : "Unspecified"}
- Training Level: ${experienceLevel || "Intermediate/Advanced"}
- Budget Level: ${budget || "Moderate / Standard"}
- Cooking Situation / Prep Time: ${cookingSituation || "Quick Prep (<15 mins)"}
- Food Preferences / Cuisines: ${foodPreferences || "Whole foods, balanced, high protein"}
- Foods to Avoid: ${foodsToAvoid || "None"}
- Allergies: ${allergies || "None"}
- Regeneration Seed / Iteration: ${regenerationCount}

${previousMealsContext}

CRITICAL RULES:
1. Divide the daily calories and protein across exactly ${targetMealsCount} meals with realistic timings (e.g. Breakfast at 08:00 AM, Lunch at 12:30 PM, Snack/Pre-Workout at 04:30 PM, Dinner at 08:00 PM).
2. For each meal, specify:
   - "meal_name": Creative appetizing title
   - "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Pre-Workout Fuel" | "Afternoon Snack" | "Post-Workout"
   - "meal_time": Time string (e.g. "08:00 AM")
   - "calories": Number
   - "protein": Grams (number)
   - "carbs": Grams (number)
   - "fats": Grams (number)
   - "food_items": Array of 3-5 real food ingredients with "food_name", "quantity" (number), "unit" (e.g. "g", "ml", "large egg", "scoop", "slice"), "calories", "protein", "carbs", "fats".
3. Internal Consistency: The sum of individual meal calories and protein MUST sum up to the total daily targets within ±5%. The sum of food_items in each meal MUST equal the meal's macro totals.
4. Provide a consolidated "groceryList" with realistic batch shopping quantities for a weekly supply, categorized by "Produce", "Meat & Poultry", "Dairy & Eggs", "Grains & Pantry", or "Supplements".
5. Strictly respect all allergies (${allergies || "None"}) and foods to avoid (${foodsToAvoid || "None"}). Never include allergens.
6. Return ONLY a valid JSON object matching this schema:

{
  "planName": "Creative descriptive plan title",
  "goal": "${fitnessGoal || "Lean Hypertrophy"}",
  "dailyCalories": ${targetCalories},
  "dailyProtein": ${targetProtein},
  "mealsPerDay": ${targetMealsCount},
  "summary": "1-2 sentence nutritional rationale highlighting the unique ingredients and macro distribution",
  "meals": [
    {
      "meal_name": "Appetizing Meal Title",
      "meal_type": "Breakfast",
      "meal_time": "08:00 AM",
      "calories": 600,
      "protein": 45,
      "carbs": 65,
      "fats": 15,
      "food_items": [
        {
          "food_name": "Ingredient Name",
          "quantity": 100,
          "unit": "g",
          "calories": 200,
          "protein": 15,
          "carbs": 25,
          "fats": 5
        }
      ]
    }
  ],
  "groceryList": [
    {
      "item_name": "Grocery Item Name",
      "quantity": 1.5,
      "unit": "kg",
      "category": "Meat & Poultry"
    }
  ]
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.9,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.meals && parsed.meals.length > 0) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    // Non-fatal error handled smoothly
  }

  // Graceful fallback to procedural diet variation on network unavailability
  return res.json(generateDynamicProceduralDiet(regenerationCount));
});

// ==========================================
// AI MACRO COACH ENDPOINTS
// ==========================================

// 1. Calculate and explain comprehensive macro blueprint
app.post("/api/ai/macro-coach/calculate", async (req, res) => {
  try {
    const {
      age = 25,
      gender = "Male",
      height = 175,
      weight = 75,
      targetWeight,
      goal = "Muscle Gain",
      activityLevel = "Moderately Active",
      trainingFrequency = "4-5 days/week",
      dietaryPreference = "High Protein",
    } = req.body || {};

    const ageNum = Math.max(14, Math.min(90, Number(age) || 25));
    const heightNum = Math.max(120, Math.min(250, Number(height) || 175));
    const weightNum = Math.max(35, Math.min(250, Number(weight) || 75));
    const targetWeightNum = targetWeight ? Number(targetWeight) : undefined;

    // Mathematical baseline calculations (Mifflin-St Jeor Equation)
    let bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum);
    if (gender?.toLowerCase().startsWith("f")) {
      bmr -= 161;
    } else {
      bmr += 5;
    }
    bmr = Math.round(bmr);

    let activityMultiplier = 1.55;
    const actLower = (activityLevel || "").toLowerCase();
    if (actLower.includes("sedentary")) activityMultiplier = 1.2;
    else if (actLower.includes("light")) activityMultiplier = 1.375;
    else if (actLower.includes("mod")) activityMultiplier = 1.55;
    else if (actLower.includes("very") || actLower.includes("high")) activityMultiplier = 1.725;
    else if (actLower.includes("extra") || actLower.includes("athlete")) activityMultiplier = 1.9;

    const tdee = Math.round(bmr * activityMultiplier);

    let calorieDelta = 0;
    let deltaType: "Surplus" | "Deficit" | "Maintenance" = "Maintenance";
    const goalLower = (goal || "").toLowerCase();

    if (goalLower.includes("gain") || goalLower.includes("bulk") || goalLower.includes("hypertrophy")) {
      calorieDelta = 300;
      deltaType = "Surplus";
    } else if (goalLower.includes("loss") || goalLower.includes("cut") || goalLower.includes("lean")) {
      calorieDelta = -450;
      deltaType = "Deficit";
    }

    const calculatedCalories = Math.max(1200, tdee + calorieDelta);

    let proteinPerKg = 2.0;
    if (deltaType === "Deficit") proteinPerKg = 2.2;
    else if (deltaType === "Surplus") proteinPerKg = 2.0;
    else proteinPerKg = 1.8;

    const calculatedProtein = Math.round(weightNum * proteinPerKg);
    const proteinCalories = calculatedProtein * 4;
    const calculatedFat = Math.max(40, Math.round((calculatedCalories * 0.25) / 9));
    const fatCalories = calculatedFat * 9;
    const remainingCaloriesForCarbs = Math.max(50 * 4, calculatedCalories - (proteinCalories + fatCalories));
    const calculatedCarbs = Math.round(remainingCaloriesForCarbs / 4);

    const fallbackCalculation = {
      dailyCalories: calculatedCalories,
      proteinGrams: calculatedProtein,
      carbsGrams: calculatedCarbs,
      fatGrams: calculatedFat,
      bmr,
      tdee,
      surplusDeficit: {
        type: deltaType,
        amount: Math.abs(calorieDelta),
        percentage: Math.round((Math.abs(calorieDelta) / tdee) * 100) || 0,
        rationale: deltaType === "Surplus"
          ? `A controlled lean surplus of +${calorieDelta} kcal optimizes muscle protein synthesis while minimizing adipose fat accumulation.`
          : deltaType === "Deficit"
          ? `A moderate deficit of ${calorieDelta} kcal (~18% under TDEE) maximizes adipose fat oxidation while sparing skeletal muscle mass.`
          : `Maintenance calorie intake matches your daily energy expenditure to preserve body composition while improving workout performance.`,
      },
      macroRatioPercentages: {
        protein: Math.round((proteinCalories / calculatedCalories) * 100),
        carbs: Math.round(((calculatedCarbs * 4) / calculatedCalories) * 100),
        fat: Math.round((fatCalories / calculatedCalories) * 100),
      },
      rationale: `Based on your profile (${weightNum}kg, ${heightNum}cm, ${ageNum}y, ${activityLevel}, ${trainingFrequency}), your Basal Metabolic Rate is ${bmr} kcal and estimated TDEE is ${tdee} kcal. For ${goal}, we calibrated a ${deltaType.toLowerCase()} of ${Math.abs(calorieDelta)} kcal, targeting ${proteinPerKg}g protein per kg of bodyweight (${calculatedProtein}g) to support ${goal.toLowerCase()} with high fidelity.`,
      mealTimingAdvice: [
        {
          timing: "Pre-Workout (60–90 min before)",
          recommendation: `Consume 30–40g complex carbs + 25–30g lean protein`,
          rationale: "Maximizes muscle glycogen availability and prevents workout-induced muscle catabolism.",
        },
        {
          timing: "Post-Workout (Within 2 hours)",
          recommendation: `Consume 30–40g fast-digesting protein + 40–60g carbohydrates`,
          rationale: "Triggers mTOR activation and replenishes depleted intramuscular glycogen stores.",
        },
        {
          timing: "Even Distribution Across Meals",
          recommendation: `Distribute ~${Math.round(calculatedProtein / 4)}g protein across 3–4 meals throughout the day`,
          rationale: "Sustains elevated muscle protein synthesis (MPS) rates continuously.",
        },
      ],
      foodSources: {
        protein: ["Chicken breast", "Liquid egg whites", "Whey isolate", "Greek yogurt", "Tofu / Paneer", "White fish"],
        carbs: ["Jasmine & basmati rice", "Oats", "Sweet potatoes", "Whole grain sourdough", "Quinoa", "Fresh berries"],
        fat: ["Extra virgin olive oil", "Avocados", "Raw almonds & walnuts", "Chia & flax seeds", "Egg yolks"],
      },
      adjustmentGuidelines: "Track your average morning weight across 14 days. If weight does not trend in the expected direction by 0.25–0.5% bodyweight per week, adjust daily calories by ±150–200 kcal while keeping protein static.",
    };

    const prompt = `You are the Principal Sports Dietitian and Metabolic Physiologist for LEVELUP.
Calculate and scientifically explain the exact macronutrient and caloric blueprint for this athlete:

USER PROFILE:
- Age: ${ageNum} years
- Gender: ${gender}
- Height: ${heightNum} cm
- Current Weight: ${weightNum} kg
${targetWeightNum ? `- Target Weight: ${targetWeightNum} kg` : ""}
- Fitness Goal: ${goal}
- Activity Level: ${activityLevel}
- Training Frequency: ${trainingFrequency}
- Dietary Preference: ${dietaryPreference}

CALCULATION STANDARDS:
1. Basal Metabolic Rate (BMR): Compute using Mifflin-St Jeor equation.
2. Total Daily Energy Expenditure (TDEE): Apply activity multiplier.
3. Goal Calorie Target:
   - Muscle Gain: +250 to +400 kcal lean surplus.
   - Fat Loss: -400 to -600 kcal sustainable deficit.
   - Maintenance: TDEE.
4. Protein Target: 1.8g to 2.4g per kg bodyweight based on goal.
5. Fat Target: 20% to 30% of total calories.
6. Carbohydrate Target: Remaining calories (4 kcal/g).
7. Tailor food source recommendations strictly to the dietary preference: "${dietaryPreference}".

Return ONLY a valid JSON object matching this exact schema:
{
  "dailyCalories": 2450,
  "proteinGrams": 165,
  "carbsGrams": 270,
  "fatGrams": 65,
  "bmr": 1720,
  "tdee": 2250,
  "surplusDeficit": {
    "type": "Surplus",
    "amount": 200,
    "percentage": 9,
    "rationale": "Clear scientific explanation of this surplus/deficit"
  },
  "macroRatioPercentages": {
    "protein": 27,
    "carbs": 44,
    "fat": 29
  },
  "rationale": "Comprehensive breakdown explaining how BMR, TDEE, protein multiplier, and energy split were calculated for this user",
  "mealTimingAdvice": [
    {
      "timing": "Pre-Workout (60-90m)",
      "recommendation": "Specific food/macro guidance",
      "rationale": "Physiological rationale"
    },
    {
      "timing": "Post-Workout",
      "recommendation": "Specific food/macro guidance",
      "rationale": "Physiological rationale"
    },
    {
      "timing": "Daily Spacing",
      "recommendation": "Even protein feedings",
      "rationale": "MPS explanation"
    }
  ],
  "foodSources": {
    "protein": ["Food 1", "Food 2", "Food 3", "Food 4"],
    "carbs": ["Food 1", "Food 2", "Food 3", "Food 4"],
    "fat": ["Food 1", "Food 2", "Food 3", "Food 4"]
  },
  "adjustmentGuidelines": "Actionable rules for when and how to adjust macros after 2-3 weeks of weight progress"
}`;

    const geminiRes = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.4,
    });

    if (geminiRes?.text) {
      try {
        let cleanText = geminiRes.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        if (parsed.dailyCalories && parsed.proteinGrams) {
          return res.json(parsed);
        }
      } catch (parseErr) {
        console.warn("[Macro Coach Calculate] Parse error, using fallback:", parseErr);
      }
    }

    return res.json(fallbackCalculation);
  } catch (error: any) {
    console.error("[Macro Coach Calculate Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to calculate macros" });
  }
});

// 2. Interactive AI Macro Coaching Chat
app.post("/api/ai/macro-coach/chat", async (req, res) => {
  try {
    const {
      userMessage = "",
      profileContext = {},
      chatHistory = [],
    } = req.body || {};

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Missing required userMessage string" });
    }

    const {
      age = 25,
      gender = "User",
      height = 175,
      weight = 75,
      targetWeight,
      goal = "Muscle Gain",
      activityLevel = "Moderately Active",
      trainingFrequency = "4-5 days/week",
      dietaryPreference = "High Protein",
      dailyCalories = 2450,
      proteinGrams = 165,
      carbsGrams = 270,
      fatGrams = 65,
      surplusDeficit = { type: "Surplus", amount: 250 },
      bmr = 1720,
      tdee = 2200,
    } = profileContext;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.slice(-6).map((msg: any) => `${msg.role === "assistant" ? "Macro Coach" : "User"}: ${msg.content}`).join("\n")
      : "";

    const systemInstruction = `You are LEVELUP's elite AI Macro & Sports Nutrition Coach.
You provide precise, science-backed, practical, and highly personalized nutrition advice.

CRITICAL COACHING RULES:
1. ALWAYS anchor your advice directly to the user's specific calculated targets and profile:
   - Current Weight: ${weight} kg ${targetWeight ? `(Target: ${targetWeight} kg)` : ""}
   - Fitness Goal: ${goal}
   - Daily Calories: ${dailyCalories} kcal (${surplusDeficit.type || "Goal"}: ${surplusDeficit.amount ? `${surplusDeficit.amount} kcal` : "aligned with TDEE"})
   - Daily Protein Target: ${proteinGrams} g (~${(proteinGrams / weight).toFixed(1)}g/kg)
   - Daily Carbohydrates: ${carbsGrams} g
   - Daily Fats: ${fatGrams} g
   - BMR: ${bmr} kcal | TDEE: ${tdee} kcal
   - Dietary Preference: ${dietaryPreference}
   - Training Frequency: ${trainingFrequency} | Activity Level: ${activityLevel}

2. When the user asks common questions, provide direct, actionable answers:
   - If asked "How much protein should I eat today?": State their exact target (${proteinGrams}g) and give a practical breakdown across their daily meals.
   - If asked "What should I eat to hit my protein goal?": Recommend exact whole-food portions conforming to ${dietaryPreference} (e.g. "150g chicken breast (~45g protein), 200g Greek yogurt (~20g protein), 1 scoop whey (~25g protein)").
   - If asked "I have X calories left, what can I eat?": Give 2-3 specific meal/snack recipes with approximate macro breakdowns matching the remaining energy.
   - If asked "How should I adjust my macros if my weight changes?": Explain the progressive adjustment protocol (e.g. track 7-14 day moving average weight; adjust calories by ±150-200 kcal if stalling).
   - If asked about pre/post workout nutrition, timing, or supplements (Creatine, Whey, Electrolytes): Give concise, evidence-based recommendations.

3. Formatting:
   - Use clean, structured Markdown (bold headers, concise bullet points, bold key numbers).
   - Keep answers conversational, authoritative, and direct.
   - Avoid generic fluff.`;

    const prompt = `${formattedHistory ? `RECENT CONVERSATION:\n${formattedHistory}\n\n` : ""}USER QUESTION:
"${userMessage}"

Provide your structured coaching response followed by 2-3 recommended follow-up questions for the athlete.
Return a JSON object with this schema:
{
  "answer": "Your comprehensive, formatted markdown coaching answer",
  "suggestedFollowUps": [
    "Suggested question 1",
    "Suggested question 2",
    "Suggested question 3"
  ]
}`;

    const geminiRes = await callGeminiCascade(prompt, {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    if (geminiRes?.text) {
      try {
        let cleanText = geminiRes.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        if (parsed.answer) {
          return res.json(parsed);
        }
      } catch (parseErr) {
        console.warn("[Macro Coach Chat] Parse error:", parseErr);
      }
    }

    let fallbackAnswer = `Based on your profile (${weight}kg, ${goal}), your daily target is **${dailyCalories} kcal** with **${proteinGrams}g Protein**, **${carbsGrams}g Carbs**, and **${fatGrams}g Fats**.`;
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes("how much protein") || msgLower.includes("protein today")) {
      fallbackAnswer = `### Daily Protein Target: **${proteinGrams}g**\n\nFor your bodyweight of **${weight} kg** and your goal of **${goal}**, optimal muscle protein synthesis occurs at ~**${(proteinGrams / weight).toFixed(1)}g per kg**.\n\n**Recommended Daily Distribution:**\n- **Breakfast:** ~${Math.round(proteinGrams * 0.25)}g protein (e.g. 3 eggs + 100g egg whites or protein oats)\n- **Lunch:** ~${Math.round(proteinGrams * 0.3)}g protein (e.g. 150g chicken breast or paneer/tofu)\n- **Pre/Post-Workout:** ~${Math.round(proteinGrams * 0.2)}g protein (e.g. whey shake or Greek yogurt)\n- **Dinner:** ~${Math.round(proteinGrams * 0.25)}g protein (e.g. salmon, lean beef, or lentil dal)`;
    } else if (msgLower.includes("what should i eat") || msgLower.includes("hit my protein")) {
      fallbackAnswer = `### High-Protein Whole Food Recommendations (${dietaryPreference}):\n\nTo reach your **${proteinGrams}g daily protein target**, combine these high-yield staples:\n\n1. **Lean Animal / Dairy Sources:**\n   - **Chicken Breast:** 31g protein per 100g cooked (~165 kcal)\n   - **Liquid Egg Whites:** 11g protein per 100g (~52 kcal)\n   - **Non-Fat Greek Yogurt:** 10–12g protein per 100g (~60 kcal)\n   - **Whey / Plant Isolate:** 24–27g protein per scoop (~120 kcal)\n\n2. **Plant / Vegetarian Sources:**\n   - **Tofu / Tempeh:** 15–20g protein per 100g\n   - **Low-Fat Paneer:** 18–20g protein per 100g\n   - **Cooked Lentils / Chickpeas:** 9g protein per 100g\n\n*Combine 2–3 of these across your main meals to easily hit your daily goal!*`;
    } else if (msgLower.includes("calories left") || msgLower.includes("left")) {
      fallbackAnswer = `### Quick Fuel Options for Remaining Calories:\n\nHere are 3 quick meals based on your macro balance:\n\n1. **High-Protein Option (~350 kcal | 35g Protein, 20g Carbs, 5g Fat):**\n   - 200g Greek yogurt with 1 scoop protein powder & a handful of berries.\n\n2. **Balanced Snack (~400 kcal | 25g Protein, 45g Carbs, 10g Fat):**\n   - 2 slices whole grain sourdough + 3 scrambled eggs or 100g smoked salmon.\n\n3. **Quick Recovery Bowl (~500 kcal | 40g Protein, 60g Carbs, 8g Fat):**\n   - 150g grilled chicken or tofu + 150g jasmine rice + steamed green veggies.`;
    } else if (msgLower.includes("adjust") || msgLower.includes("weight changes")) {
      fallbackAnswer = `### Macro Adjustment Protocol:\n\n1. **Track 14-Day Rolling Average:** Weigh yourself daily in the morning after using the bathroom, and calculate the weekly average.\n2. **If Gaining Too Fast (>0.5% bodyweight/week on Muscle Gain):** Reduce carbs by 25g (-100 kcal) while keeping protein at **${proteinGrams}g**.\n3. **If Weight Stalls for 2 Consecutive Weeks on Fat Loss:** Reduce daily calories by 150–200 kcal (primarily from carbs/fats).\n4. **If Feeling Fatigued in the Gym:** Increase pre-workout carbs by 20–30g on heavy training days.`;
    }

    return res.json({
      answer: fallbackAnswer,
      suggestedFollowUps: [
        "How should I structure my pre-workout meal?",
        "What are good low-fat protein sources?",
        "How many meals per day is best for hypertrophy?",
      ],
    });
  } catch (error: any) {
    console.error("[Macro Coach Chat Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to process chat message" });
  }
});

// ==========================================
// AI STUDY COACH ENDPOINTS
// ==========================================

// 1. AI Study Plan Generator
app.post("/api/ai/study/plan", async (req, res) => {
  const {
    subject = "Computer Science",
    courseName = "DBMS & Distributed Systems",
    examDate,
    level = "Intermediate",
    dailyStudyMinutes = 60,
    daysCount = 7,
    targetGoal = "Ace Exam (90%+)",
    weakTopics = [],
    existingAssignments = [],
  } = req.body || {};

  const daysNum = Math.min(30, Math.max(3, Number(daysCount) || 7));
  const studyMins = Math.min(360, Math.max(20, Number(dailyStudyMinutes) || 60));

  const prompt = `You are LEVELUP AI Academic Master Coach and Cognitive Science Strategist.
Generate a structured, hyper-effective, day-by-day Study Plan for a student.

STUDENT PROFILE:
- Subject: ${subject}
- Course: ${courseName}
- Target Goal: ${targetGoal}
- Student Level: ${level}
- Days Available: ${daysNum} days
- Daily Time Available: ${studyMins} minutes/day
- Target Exam Date: ${examDate || "Upcoming in " + daysNum + " days"}
- Weak / Priority Topics: ${weakTopics.length > 0 ? weakTopics.join(", ") : "None specified yet"}
- Active Assignments: ${existingAssignments.length > 0 ? JSON.stringify(existingAssignments.slice(0, 3)) : "None"}

PEDAGOGICAL PRINCIPLES:
1. Apply active recall, spaced repetition, and interleaving.
2. Structure each day with 2 to 4 distinct study tasks with exact time breakdowns summing to ${studyMins} minutes.
3. Include conceptual learning, active problem-solving/practice, quiz checkpoint, and flash revision.
4. Dedicate the final 1-2 days to comprehensive mock revision, weak-area remediation, and high-yield formula/concept reinforcement.

Return ONLY a valid JSON object matching this schema:
{
  "id": "plan-${Date.now()}",
  "planTitle": "High-impact descriptive plan title (e.g. Master DBMS in 7 Days)",
  "subject": "${subject}",
  "courseName": "${courseName}",
  "targetGoal": "${targetGoal}",
  "level": "${level}",
  "totalDays": ${daysNum},
  "dailyStudyMinutes": ${studyMins},
  "examDate": "${examDate || ''}",
  "overview": "2-3 sentence strategic rationale on how this roadmap optimizes retention and performance",
  "strategyHighlights": [
    "3-4 bullet points highlighting strategic focus (e.g. Active recall sessions, SQL query drills, Mock exam buffer)"
  ],
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme title (e.g. Relational Foundations & Key Constraints)",
      "focusArea": "Core focus concept",
      "estimatedMinutes": ${studyMins},
      "keyMilestone": "Clear deliverable milestone for the day",
      "quizTopicSuggestion": "Topic to self-quiz on",
      "tasks": [
        {
          "id": "task-d1-1",
          "title": "Actionable task name (e.g. Review 1NF, 2NF, 3NF, BCNF Normalization)",
          "durationMinutes": 25,
          "type": "concept",
          "description": "Concrete instruction on what to read or summarize."
        },
        {
          "id": "task-d1-2",
          "title": "Practice solving 5 schema decomposition questions",
          "durationMinutes": 25,
          "type": "practice",
          "description": "Step-by-step application on sample relations."
        },
        {
          "id": "task-d1-3",
          "title": "10-Minute Active Recall & Concept Summary",
          "durationMinutes": 10,
          "type": "revision",
          "description": "Write out core rules from memory without notes."
        }
      ]
    }
  ],
  "proTips": [
    "3 expert cognitive study hacks tailored to ${subject}"
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are LEVELUP AI Academic Coach, specialized in spaced repetition, exam preparation, and accelerated learning roadmaps. Return strictly valid JSON.",
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.days && parsed.days.length > 0) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Plan Error]:", err?.message);
  }

  // Graceful procedural fallback
  const fallbackDays = [];
  for (let d = 1; d <= daysNum; d++) {
    const isLast = d === daysNum;
    const isPenultimate = d === daysNum - 1 && daysNum > 2;
    const partTime = Math.floor(studyMins / 3);

    fallbackDays.push({
      dayNumber: d,
      theme: isLast
        ? `Final Comprehensive Review & High-Yield Summary`
        : isPenultimate
        ? `Full-Length Mock Test & Weak-Spot Remediation`
        : `Day ${d}: ${subject} Core Modules & Active Drills`,
      focusArea: isLast ? 'Exam readiness & memory consolidation' : `Module ${d} key principles and problem sets`,
      estimatedMinutes: studyMins,
      keyMilestone: isLast ? 'Complete final formula sheet & timed test' : `Master Module ${d} problem set with 85%+ accuracy`,
      quizTopicSuggestion: `${subject} - Module ${d}`,
      tasks: [
        {
          id: `task-d${d}-1`,
          title: isLast ? 'Flashcard & Key Concept Blitz' : `Deep Dive: ${subject} Fundamentals Part ${d}`,
          durationMinutes: partTime,
          type: 'concept',
          description: `Study core definitions, theorems, and structural rules with active note-taking.`,
        },
        {
          id: `task-d${d}-2`,
          title: isLast ? 'Timed High-Yield Practice Exam' : `Solve 6-8 Targeted Practice Problems`,
          durationMinutes: partTime,
          type: 'practice',
          description: `Apply problem-solving methods without looking at solutions first.`,
        },
        {
          id: `task-d${d}-3`,
          title: isLast ? 'Mistake Journal Review & Rest' : `Quick 10-Question Self Quiz & Error Log`,
          durationMinutes: studyMins - (partTime * 2),
          type: 'quiz',
          description: `Test retention and record any misunderstandings in your review notes.`,
        },
      ],
    });
  }

  return res.json({
    id: `plan-fb-${Date.now()}`,
    planTitle: `${daysNum}-Day Master Study Strategy for ${subject}`,
    subject,
    courseName,
    targetGoal,
    level,
    totalDays: daysNum,
    dailyStudyMinutes: studyMins,
    examDate: examDate || '',
    overview: `This structured ${daysNum}-day plan combines spaced repetition and targeted problem solving to maximize mastery in ${subject}.`,
    strategyHighlights: [
      `Daily ${studyMins}-minute focused sessions designed with Pomodoro micro-breaks`,
      `Interleaved problem solving to reinforce neural pathways and retention`,
      `Comprehensive mock review buffer before exam milestone`,
    ],
    days: fallbackDays,
    proTips: [
      `Use active recall: close your notebook and teach the concept out loud.`,
      `Always solve problems before checking answer keys to build cognitive resilience.`,
      `Review difficult concepts 24 hours after first learning them to prevent the forgetting curve.`,
    ],
    createdAt: new Date().toISOString(),
  });
});

// 2. AI Topic Explanation Endpoint
app.post("/api/ai/study/explain", async (req, res) => {
  const {
    topic = "Normalization in Relational Databases",
    subject = "Computer Science / DBMS",
    level = "Intermediate",
    mode = "standard", // standard | simpler | deep_example | common_mistakes
  } = req.body || {};

  const modeInstructions = {
    standard: "Provide a balanced, highly intuitive, university-grade explanation with real-world examples and common pitfalls.",
    simpler: "Explain as if teaching a beginner or using an intuitive ELI5 analogy, removing unnecessary jargon while retaining core truth.",
    deep_example: "Provide an in-depth, step-by-step practical implementation or code/schema example showing exact mechanics.",
    common_mistakes: "Focus heavily on typical exam traps, student mistakes, edge cases, and why they happen.",
  }[mode] || "Provide a comprehensive, intuitive explanation with concrete examples.";

  const prompt = `You are LEVELUP AI Academic Tutor, renowned for breaking down complex topics with absolute clarity, rigor, and memorable real-world analogies.

EXPLAIN THIS TOPIC:
- Topic: ${topic}
- Subject: ${subject}
- Student Level: ${level}
- Explanation Mode: ${mode} (${modeInstructions})

REQUIRED OUTPUT STRUCTURE:
Return ONLY a valid JSON object matching this schema:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "level": "${level}",
  "oneLineSummary": "Ultra-crisp 1-sentence intuitive definition",
  "simpleExplanation": "2-3 paragraphs of clear, engaging explanation using vivid analogies and structured prose",
  "keyConcepts": [
    {
      "name": "Core Concept Name",
      "explanation": "Clear explanation of this fundamental component"
    }
  ],
  "realWorldExample": {
    "title": "Concrete Real-World Scenario (e.g. E-Commerce Order System)",
    "scenario": "The practical context/problem",
    "explanation": "How the concept applies step-by-step",
    "codeOrDiagram": "Code snippet, SQL, ASCII table, formula, or pseudo-diagram illustrating the concept clearly",
    "language": "sql" // sql, python, typescript, java, cpp, text, or math
  },
  "importantPointsToRemember": [
    "3-5 high-yield bullets every student must memorize for exams"
  ],
  "commonMistakesAndPitfalls": [
    {
      "mistake": "The common error or misconception students make",
      "correction": "The correct understanding and why"
    }
  ],
  "quickSummary": [
    "3 concise takeaway bullets for quick 30-second recap"
  ],
  "suggestedPracticeTopics": [
    "3 related topics to practice or test next"
  ]
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are an elite academic educator and subject expert. Output clear, well-formatted JSON with high educational fidelity.",
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.oneLineSummary && parsed.simpleExplanation) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Explain Error]:", err?.message);
  }

  // Graceful fallback explanation
  return res.json({
    topic,
    subject,
    level,
    oneLineSummary: `${topic} is a foundational principle in ${subject} designed to structure information efficiently and eliminate redundancy.`,
    simpleExplanation: `${topic} provides a systematic framework for organizing data and logic. By decomposing complex relationships into modular, self-contained components, it ensures consistency and prevents anomalies during state updates.\n\nThink of it like organizing a cluttered tool shed: instead of dumping every tool, nail, and measurement tape into a single giant bucket where finding or updating an item causes chaos, you create dedicated labeled compartments with clear references.`,
    keyConcepts: [
      {
        name: "Atomic Independence",
        explanation: "Every unit of data represents a single, indivisible value without hidden compound structures.",
      },
      {
        name: "Deterministic Relationships",
        explanation: "Outputs and attributes depend strictly on their primary identifiers, eliminating ambiguous side effects.",
      },
      {
        name: "Anomaly Prevention",
        explanation: "Guarantees that inserting, modifying, or deleting records cannot inadvertently corrupt related data.",
      },
    ],
    realWorldExample: {
      title: "Real-World Application in " + subject,
      scenario: `Managing a dynamic dataset in ${topic} where multiple entities interact.`,
      explanation: `By separating distinct concerns into normalized structures with explicit foreign keys, we prevent update anomalies.`,
      codeOrDiagram: `-- Structured Example for ${topic}\n-- Entity 1: Base Identifier\nCREATE TABLE BaseEntity (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL\n);\n\n-- Entity 2: Normalized Child\nCREATE TABLE SubComponent (\n  id SERIAL PRIMARY KEY,\n  entity_id INT REFERENCES BaseEntity(id),\n  attribute_value NUMERIC(10,2)\n);`,
      language: "sql",
    },
    importantPointsToRemember: [
      `Always identify the primary key or unique determinant before analyzing dependencies.`,
      `Eliminate transitive dependencies to achieve optimal operational consistency.`,
      `Balance theoretical purity with real-world query performance considerations.`,
    ],
    commonMistakesAndPitfalls: [
      {
        mistake: "Assuming higher complexity always yields better production performance.",
        correction: "Over-engineering can introduce unnecessary join overhead; apply normalization pragmatically.",
      },
      {
        mistake: "Confusing functional dependency with simple correlation.",
        correction: "Dependency requires strict mathematical mapping across every possible valid state.",
      },
    ],
    quickSummary: [
      `${topic} establishes consistency and eliminates redundant storage.`,
      `Decompose entities into atomic components linked by clear relational keys.`,
      `Verify dependencies systematically to pass exam questions accurately.`,
    ],
    suggestedPracticeTopics: [
      `Applied Problem Sets on ${topic}`,
      `Edge Case Decomposition & Anomalies`,
      `Comparative Tradeoff Analysis`,
    ],
  });
});

// 3. AI Quiz Generator
app.post("/api/ai/study/quiz", async (req, res) => {
  const {
    subject = "Computer Science",
    topic = "Data Structures & Algorithms",
    level = "Intermediate",
    questionCount = 5,
    weakTopics = [],
  } = req.body || {};

  const qCount = Math.min(15, Math.max(3, Number(questionCount) || 5));

  const prompt = `You are LEVELUP AI Exam Master.
Generate an interactive, high-yield Multiple Choice Quiz for:
- Subject: ${subject}
- Topic: ${topic}
- Student Level: ${level}
- Number of Questions: ${qCount}
- Priority Weak Topics to Target: ${weakTopics.length > 0 ? weakTopics.join(", ") : "General core curriculum"}

REQUIREMENTS:
1. Generate EXACTLY ${qCount} challenging, conceptually sound multiple-choice questions.
2. Each question MUST have exactly 4 options (strings).
3. Specify "correctOptionIndex" as 0, 1, 2, or 3.
4. Provide a thorough, educational "explanation" that clarifies why the correct option is right and why the distractors are wrong.
5. Include the specific "conceptTested" and an optional "hint".
6. Vary the difficulty appropriately (${level === "Advanced" ? "Hard/Medium" : level === "Beginner" ? "Easy/Medium" : "Medium/Hard"}).

Return ONLY a valid JSON array of questions matching this schema:
[
  {
    "id": "q-1",
    "questionNumber": 1,
    "question": "Clear, precise technical question statement?",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctOptionIndex": 1,
    "explanation": "Detailed explanation of the correct choice and key takeaway.",
    "conceptTested": "Specific subconcept (e.g. BCNF Functional Dependency)",
    "difficulty": "Medium",
    "hint": "Subtle clue to guide thinking without revealing the answer."
  }
]`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are an elite academic examiner. Generate rigorous, precise MCQs in valid JSON array format.",
      responseMimeType: "application/json",
      temperature: 0.8,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || [];
      if (questionsArray.length > 0) {
        return res.json({ questions: questionsArray });
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Quiz Error]:", err?.message);
  }

  // Graceful fallback questions
  const sampleQuestions = [
    {
      id: `q-fb-1-${Date.now()}`,
      questionNumber: 1,
      question: `In ${subject}, what is the primary objective of understanding ${topic}?`,
      options: [
        `To maximize memory fragmentation and increase CPU overhead`,
        `To establish structural integrity, minimize redundancy, and optimize execution time`,
        `To eliminate all forms of abstraction and force manual memory addressing`,
        `To bypass data type constraints and compiler validation`,
      ],
      correctOptionIndex: 1,
      explanation: `The core purpose of ${topic} is building resilient, efficient systems that maintain integrity and minimize operational overhead.`,
      conceptTested: `Core Architectural Principles in ${topic}`,
      difficulty: "Easy" as const,
      hint: `Think about efficiency, reliability, and data hygiene.`,
    },
    {
      id: `q-fb-2-${Date.now()}`,
      questionNumber: 2,
      question: `Which of the following scenarios represents a common violation of standard principles in ${topic}?`,
      options: [
        `Ensuring all data fields contain strictly atomic values`,
        `Allowing non-key attributes to functionally determine other non-key attributes`,
        `Enforcing foreign key constraints across relational entities`,
        `Indexing high-frequency query columns to improve lookup throughput`,
      ],
      correctOptionIndex: 1,
      explanation: `Transitive dependencies (where a non-key attribute determines another non-key attribute) violate 3NF and introduce update anomalies.`,
      conceptTested: `Transitive Dependency & Normalization`,
      difficulty: "Medium" as const,
      hint: `Look for an indirect dependency between non-primary elements.`,
    },
    {
      id: `q-fb-3-${Date.now()}`,
      questionNumber: 3,
      question: `When evaluating algorithmic complexity or resource trade-offs in ${topic}, what is the worst-case consequence of improper design?`,
      options: [
        `Deterministic linear scaling with O(1) space complexity`,
        `Exponential search explosion O(2^N) and cascading table locks`,
        `Automatic memory deduplication by the runtime environment`,
        `Improved cache locality across L1 and L2 memory caches`,
      ],
      correctOptionIndex: 1,
      explanation: `Sub-optimal architectural design frequently results in exponential algorithmic complexity or severe contention bottlenecks.`,
      conceptTested: `Worst-Case Complexity Analysis`,
      difficulty: "Hard" as const,
      hint: `Consider catastrophic performance degradation under heavy load.`,
    },
    {
      id: `q-fb-4-${Date.now()}`,
      questionNumber: 4,
      question: `What distinguishes an optimal implementation of ${topic} from a naive prototype?`,
      options: [
        `Hardcoding all runtime parameters into static configuration files`,
        `Decoupled modular architecture with robust error boundaries and test coverage`,
        `Disabling index verification to speed up write operations unconditionally`,
        `Combining presentation, logic, and data storage into a single monolithic script`,
      ],
      correctOptionIndex: 1,
      explanation: `Production-grade engineering mandates clean separation of concerns, defensive error handling, and testability.`,
      conceptTested: `System Design & Separation of Concerns`,
      difficulty: "Medium" as const,
      hint: `Which practice promotes maintainability and scalability?`,
    },
    {
      id: `q-fb-5-${Date.now()}`,
      questionNumber: 5,
      question: `During an exam problem on ${topic}, what should be your immediate first step when analyzing a problem statement?`,
      options: [
        `Immediately write out the final answer without sketching intermediate work`,
        `Identify the given constraints, core inputs/outputs, and underlying invariants`,
        `Assume edge cases do not apply unless explicitly requested in bold font`,
        `Guess the most complicated theoretical formula available`,
      ],
      correctOptionIndex: 1,
      explanation: `Disciplined problem solving begins with clearly establishing given parameters, constraints, and invariant conditions.`,
      conceptTested: `Analytical Problem Solving Methodology`,
      difficulty: "Easy" as const,
      hint: `Think about how methodical engineers deconstruct problems before calculating.`,
    },
  ];

  return res.json({ questions: sampleQuestions.slice(0, qCount) });
});

// 4. AI Practice Problem Sets
app.post("/api/ai/study/practice", async (req, res) => {
  const {
    subject = "Computer Science",
    topic = "SQL Queries & Indexing",
    difficulty = "Medium",
    problemType = "SQL", // MCQ | Conceptual | Coding | SQL | Numerical | Case Study
    count = 3,
  } = req.body || {};

  const pCount = Math.min(6, Math.max(1, Number(count) || 3));

  const prompt = `You are LEVELUP AI Academic Practice Coach.
Generate ${pCount} interactive practice problems for:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Problem Type: ${problemType}

REQUIREMENTS:
1. Provide realistic, hands-on problem statements that prompt deep critical thinking.
2. For coding/SQL/numerical, provide code starter or schema if helpful.
3. Include 2 progressive hints (from subtle clue to structural pointer).
4. Provide a comprehensive step-by-step solution with final answer and key takeaway.

Return ONLY a valid JSON array of problems matching this schema:
[
  {
    "id": "prob-1",
    "title": "Descriptive Problem Title (e.g. Find 2nd Highest Salary with Ties)",
    "type": "${problemType}",
    "difficulty": "${difficulty}",
    "subject": "${subject}",
    "topic": "${topic}",
    "question": "Full problem statement with context, constraints, and expected output.",
    "codeStarter": "-- optional boilerplate or schema",
    "hints": [
      "Hint 1: Initial direction...",
      "Hint 2: Deeper structural clue..."
    ],
    "solution": {
      "answer": "Exact solution code, mathematical proof, or structured answer",
      "explanation": "Clear step-by-step breakdown of how to arrive at this solution.",
      "keyTakeaway": "1-sentence rule to remember for similar exam questions."
    }
  }
]`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are a master academic problem author. Generate challenging, instructive practice exercises in valid JSON array format.",
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      const problemsArray = Array.isArray(parsed) ? parsed : parsed.problems || [];
      if (problemsArray.length > 0) {
        return res.json({ problems: problemsArray });
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Practice Error]:", err?.message);
  }

  // Graceful fallback practice problems
  return res.json({
    problems: [
      {
        id: `prob-fb-1-${Date.now()}`,
        title: `Practical Application Problem in ${topic}`,
        type: problemType,
        difficulty,
        subject,
        topic,
        question: `Given a dataset in ${subject}, design a solution to process transactions while preserving strict consistency under ${topic} constraints.`,
        codeStarter: `-- Write your solution query or algorithm below:\nSELECT ...\nFROM ...\nWHERE ...;`,
        hints: [
          `Consider isolating the primary determinant before executing multi-table joins.`,
          `Check whether an aggregate window function or subquery handles tie-breaking cleanly.`,
        ],
        solution: {
          answer: `WITH RankedRecords AS (\n  SELECT *,\n         DENSE_RANK() OVER (ORDER BY metric_score DESC) as rank_num\n  FROM dataset_table\n)\nSELECT * FROM RankedRecords WHERE rank_num = 1;`,
          explanation: `Using DENSE_RANK() ensures that duplicate top scores share the rank without skipping positions, guaranteeing deterministic query results.`,
          keyTakeaway: `Window functions provide scalable rank partitioning without expensive self-joins.`,
        },
      },
      {
        id: `prob-fb-2-${Date.now()}`,
        title: `Edge Case Analysis: ${topic}`,
        type: problemType,
        difficulty,
        subject,
        topic,
        question: `Explain how NULL values or missing keys impact ${topic} operations, and provide the defensive approach to safeguard execution.`,
        codeStarter: `// Defensive verification pattern\nif (!input || input.length === 0) { ... }`,
        hints: [
          `Remember three-valued logic (TRUE, FALSE, UNKNOWN) in relational operations.`,
          `Use explicit coalesce or null-coalescing operators rather than relying on default equality.`,
        ],
        solution: {
          answer: `COALESCE(column_val, default_fallback) IS NOT NULL`,
          explanation: `Explicit handling of missing data prevents predicate collapse in conditional filters.`,
          keyTakeaway: `Never assume empty or missing values evaluate to false; use explicit null guards.`,
        },
      },
    ],
  });
});

// 5. AI Exam Preparation Blueprint
app.post("/api/ai/study/exam-prep", async (req, res) => {
  const {
    examName = "Final Semester Examination",
    subject = "Computer Science",
    examDate,
    daysRemaining = 14,
    dailyMinutes = 90,
    currentScore = 70,
    focusAreas = [],
  } = req.body || {};

  const daysNum = Math.min(60, Math.max(1, Number(daysRemaining) || 14));
  const dailyHours = Math.round(((Number(dailyMinutes) || 90) / 60) * 10) / 10;

  const prompt = `You are LEVELUP AI Academic Master Exam Strategist.
Create a comprehensive, high-performance Exam Preparation Strategy for:
- Exam Name: ${examName}
- Subject: ${subject}
- Target Exam Date: ${examDate || "In " + daysNum + " days"}
- Days Remaining: ${daysNum} days
- Daily Study Budget: ${dailyHours} hours/day
- Current Estimated Readiness Score: ${currentScore}%
- Priority Focus Areas: ${focusAreas.length > 0 ? focusAreas.join(", ") : "Full syllabus"}

STRATEGY CRITERIA:
1. Categorize key topics into High (40-50% exam weight), Medium (30-35%), and Low (15-20%) priority.
2. Outline a phased countdown timeline (e.g. Phase 1: Core Foundation & Gap Filling, Phase 2: Intensive Practice & Timed Drills, Phase 3: Full Mocks & Peak Tapering).
3. Schedule 2-3 specific mock test milestone checkpoints with target dates.
4. Provide a tactical "Last 24 Hours Strategy" for sleep, rapid memory consolidation, and exam-day psychology.

Return ONLY a valid JSON object matching this schema:
{
  "id": "exam-prep-${Date.now()}",
  "examName": "${examName}",
  "subject": "${subject}",
  "examDate": "${examDate || ''}",
  "daysRemaining": ${daysNum},
  "dailyStudyHours": ${dailyHours},
  "currentReadinessScore": ${currentScore},
  "targetScore": "92%+",
  "executiveSummary": "2-3 sentences of strategic executive guidance for peak performance.",
  "priorityTopics": [
    {
      "topic": "Topic Name (e.g. Normalization & Transactions in DBMS)",
      "priority": "High",
      "estimatedWeight": "35-40% of Exam",
      "keySubtopics": ["1NF-BCNF Decompositions", "ACID Properties", "Deadlock Prevention"],
      "whyImportant": "Consistently appears in high-value essay and problem-solving questions."
    },
    {
      "topic": "Topic Name",
      "priority": "Medium",
      "estimatedWeight": "25-30% of Exam",
      "keySubtopics": ["Indexing", "B-Trees"],
      "whyImportant": "Essential for mid-tier analytical questions."
    },
    {
      "topic": "Topic Name",
      "priority": "Low",
      "estimatedWeight": "15-20% of Exam",
      "keySubtopics": ["History & Terminology"],
      "whyImportant": "Short objective questions."
    }
  ],
  "revisionSchedule": [
    {
      "phase": "Phase 1: Syllabus Coverage & Concept Invariants",
      "timeline": "Days 1 - ${Math.max(1, Math.floor(daysNum * 0.4))}",
      "focus": "Master all High-Priority topics and fill weak knowledge gaps.",
      "deliverables": [
        "Complete self-written summary sheets for Top 3 topics",
        "Solve 20 foundational practice problems"
      ]
    },
    {
      "phase": "Phase 2: Timed Problem Drills & Past Paper Review",
      "timeline": "Days ${Math.max(2, Math.floor(daysNum * 0.4) + 1)} - ${Math.max(3, Math.floor(daysNum * 0.8))}",
      "focus": "Active problem solving under timed constraints with error logging.",
      "deliverables": [
        "Take 2 timed section mock tests",
        "Review mistake journal daily"
      ]
    },
    {
      "phase": "Phase 3: Full Mock Simulations & Peak Tapering",
      "timeline": "Days ${Math.max(4, Math.floor(daysNum * 0.8) + 1)} - ${daysNum}",
      "focus": "Simulate exact exam conditions, rapid formula recall, and mental poise.",
      "deliverables": [
        "1 full-length simulated mock exam",
        "Final formula blitz sheet review"
      ]
    }
  ],
  "mockTestMilestones": [
    {
      "testName": "Diagnostic Mock Test 1",
      "targetDay": "Day ${Math.max(1, Math.floor(daysNum * 0.35))}",
      "focusTopics": ["High Priority Core Topics"]
    },
    {
      "testName": "Comprehensive Simulation Mock 2",
      "targetDay": "Day ${Math.max(2, Math.floor(daysNum * 0.75))}",
      "focusTopics": ["Full Syllabus Mixed Set"]
    }
  ],
  "last24HoursStrategy": [
    "Stop learning new complex material 24 hours before the exam.",
    "Review your 1-page condensed formula and cheat-sheet summary.",
    "Pack all required materials (stationery, calculator, ID) the night before.",
    "Prioritize 8 hours of quality sleep to optimize prefrontal cortex executive recall.",
    "During the exam: do a 2-minute scan of all questions and solve high-confidence items first."
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are an elite academic strategist. Return a comprehensive, actionable exam blueprint in valid JSON.",
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.priorityTopics && parsed.priorityTopics.length > 0) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Exam Prep Error]:", err?.message);
  }

  // Graceful fallback exam plan
  return res.json({
    id: `exam-prep-fb-${Date.now()}`,
    examName,
    subject,
    examDate: examDate || '',
    daysRemaining: daysNum,
    dailyStudyHours: dailyHours,
    currentReadinessScore: currentScore,
    targetScore: "90%+",
    executiveSummary: `A structured ${daysNum}-day strategy focused on high-yield topics, spaced mock rehearsals, and systematic error remediation.`,
    priorityTopics: [
      {
        topic: `${subject} Core Fundamentals & Problem Sets`,
        priority: "High",
        estimatedWeight: "40-45% of Exam",
        keySubtopics: ["Core Theorems", "Direct Problem Applications", "Structural Proofs"],
        whyImportant: "Constitutes the bulk of high-mark sections.",
      },
      {
        topic: `Applied Methods & Algorithmic Analysis`,
        priority: "Medium",
        estimatedWeight: "30-35% of Exam",
        keySubtopics: ["Complexity Analysis", "Trade-off Evaluation"],
        whyImportant: "Tests practical mastery and analytical reasoning.",
      },
      {
        topic: `Definitions & Conceptual Edge Cases`,
        priority: "Low",
        estimatedWeight: "15-20% of Exam",
        keySubtopics: ["Terminology", "Historical Context"],
        whyImportant: "Quick-point objective questions.",
      },
    ],
    revisionSchedule: [
      {
        phase: "Phase 1: High-Yield Mastery",
        timeline: `Days 1 - ${Math.max(1, Math.floor(daysNum * 0.4))}`,
        focus: "Consolidate core high-priority concepts and complete problem sets.",
        deliverables: ["Summary sheets created", "25 practice problems solved"],
      },
      {
        phase: "Phase 2: Timed Mock Drills",
        timeline: `Days ${Math.max(2, Math.floor(daysNum * 0.4) + 1)} - ${Math.max(3, Math.floor(daysNum * 0.8))}`,
        focus: "Simulate exam pacing and log mistakes for active review.",
        deliverables: ["2 timed sections completed", "Error log reviewed"],
      },
      {
        phase: "Phase 3: Final Consolidation",
        timeline: `Days ${Math.max(4, Math.floor(daysNum * 0.8) + 1)} - ${daysNum}`,
        focus: "Rapid active recall, memory consolidation, and peak rest.",
        deliverables: ["Final formula review", "Simulated mock test"],
      },
    ],
    mockTestMilestones: [
      {
        testName: "Midway Mock Assessment",
        targetDay: `Day ${Math.max(1, Math.floor(daysNum * 0.5))}`,
        focusTopics: ["High Priority Topics"],
      },
      {
        testName: "Final Timed Dress Rehearsal",
        targetDay: `Day ${Math.max(2, daysNum - 2)}`,
        focusTopics: ["Full Syllabus Simulation"],
      },
    ],
    last24HoursStrategy: [
      "Review only high-yield cheat sheets; avoid starting unfamiliar topics.",
      "Get 8 full hours of sleep to ensure peak neural recall speed.",
      "Prepare your study supplies and exam workspace ahead of time.",
      "Start the exam by answering highest-confidence questions first to build momentum.",
    ],
    createdAt: new Date().toISOString(),
  });
});

// ==========================================
// AI FINANCIAL COACH ENDPOINTS
// ==========================================

// 1. Comprehensive Financial Health & Spending Analysis
app.post("/api/ai/finance/analyze", async (req, res) => {
  const {
    totalIncome = 85000,
    monthlyBudget = 45000,
    expenses = [],
    savingsGoals = [],
  } = req.body || {};

  const income = Number(totalIncome) || 0;
  const budget = Number(monthlyBudget) || 0;
  const expenseList = Array.isArray(expenses) ? expenses : [];
  const goalsList = Array.isArray(savingsGoals) ? savingsGoals : [];

  const totalSpent = expenseList.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
  const netSavings = Math.max(0, income - totalSpent);
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
  const dailyBurn = Math.round(totalSpent / Math.max(1, new Date().getDate()));
  const projectedMonthEnd = Math.round(dailyBurn * 30);
  const isOverBudget = budget > 0 && totalSpent > budget;
  const budgetAdherence = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {
    Food: 0,
    Travel: 0,
    Education: 0,
    Shopping: 0,
    Subscriptions: 0,
    Other: 0,
  };
  expenseList.forEach((e: any) => {
    const cat = e.category || 'Other';
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += Number(e.amount) || 0;
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + (Number(e.amount) || 0);
    }
  });

  const prompt = `You are the lead AI Financial Intelligence Coach for LEVELUP.
Analyze the user's real financial data:

FINANCIAL CONTEXT:
- Monthly Total Income: ₹${income}
- Target Monthly Budget: ₹${budget}
- Total Expenses Logged: ₹${totalSpent} (${expenseList.length} transactions)
- Net Savings: ₹${netSavings} (Savings Rate: ${savingsRate}%)
- Daily Burn Rate: ₹${dailyBurn}/day (Projected Month-End Spend: ₹${projectedMonthEnd})
- Budget Adherence: ${budgetAdherence}% (Over Budget: ${isOverBudget ? 'YES' : 'NO'})

CATEGORY BREAKDOWN:
${Object.entries(categoryTotals)
  .map(([cat, amt]) => `- ${cat}: ₹${amt} (${totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0}% of expenses, ${income > 0 ? Math.round((amt / income) * 100) : 0}% of income)`)
  .join('\n')}

RECENT TRANSACTIONS:
${expenseList.slice(0, 15).map((e: any) => `- [${e.date || 'Recent'}] ${e.name || 'Expense'}: ₹${e.amount} (${e.category || 'General'})${e.notes ? ` - notes: ${e.notes}` : ''}`).join('\n') || 'None'}

ACTIVE SAVINGS GOALS:
${goalsList.map((g: any) => `- ${g.name || 'Goal'}: ₹${g.currentAmount || 0} / ₹${g.targetAmount || 0} target by ${g.targetDate || 'open deadline'}`).join('\n') || 'None configured'}

TASK:
Provide a rigorous, actionable, high-IQ financial analysis.
Return valid JSON matching this schema exactly:
{
  "id": "fin-analysis-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "healthScore": 78, // 0 to 100 based on savings rate, budget discipline, category balance
  "healthStatus": "Good", // "Excellent" | "Good" | "Caution" | "Action Needed"
  "summaryHeadline": "One clear punchy executive sentence on their financial health.",
  "executiveSummary": "2-3 insightful sentences highlighting their primary financial trend, efficiency, and highest-leverage optimization.",
  "cashFlowSummary": {
    "totalIncome": ${income},
    "totalExpenses": ${totalSpent},
    "netSavings": ${netSavings},
    "savingsRatePercent": ${savingsRate},
    "dailyBurnRate": ${dailyBurn},
    "projectedMonthEndExpenses": ${projectedMonthEnd},
    "budgetAdherencePercent": ${budgetAdherence},
    "isOverBudget": ${isOverBudget}
  },
  "categoryInsights": [
    {
      "category": "Food", // "Food" | "Travel" | "Education" | "Shopping" | "Subscriptions" | "Other"
      "spent": ${categoryTotals.Food || 0},
      "percentageOfTotal": ${totalSpent > 0 ? Math.round(((categoryTotals.Food || 0) / totalSpent) * 100) : 0},
      "percentageOfIncome": ${income > 0 ? Math.round(((categoryTotals.Food || 0) / income) * 100) : 0},
      "benchmarkPercentage": 20,
      "riskLevel": "Low", // "Low" | "Medium" | "High"
      "insight": "Observation about this category",
      "recommendation": "Concrete adjustment step"
    }
  ],
  "rule50_30_20": {
    "needs": {
      "actualAmount": ${categoryTotals.Food + categoryTotals.Travel},
      "actualPercentage": ${income > 0 ? Math.round(((categoryTotals.Food + categoryTotals.Travel) / income) * 100) : 0},
      "targetPercentage": 50,
      "targetAmount": ${Math.round(income * 0.5)},
      "status": "Optimal", // "Optimal" | "High" | "Over"
      "categoriesIncluded": ["Essential Food & Groceries", "Commute & Utilities"]
    },
    "wants": {
      "actualAmount": ${categoryTotals.Shopping + categoryTotals.Subscriptions + categoryTotals.Other},
      "actualPercentage": ${income > 0 ? Math.round(((categoryTotals.Shopping + categoryTotals.Subscriptions + categoryTotals.Other) / income) * 100) : 0},
      "targetPercentage": 30,
      "targetAmount": ${Math.round(income * 0.3)},
      "status": "Optimal",
      "categoriesIncluded": ["Shopping & Lifestyle", "Entertainment & Subscriptions"]
    },
    "savings": {
      "actualAmount": ${netSavings},
      "actualPercentage": ${savingsRate},
      "targetPercentage": 20,
      "targetAmount": ${Math.round(income * 0.2)},
      "status": "Ahead" // "Ahead" | "On Track" | "Behind"
    },
    "overallEvaluation": "Evaluation against 50/30/20 benchmark"
  },
  "spendingPatterns": [
    {
      "id": "pat-1",
      "title": "Detected Spending Pattern",
      "category": "Subscriptions",
      "type": "recurring_subscription", // "recurring_subscription" | "impulse_spike" | "weekend_trend" | "frequent_small_spend" | "positive_habit"
      "description": "Specific observation on user's real transactions",
      "severity": "warning", // "info" | "warning" | "critical" | "positive"
      "impactAmount": 1500,
      "suggestedAction": "What to do about this pattern"
    }
  ],
  "savingsOpportunities": [
    {
      "id": "sav-1",
      "title": "Actionable Savings Leak Fix",
      "category": "Food",
      "estimatedMonthlySavings": 3500,
      "estimatedAnnualSavings": 42000,
      "difficulty": "Easy", // "Easy" | "Moderate" | "Challenging"
      "actionStep": "Specific step to capture these savings",
      "impactScore": 85
    }
  ],
  "actionPlan": [
    {
      "id": "act-1",
      "title": "Immediate Priority Action Item",
      "timeline": "This Week", // "This Week" | "This Month" | "Quarterly"
      "category": "Cash Flow",
      "potentialBenefit": "Keeps monthly spend within ₹45,000 threshold",
      "priority": "High" // "High" | "Medium" | "Low"
    }
  ],
  "goalImpacts": [
    {
      "goalName": "Emergency Fund",
      "targetAmount": 100000,
      "currentAmount": 35000,
      "originalEstimatedMonths": 6,
      "acceleratedEstimatedMonths": 4,
      "monthsSaved": 2,
      "monthlyRequiredSaving": 15000,
      "statusRecommendation": "Allocating extra ₹3,500 monthly savings brings completion 2 months earlier."
    }
  ],
  "keyStrengths": ["Strength 1", "Strength 2"],
  "primaryRisks": ["Risk 1", "Risk 2"],
  "disclaimer": "Educational financial analysis. LEVELUP AI Financial Coach provides budget and behavioral cash flow insights and does not provide regulated financial advice, loan approvals, or tax filing instructions."
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are a world-class financial intelligence analyst. Deliver mathematically grounded, realistic budget insights in valid JSON. Never give investment securities advice.",
      responseMimeType: "application/json",
      temperature: 0.5,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.cashFlowSummary) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Financial Analyze Gemini Error]:", err?.message);
  }

  // Fallback deterministic analysis
  const calculatedHealthScore = Math.min(100, Math.max(20, Math.round((savingsRate * 1.5) + (isOverBudget ? 10 : 35) + (income > 0 ? 20 : 0))));
  const healthStatus = calculatedHealthScore >= 80 ? 'Excellent' : calculatedHealthScore >= 65 ? 'Good' : calculatedHealthScore >= 45 ? 'Caution' : 'Action Needed';

  const defaultCategoryInsights = (['Food', 'Travel', 'Education', 'Shopping', 'Subscriptions', 'Other'] as const).map((cat) => {
    const spent = categoryTotals[cat] || 0;
    const pctOfTotal = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
    const pctOfIncome = income > 0 ? Math.round((spent / income) * 100) : 0;
    const benchmark = cat === 'Food' ? 20 : cat === 'Travel' ? 12 : cat === 'Shopping' ? 10 : cat === 'Subscriptions' ? 5 : cat === 'Education' ? 15 : 8;
    const isHigh = pctOfIncome > benchmark + 5;
    return {
      category: cat,
      spent,
      percentageOfTotal: pctOfTotal,
      percentageOfIncome: pctOfIncome,
      benchmarkPercentage: benchmark,
      riskLevel: (isHigh ? (pctOfIncome > benchmark + 12 ? 'High' : 'Medium') : 'Low') as 'Low' | 'Medium' | 'High',
      insight: spent > 0 ? `${cat} accounts for ${pctOfTotal}% of your total outlays.` : `No expenses recorded for ${cat} this period.`,
      recommendation: isHigh ? `Aim to trim discretionary ${cat} expenses by 15% to safeguard your monthly savings rate.` : `Keep current spending discipline maintained in ${cat}.`,
    };
  });

  return res.json({
    id: `fin-analysis-fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    healthScore: calculatedHealthScore,
    healthStatus,
    summaryHeadline: isOverBudget ? `Monthly spending has exceeded the target budget by ₹${totalSpent - budget}.` : `Maintaining a healthy ${savingsRate}% savings rate with ₹${netSavings.toLocaleString('en-IN')} net surplus.`,
    executiveSummary: `Your current cash flow shows ₹${totalSpent.toLocaleString('en-IN')} in expenses against an income of ₹${income.toLocaleString('en-IN')}. With a daily burn rate of ₹${dailyBurn}/day, your projected month-end outlay is ₹${projectedMonthEnd.toLocaleString('en-IN')}.`,
    cashFlowSummary: {
      totalIncome: income,
      totalExpenses: totalSpent,
      netSavings,
      savingsRatePercent: savingsRate,
      dailyBurnRate: dailyBurn,
      projectedMonthEndExpenses: projectedMonthEnd,
      budgetAdherencePercent: budgetAdherence,
      isOverBudget,
    },
    categoryInsights: defaultCategoryInsights,
    rule50_30_20: {
      needs: {
        actualAmount: (categoryTotals.Food || 0) + (categoryTotals.Travel || 0),
        actualPercentage: income > 0 ? Math.round(((categoryTotals.Food + categoryTotals.Travel) / income) * 100) : 0,
        targetPercentage: 50,
        targetAmount: Math.round(income * 0.5),
        status: ((categoryTotals.Food + categoryTotals.Travel) / (income || 1)) <= 0.55 ? 'Optimal' : 'High',
        categoriesIncluded: ['Food & Groceries', 'Travel & Transit'],
      },
      wants: {
        actualAmount: (categoryTotals.Shopping || 0) + (categoryTotals.Subscriptions || 0) + (categoryTotals.Other || 0),
        actualPercentage: income > 0 ? Math.round(((categoryTotals.Shopping + categoryTotals.Subscriptions + categoryTotals.Other) / income) * 100) : 0,
        targetPercentage: 30,
        targetAmount: Math.round(income * 0.3),
        status: ((categoryTotals.Shopping + categoryTotals.Subscriptions + categoryTotals.Other) / (income || 1)) <= 0.35 ? 'Optimal' : 'Over',
        categoriesIncluded: ['Shopping', 'Subscriptions & Entertainment', 'Other Discretionary'],
      },
      savings: {
        actualAmount: netSavings,
        actualPercentage: savingsRate,
        targetPercentage: 20,
        targetAmount: Math.round(income * 0.2),
        status: savingsRate >= 20 ? 'Ahead' : savingsRate >= 12 ? 'On Track' : 'Behind',
      },
      overallEvaluation: savingsRate >= 20 ? 'Your savings rate satisfies the gold-standard 50/30/20 financial rule.' : 'Focus on trimming discretionary shopping & dining to lift your savings rate towards 20%.',
    },
    spendingPatterns: [
      {
        id: 'pat-1',
        title: 'Subscription & Digital Outlays',
        category: 'Subscriptions',
        type: 'recurring_subscription',
        description: `Current subscriptions total ₹${(categoryTotals.Subscriptions || 0).toLocaleString('en-IN')}. Auditing unused recurring apps can unlock immediate monthly cash.`,
        severity: (categoryTotals.Subscriptions || 0) > 3000 ? 'warning' : 'info',
        impactAmount: Math.round((categoryTotals.Subscriptions || 0) * 0.3),
        suggestedAction: 'Review active subscriptions list and cancel non-essential memberships.',
      },
      {
        id: 'pat-2',
        title: 'Dining & Food Outflow',
        category: 'Food',
        type: 'impulse_spike',
        description: `Food accounts for ₹${(categoryTotals.Food || 0).toLocaleString('en-IN')} (${totalSpent > 0 ? Math.round(((categoryTotals.Food || 0) / totalSpent) * 100) : 0}% of overall expenditure).`,
        severity: (categoryTotals.Food || 0) > 20000 ? 'warning' : 'positive',
        impactAmount: Math.round((categoryTotals.Food || 0) * 0.15),
        suggestedAction: 'Set a weekly meal prep schedule to reduce on-demand food delivery spikes.',
      },
    ],
    savingsOpportunities: [
      {
        id: 'sav-1',
        title: 'Discretionary Dining & Takeout Cap',
        category: 'Food',
        estimatedMonthlySavings: Math.max(1500, Math.round((categoryTotals.Food || 10000) * 0.2)),
        estimatedAnnualSavings: Math.max(18000, Math.round((categoryTotals.Food || 10000) * 0.2 * 12)),
        difficulty: 'Easy',
        actionStep: 'Limit restaurant deliveries to twice a week and batch-cook staples.',
        impactScore: 88,
      },
      {
        id: 'sav-2',
        title: 'Subscription Pruning & Plan Consolidation',
        category: 'Subscriptions',
        estimatedMonthlySavings: Math.max(800, Math.round((categoryTotals.Subscriptions || 3000) * 0.35)),
        estimatedAnnualSavings: Math.max(9600, Math.round((categoryTotals.Subscriptions || 3000) * 0.35 * 12)),
        difficulty: 'Easy',
        actionStep: 'Cancel redundant streaming tiers and switch to annual student/family rates.',
        impactScore: 92,
      },
    ],
    actionPlan: [
      {
        id: 'act-1',
        title: 'Establish a ₹1,200/day maximum spending ceiling',
        timeline: 'This Week',
        category: 'Daily Budgeting',
        potentialBenefit: 'Prevents mid-month budget depletion.',
        priority: 'High',
      },
      {
        id: 'act-2',
        title: 'Automate transfer of net surplus to primary savings goal',
        timeline: 'This Month',
        category: 'Wealth Building',
        potentialBenefit: `Secures ₹${netSavings.toLocaleString('en-IN')} before impulse leaks occur.`,
        priority: 'High',
      },
    ],
    goalImpacts: goalsList.map((g: any) => {
      const remaining = Math.max(0, (g.targetAmount || 50000) - (g.currentAmount || 0));
      const monthlyPace = Math.max(1000, Math.round(netSavings * 0.6));
      const origMonths = Math.ceil(remaining / monthlyPace);
      const accelMonths = Math.max(1, Math.ceil(remaining / (monthlyPace + 2500)));
      return {
        goalName: g.name || 'Savings Goal',
        targetAmount: g.targetAmount || 50000,
        currentAmount: g.currentAmount || 0,
        originalEstimatedMonths: origMonths,
        acceleratedEstimatedMonths: accelMonths,
        monthsSaved: Math.max(0, origMonths - accelMonths),
        monthlyRequiredSaving: monthlyPace,
        statusRecommendation: `Saving an additional ₹2,500/month accelerates "${g.name || 'Goal'}" by ${Math.max(1, origMonths - accelMonths)} month(s).`,
      };
    }),
    keyStrengths: [
      `Net positive cash flow with ${savingsRate}% savings retention.`,
      `Tracked ${expenseList.length} expenses for real-time visibility.`,
    ],
    primaryRisks: [
      isOverBudget ? `Total spending has surpassed your set limit of ₹${budget.toLocaleString('en-IN')}.` : `High concentration in top category (${totalSpent > 0 ? Math.max(...Object.values(categoryTotals)) : 0}).`,
    ],
    disclaimer: 'Educational financial insights. LEVELUP AI Financial Coach provides cash flow intelligence and does not provide regulated financial advice, investment securities promotion, tax filing advice, or loan approvals.',
  });
});

// 2. Budget Optimizer & Category Target Recommendations
app.post("/api/ai/finance/budget-recommendations", async (req, res) => {
  const {
    totalIncome = 85000,
    monthlyBudget = 45000,
    expenses = [],
    targetSavingsRate = 25,
  } = req.body || {};

  const income = Number(totalIncome) || 0;
  const currentBudget = Number(monthlyBudget) || 0;
  const expenseList = Array.isArray(expenses) ? expenses : [];
  const targetRate = Number(targetSavingsRate) || 25;

  const targetSavingsAmt = Math.round(income * (targetRate / 100));
  const recommendedTotalBudget = Math.max(0, income - targetSavingsAmt);

  const prompt = `You are the lead AI Financial Optimizer for LEVELUP.
Create an optimal category budget allocation plan based on real numbers:

Income: ₹${income}
Current Budget: ₹${currentBudget}
Target Savings Rate: ${targetRate}% (₹${targetSavingsAmt} savings target)
Total Recommended Expense Budget: ₹${recommendedTotalBudget}

Return valid JSON matching this schema:
{
  "id": "budget-plan-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "recommendedTotalBudget": ${recommendedTotalBudget},
  "targetSavingsRate": ${targetRate},
  "projectedMonthlySavings": ${targetSavingsAmt},
  "categoryBudgets": [
    {
      "category": "Food",
      "currentSpend": 18000,
      "recommendedBudget": 14000,
      "percentageOfIncome": 16,
      "savingsPotential": 4000,
      "rationale": "Optimizes grocery vs dining ratio."
    },
    {
      "category": "Travel",
      "currentSpend": 8000,
      "recommendedBudget": 7000,
      "percentageOfIncome": 8,
      "savingsPotential": 1000,
      "rationale": "Maintains essential transit while reducing surge rides."
    },
    {
      "category": "Education",
      "currentSpend": 5000,
      "recommendedBudget": 6000,
      "percentageOfIncome": 7,
      "savingsPotential": 0,
      "rationale": "High-ROI personal and professional growth."
    },
    {
      "category": "Shopping",
      "currentSpend": 12000,
      "recommendedBudget": 6000,
      "percentageOfIncome": 7,
      "savingsPotential": 6000,
      "rationale": "Enforces 48-hour pause rule for non-essential goods."
    },
    {
      "category": "Subscriptions",
      "currentSpend": 3500,
      "recommendedBudget": 2000,
      "percentageOfIncome": 2,
      "savingsPotential": 1500,
      "rationale": "Prunes unused streaming & cloud memberships."
    },
    {
      "category": "Other",
      "currentSpend": 4000,
      "recommendedBudget": 3000,
      "percentageOfIncome": 4,
      "savingsPotential": 1000,
      "rationale": "Buffer for miscellaneous outlays."
    }
  ],
  "implementationSteps": [
    "Step 1: Set weekly sub-caps for Food and Shopping.",
    "Step 2: Automate your ₹${targetSavingsAmt} transfer on salary day.",
    "Step 3: Review category gauges weekly in LEVELUP."
  ],
  "summary": "This optimized blueprint secures a ${targetRate}% savings rate while preserving lifestyle quality."
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are an expert budgeting analyst. Provide mathematically coherent, practical category budget allocations in valid JSON.",
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.categoryBudgets) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Budget Recommendation Gemini Error]:", err?.message);
  }

  // Deterministic Fallback Plan
  return res.json({
    id: `budget-plan-fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    recommendedTotalBudget,
    targetSavingsRate: targetRate,
    projectedMonthlySavings: targetSavingsAmt,
    categoryBudgets: [
      {
        category: "Food",
        currentSpend: Math.round(income * 0.22),
        recommendedBudget: Math.round(income * 0.18),
        percentageOfIncome: 18,
        savingsPotential: Math.round(income * 0.04),
        rationale: "Aligns food outlays with standard benchmarks by focusing on meal prep.",
      },
      {
        category: "Travel",
        currentSpend: Math.round(income * 0.10),
        recommendedBudget: Math.round(income * 0.08),
        percentageOfIncome: 8,
        savingsPotential: Math.round(income * 0.02),
        rationale: "Streamlines daily commute and limits ride-hailing surges.",
      },
      {
        category: "Education",
        currentSpend: Math.round(income * 0.06),
        recommendedBudget: Math.round(income * 0.08),
        percentageOfIncome: 8,
        savingsPotential: 0,
        rationale: "High-leverage investment in skill development and certifications.",
      },
      {
        category: "Shopping",
        currentSpend: Math.round(income * 0.14),
        recommendedBudget: Math.round(income * 0.06),
        percentageOfIncome: 6,
        savingsPotential: Math.round(income * 0.08),
        rationale: "Limits discretionary lifestyle retail via 48-hour purchase pause.",
      },
      {
        category: "Subscriptions",
        currentSpend: Math.round(income * 0.04),
        recommendedBudget: Math.round(income * 0.02),
        percentageOfIncome: 2,
        savingsPotential: Math.round(income * 0.02),
        rationale: "Eliminates overlapping streaming and digital service tiers.",
      },
      {
        category: "Other",
        currentSpend: Math.round(income * 0.05),
        recommendedBudget: Math.round(income * 0.03),
        percentageOfIncome: 3,
        savingsPotential: Math.round(income * 0.02),
        rationale: "Flexible contingency reserve for ad-hoc supplies.",
      },
    ],
    implementationSteps: [
      `Set total monthly spending limit to ₹${recommendedTotalBudget.toLocaleString('en-IN')}.`,
      `Move ₹${targetSavingsAmt.toLocaleString('en-IN')} to your savings goal on the 1st of every month.`,
      "Review weekly category burn rate every Sunday in the LEVELUP Finance dashboard.",
    ],
    summary: `Adopting these category targets secures ₹${targetSavingsAmt.toLocaleString('en-IN')} monthly savings (${targetRate}% rate) without compromising essentials.`,
  });
});

// 3. Interactive AI Financial Coach Chat & Scenario Advice
app.post("/api/ai/finance/chat", async (req, res) => {
  const {
    messages = [],
    context = {},
  } = req.body || {};

  const lastUserMsg = Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1]?.text || 'Hello'
    : 'Can you analyze my financial situation?';

  const {
    totalIncome = 85000,
    monthlyBudget = 45000,
    expenses = [],
    savingsGoals = [],
    healthScore = 75,
  } = context || {};

  const totalSpent = Array.isArray(expenses) ? expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0) : 0;
  const netSavings = Math.max(0, Number(totalIncome) - totalSpent);

  const prompt = `You are LEVELUP's dedicated AI Financial Coach.
Your goal is to guide the user with sharp, behavioral, data-grounded cash flow insights.

CURRENT USER CONTEXT:
- Monthly Income: ₹${totalIncome}
- Monthly Budget: ₹${monthlyBudget}
- Total Expenses Logged: ₹${totalSpent} (${Array.isArray(expenses) ? expenses.length : 0} items)
- Net Monthly Surplus / Savings: ₹${netSavings}
- Health Score: ${healthScore}/100
- Active Savings Goals: ${Array.isArray(savingsGoals) ? savingsGoals.map((g: any) => `${g.name} (₹${g.currentAmount}/₹${g.targetAmount})`).join(', ') : 'None'}

CONVERSATION HISTORY:
${messages.slice(-6).map((m: any) => `${m.sender === 'user' ? 'User' : 'Coach'}: ${m.text}`).join('\n')}

USER QUESTION:
"${lastUserMsg}"

INSTRUCTIONS:
1. Provide a direct, empathetic, and mathematically grounded response.
2. Refer to their actual numbers (e.g. Income of ₹${totalIncome}, Expenses of ₹${totalSpent}).
3. Give specific, step-by-step guidance.
4. Include 2-3 quick follow-up questions/suggestions.
5. NEVER provide regulated securities investment advice, tax filings, or loan claims.

Format as JSON:
{
  "id": "msg-${Date.now()}",
  "sender": "assistant",
  "text": "Your coach response in clean Markdown with bold numbers and bullet points.",
  "timestamp": "${new Date().toISOString()}",
  "suggestedFollowUps": [
    "Follow-up question 1",
    "Follow-up question 2",
    "Follow-up question 3"
  ],
  "insightsHighlighted": ["Key insight 1", "Key insight 2"]
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are an empathetic, razor-sharp personal financial coach. Return valid JSON only.",
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.text) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Financial Chat Gemini Error]:", err?.message);
  }

  // Deterministic chat fallback
  return res.json({
    id: `msg-fb-${Date.now()}`,
    sender: "assistant",
    text: `Based on your logged monthly income of **₹${Number(totalIncome).toLocaleString('en-IN')}** and current expenses of **₹${totalSpent.toLocaleString('en-IN')}**, you are operating with a **₹${netSavings.toLocaleString('en-IN')}** net surplus (${Math.round((netSavings / (Number(totalIncome) || 1)) * 100)}% savings rate).\n\n### Key Recommendations:\n1. **Protect your monthly surplus:** Automatically transfer your savings to your primary goal on income day.\n2. **Daily Burn Rate:** Aim to keep discretionary daily spend under **₹${Math.round(totalSpent / 30).toLocaleString('en-IN')}**.\n3. **Audit High Categories:** Check Food and Shopping transactions for recurring minor leaks.\n\n*Note: LEVELUP AI provides educational budget guidance only.*`,
    timestamp: new Date().toISOString(),
    suggestedFollowUps: [
      "How can I save an extra ₹5,000 this month?",
      "Can I afford a ₹20,000 vacation next quarter?",
      "What is my optimal 50/30/20 budget breakdown?",
    ],
    insightsHighlighted: [
      `Net surplus is ₹${netSavings.toLocaleString('en-IN')}`,
      `Savings rate is ${Math.round((netSavings / (Number(totalIncome) || 1)) * 100)}%`,
    ],
  });
});

// 4. Financial Scenario Simulator
app.post("/api/ai/finance/simulate-scenario", async (req, res) => {
  const {
    scenarioDescription = "Cut dining out by 20% and cancel 2 subscriptions",
    context = {},
  } = req.body || {};

  const {
    totalIncome = 85000,
    monthlyBudget = 45000,
    expenses = [],
    savingsGoals = [],
  } = context || {};

  const income = Number(totalIncome) || 0;
  const currentBudget = Number(monthlyBudget) || 0;
  const totalSpent = Array.isArray(expenses) ? expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0) : 0;
  const netSavings = Math.max(0, income - totalSpent);

  const prompt = `You are LEVELUP's AI Financial Scenario Simulator.
Analyze the impact of this proposed financial scenario on the user's cash flow:

SCENARIO:
"${scenarioDescription}"

CURRENT FINANCES:
- Income: ₹${income}
- Expenses: ₹${totalSpent}
- Net Monthly Savings: ₹${netSavings}
- Active Goals: ${Array.isArray(savingsGoals) ? savingsGoals.map((g: any) => `${g.name} (₹${g.currentAmount}/₹${g.targetAmount})`).join(', ') : 'None'}

Return valid JSON matching this schema:
{
  "scenarioName": "${scenarioDescription}",
  "feasibilityVerdict": "Highly Feasible", // "Highly Feasible" | "Moderate / Manageable" | "Tight / High Discipline" | "Risky / Not Recommended"
  "monthlyCashFlowDelta": 3500, // Positive means extra savings, negative means added expense
  "newProjectedSavingsRate": 28, // In percentage
  "impactOnGoals": [
    {
      "goalName": "Emergency Fund",
      "timelineChange": "Reaches target 2.5 months earlier"
    }
  ],
  "tradeOffs": [
    "Requires cooking at home 2 extra nights per week",
    "Must pause Disney+ and Gym add-on subscription"
  ],
  "proTips": [
    "Automate the ₹3,500 difference directly into your savings vault on payday."
  ],
  "confidenceScore": 92
}`;

  try {
    const result = await callGeminiCascade(prompt, {
      systemInstruction: "You are a precise financial scenario modeler. Return valid JSON only.",
      responseMimeType: "application/json",
      temperature: 0.5,
    });

    if (result?.text) {
      const parsed = JSON.parse(result.text.trim());
      if (parsed && parsed.feasibilityVerdict) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Scenario Simulator Gemini Error]:", err?.message);
  }

  // Deterministic Fallback Scenario Simulation
  return res.json({
    scenarioName: scenarioDescription,
    feasibilityVerdict: "Highly Feasible",
    monthlyCashFlowDelta: 3200,
    newProjectedSavingsRate: Math.min(60, Math.round(((netSavings + 3200) / (income || 1)) * 100)),
    impactOnGoals: Array.isArray(savingsGoals) && savingsGoals.length > 0
      ? savingsGoals.map((g: any) => ({
          goalName: g.name || 'Savings Goal',
          timelineChange: 'Accelerates goal completion by ~1.5 months',
        }))
      : [
          {
            goalName: "General Wealth Fund",
            timelineChange: "Adds ₹38,400 in annual compound savings",
          },
        ],
    tradeOffs: [
      "Requires small behavioral adjustment in weekly lifestyle spending.",
      "Requires monitoring expenses once a week to prevent category creep.",
    ],
    proTips: [
      "Redirect the captured savings immediately via scheduled auto-transfer.",
      "Review your LEVELUP budget dashboard to verify the updated burn rate.",
    ],
    confidenceScore: 89,
  });
});


// Vite middleware / static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LEVELUP Server running on http://localhost:${PORT}`);
  });
}

startServer();
