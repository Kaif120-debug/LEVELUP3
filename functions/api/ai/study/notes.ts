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
    topic = "Database Indexing & B-Trees",
    subject = "Computer Science",
    format = "cornell",
    detailLevel = "comprehensive",
  } = body;

  const prompt = `You are LEVELUP AI Academic Master Scribe and Cognitive Retention Specialist.
Generate structured, master-level academic study notes for:
- Topic: ${topic}
- Subject: ${subject}
- Format: ${format}
- Detail Level: ${detailLevel}

Return strictly a valid JSON object matching this schema:
{
  "id": "notes-${Date.now()}",
  "title": "Master Study Notes: ${topic}",
  "subject": "${subject}",
  "topic": "${topic}",
  "format": "${format}",
  "overview": "2-3 sentence executive synopsis highlighting foundational significance",
  "cornellCues": [
    {
      "cueQuestion": "Active recall question or core prompt keyword",
      "noteContent": "Precise, punchy answer or principle to memorize",
      "importance": "high"
    }
  ],
  "mainSections": [
    {
      "sectionTitle": "1. Foundational Architecture & Mechanics",
      "summary": "Core structural overview",
      "bulletPoints": [
        "In-depth explanation bullet with high pedagogical rigor",
        "Key mathematical or mechanical relationship"
      ],
      "codeOrFormula": "-- Core syntax or formula\\nCREATE INDEX idx_sample ON table(col);",
      "language": "sql"
    }
  ],
  "keyFormulasOrRules": [
    {
      "ruleName": "Asymptotic Lookup Bound",
      "formula": "O(log N)",
      "meaning": "Logarithmic search tree traversal guarantee"
    }
  ],
  "examCheatSheet": [
    "Rule 1: Always verify primary determinant before normalizing relations."
  ],
  "flashcards": [
    {
      "front": "What is the primary benefit of ${topic}?",
      "back": "Drastically reduces search and retrieval operations through hierarchical partitioning."
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are an elite academic scribe and professor. Output perfectly formatted, highly structured educational JSON notes.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && (parsed.cornellCues || parsed.mainSections || parsed.title)) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Notes Worker Error]:", err?.message);
  }

  // Graceful fallback notes
  return jsonResponse({
    id: `notes-fb-${Date.now()}`,
    title: `Master Study Notes: ${topic}`,
    subject,
    topic,
    format,
    overview: `These condensed notes synthesize core principles, practical examples, and exam formulas for ${topic} in ${subject}.`,
    cornellCues: [
      {
        cueQuestion: `What defines ${topic} fundamentally?`,
        noteContent: `Core structural principle governing state, execution, and optimization.`,
        importance: "high",
      },
      {
        cueQuestion: `What is the most common exam question pattern?`,
        noteContent: `Trade-off analysis between computational complexity and memory footprint.`,
        importance: "high",
      },
    ],
    mainSections: [
      {
        sectionTitle: "1. Core Principles & Theoretical Basis",
        summary: "Fundamental definitions and mathematical axioms.",
        bulletPoints: [
          `Deconstructs problems into deterministic, invariant components.`,
          `Guarantees predictable asymptotic complexity under standard operating assumptions.`,
          `Forms the prerequisite foundation for advanced systems design.`,
        ],
        codeOrFormula: `// Canonical representation of ${topic}\nfunction evaluate(input) {\n  return executeTarget(input);\n}`,
        language: "typescript",
      },
      {
        sectionTitle: "2. Real-World Applications & Edge Cases",
        summary: "Production considerations and edge failure modes.",
        bulletPoints: [
          `Handle boundary conditions and empty or null values proactively.`,
          `Assess lock contention or resource contention in multi-threaded workflows.`,
        ],
      },
    ],
    keyFormulasOrRules: [
      {
        ruleName: "Fundamental Invariant",
        formula: "T(n) = O(log n) or O(1)",
        meaning: "Upper bound under balanced operating parameters",
      },
    ],
    examCheatSheet: [
      `Review key definitions 24 hours prior to test.`,
      `Verify all edge conditions before finalizing answers.`,
      `Use active recall instead of passive reading.`,
    ],
    flashcards: [
      {
        front: `Define the core mechanism of ${topic}.`,
        back: `Structured decomposition ensuring reliable performance and invariant preservation.`,
      },
      {
        front: `State the primary advantage in practical software engineering.`,
        back: `Scalable execution with bounded worst-case latency and clean separation of concerns.`,
      },
    ],
    createdAt: new Date().toISOString(),
  });
}
