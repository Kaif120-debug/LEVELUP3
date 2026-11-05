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
    topic = "Data Structures & Algorithms",
    level = "Intermediate",
    questionCount = 5,
    weakTopics = [],
  } = body;

  const qCount = Math.min(15, Math.max(3, Number(questionCount) || 5));

  const prompt = `You are LEVELUP AI Academic Master Examiner and Question Author.
Generate a high-yield, conceptually rigorous, exam-style Quiz for:
- Subject: ${subject}
- Topic: ${topic}
- Student Level: ${level}
- Number of Questions: ${qCount}
- Priority Focus Areas: ${weakTopics.length > 0 ? weakTopics.join(", ") : "Comprehensive topic coverage"}

QUIZ DESIGN CRITERIA:
1. Questions should test genuine conceptual understanding, problem-solving, and edge cases (not just trivial trivia).
2. Each question MUST provide 4 plausible options (labeled A, B, C, D).
3. Exactly one option MUST be correct.
4. "correctIndex" MUST be an integer from 0 to 3 corresponding to the correct option.
5. Provide a clear, educational "explanation" that breaks down WHY the correct answer is right and why distractors fail.
6. Include "difficulty" (Easy, Medium, Hard) and "conceptTested".

Return ONLY a valid JSON object matching this schema:
{
  "id": "quiz-${Date.now()}",
  "title": "${topic} Mastery Check",
  "subject": "${subject}",
  "topic": "${topic}",
  "level": "${level}",
  "totalQuestions": ${qCount},
  "questions": [
    {
      "id": "q-1",
      "question": "Clear question text testing specific concept...",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctIndex": 0,
      "explanation": "Why Option A is correct with conceptual breakdown...",
      "difficulty": "Medium",
      "conceptTested": "Specific concept name"
    }
  ]
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are an elite academic professor and exam committee author. Generate rigorous, valid JSON multiple-choice quizzes.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Quiz Worker Error]:", err?.message);
  }

  // Graceful fallback quiz
  return jsonResponse({
    id: `quiz-fb-${Date.now()}`,
    title: `${topic} Diagnostic Quiz`,
    subject,
    topic,
    level,
    totalQuestions: qCount,
    questions: [
      {
        id: `q-fb-1-${Date.now()}`,
        question: `What is the primary motivation for enforcing Normalization or modular decomposition in ${topic}?`,
        options: [
          "To eliminate redundant data and prevent update anomalies",
          "To maximize the physical size of database tables",
          "To remove the necessity of primary keys",
          "To force all foreign keys to be nullable",
        ],
        correctIndex: 0,
        explanation: "Normalization isolates distinct functional dependencies into separate relations to prevent insertion, update, and deletion anomalies while eliminating redundant storage.",
        difficulty: "Medium",
        conceptTested: "Anomaly Elimination",
      },
      {
        id: `q-fb-2-${Date.now()}`,
        question: `In the context of ${topic}, which condition must hold true to guarantee deterministic data integrity?`,
        options: [
          "Every determinant must be a candidate key for Boyce-Codd Normal Form",
          "All attributes must be allowed to contain null values",
          "Data must only be indexed on non-unique columns",
          "Tables must avoid using constraints or foreign keys",
        ],
        correctIndex: 0,
        explanation: "BCNF strictly requires that for every functional dependency X -> Y, X must be a superkey/candidate key.",
        difficulty: "Hard",
        conceptTested: "Determinant Invariants",
      },
      {
        id: `q-fb-3-${Date.now()}`,
        question: `Which operational trade-off is most commonly observed when applying higher degrees of normalization in ${subject}?`,
        options: [
          "Increased read-time JOIN complexity in exchange for write integrity and minimal redundancy",
          "Complete loss of relational consistency across child tables",
          "Requirement to eliminate all index structures",
          "Inability to run transactional statements",
        ],
        correctIndex: 0,
        explanation: "Higher normalization minimizes anomalies on writes/updates, but queries reading composite entities often require additional JOIN operations.",
        difficulty: "Medium",
        conceptTested: "Read-vs-Write Tradeoffs",
      },
    ],
  });
}
