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
    topic = "Normalization in Relational Databases",
    subject = "Computer Science / DBMS",
    level = "Intermediate",
    mode = "standard",
  } = body;

  const modeInstructions: Record<string, string> = {
    standard: "Provide a balanced, highly intuitive, university-grade explanation with real-world examples and common pitfalls.",
    simpler: "Explain as if teaching a beginner or using an intuitive ELI5 analogy, removing unnecessary jargon while retaining core truth.",
    deep_example: "Provide an in-depth, step-by-step practical implementation or code/schema example showing exact mechanics.",
    common_mistakes: "Focus heavily on typical exam traps, student mistakes, edge cases, and why they happen.",
  };
  const selectedModeInstruction = modeInstructions[mode] || modeInstructions.standard;

  const prompt = `You are LEVELUP AI Academic Tutor, renowned for breaking down complex topics with absolute clarity, rigor, and memorable real-world analogies.

EXPLAIN THIS TOPIC:
- Topic: ${topic}
- Subject: ${subject}
- Student Level: ${level}
- Explanation Mode: ${mode} (${selectedModeInstruction})

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
    "title": "Concrete Real-World Scenario",
    "scenario": "The practical context/problem",
    "explanation": "How the concept applies step-by-step",
    "codeOrDiagram": "Code snippet, SQL, ASCII table, formula, or pseudo-diagram illustrating the concept clearly",
    "language": "sql"
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
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are an elite academic educator and subject expert. Output clear, well-formatted JSON with high educational fidelity.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.oneLineSummary && parsed.simpleExplanation) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Explain Worker Error]:", err?.message);
  }

  // Graceful fallback explanation
  return jsonResponse({
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
}
