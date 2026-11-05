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
    query = "How do I calculate the time complexity of recursive algorithms?",
    topic = "Algorithms & Complexity",
    subject = "Computer Science",
  } = body;

  const prompt = `You are LEVELUP AI Academic Tutor & Subject Coach.
A student is asking for learning assistance on:
- Question: ${query}
- Topic: ${topic}
- Subject: ${subject}

Provide a supportive, pedagogically brilliant, step-by-step response.
Return strictly valid JSON:
{
  "answer": "Direct, illuminating 2-3 paragraph explanation answering the question clearly",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Clear step title",
      "explanation": "Actionable explanation of this step"
    }
  ],
  "keyRuleOrFormula": "High-yield theorem, formula, or golden rule to remember",
  "exampleSnippet": {
    "title": "Concrete Worked Example",
    "content": "Code or formula step showing the solution",
    "language": "typescript"
  },
  "commonMisconception": "One subtle trap or error students frequently make on this exact question",
  "suggestedFollowUps": [
    "Relevant follow-up question 1",
    "Relevant follow-up question 2"
  ]
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are a world-class academic tutor. Help the student understand deeply with clear steps and active learning prompts.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.answer) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Learning Assistant Worker Error]:", err?.message);
  }

  return jsonResponse({
    answer: `Here is a clear breakdown for "${query}". In ${subject}, master educators tackle this by breaking down the problem into three fundamental phases: identifying the base axiom, tracing the transformation invariant, and validating against boundary conditions.`,
    steps: [
      {
        stepNumber: 1,
        title: "Identify the Governing Rule",
        explanation: "Determine the exact theorem or definition that applies to this question before computing.",
      },
      {
        stepNumber: 2,
        title: "Apply Step-by-Step Reduction",
        explanation: "Substitute known parameters and simplify iteratively without skipping intermediate logic.",
      },
      {
        stepNumber: 3,
        title: "Verify Against Edge Cases",
        explanation: "Test minimal inputs (0, 1, null, max) to ensure the solution holds universally.",
      },
    ],
    keyRuleOrFormula: `Mastery Axiom: Always prove correctness on n=1 and n=k+1 before evaluating complexity.`,
    exampleSnippet: {
      title: "Sample Verification Pattern",
      content: `// Step 1: Base Case check\nif (n <= 1) return 1;\n// Step 2: Recursive relation T(n) = 2T(n/2) + O(n)\nreturn evaluate(n / 2) + evaluate(n / 2);`,
      language: "typescript",
    },
    commonMisconception: "Confusing worst-case asymptotic bounds with average or amortized runtime.",
    suggestedFollowUps: [
      `How does this apply to real-world multi-threaded systems?`,
      `Can you give me a practice problem to test my understanding?`,
    ],
  });
}
