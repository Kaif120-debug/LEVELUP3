import { callGeminiCascade, safeExtractJson } from "../gemini-helper";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequest(context: any) {
  const method = context.request.method.toUpperCase();
  if (method === "OPTIONS") return onRequestOptions();
  if (method === "POST") return onRequestPost(context);
  return jsonResponse({ error: `Method ${method} not allowed. Expected POST.` }, 405);
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  let body: any = {};
  try {
    const rawText = await request.text();
    if (rawText && rawText.trim()) {
      body = JSON.parse(rawText);
    }
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body" }, 400);
  }

  const {
    subject = "Computer Science",
    topic = "SQL Queries & Indexing",
    difficulty = "Medium",
    problemType = "SQL",
    count = 3,
  } = body;

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
    "title": "Descriptive Problem Title",
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
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are a master academic problem author. Generate challenging, instructive practice exercises in valid JSON array format.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      const problemsArray = Array.isArray(parsed) ? parsed : parsed?.problems || [];
      if (problemsArray.length > 0) {
        return jsonResponse({ problems: problemsArray });
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Practice Worker Error]:", err?.message);
  }

  // Graceful fallback practice problems
  return jsonResponse({
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
}
