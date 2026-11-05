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
    examName = "Final Semester Examination",
    subject = "Computer Science",
    examDate,
    daysRemaining = 14,
    dailyMinutes = 90,
    currentScore = 70,
    focusAreas = [],
  } = body;

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
2. Outline a phased countdown timeline.
3. Schedule 2-3 specific mock test milestone checkpoints with target dates.
4. Provide a tactical "Last 24 Hours Strategy".

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
      "topic": "Topic Name",
      "priority": "High",
      "estimatedWeight": "35-40% of Exam",
      "keySubtopics": ["Subtopic 1", "Subtopic 2"],
      "whyImportant": "Consistently appears in high-value essay and problem-solving questions."
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
    }
  ],
  "mockTestMilestones": [
    {
      "testName": "Diagnostic Mock Test 1",
      "targetDay": "Day ${Math.max(1, Math.floor(daysNum * 0.35))}",
      "focusTopics": ["High Priority Core Topics"]
    }
  ],
  "last24HoursStrategy": [
    "Stop learning new complex material 24 hours before the exam.",
    "Review your 1-page condensed formula and cheat-sheet summary.",
    "Prioritize 8 hours of quality sleep to optimize prefrontal cortex executive recall."
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are an elite academic strategist. Return a comprehensive, actionable exam blueprint in valid JSON.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.priorityTopics && Array.isArray(parsed.priorityTopics) && parsed.priorityTopics.length > 0) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Exam Prep Worker Error]:", err?.message);
  }

  // Graceful fallback exam plan
  return jsonResponse({
    id: `exam-prep-fb-${Date.now()}`,
    examName,
    subject,
    examDate: examDate || "",
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
}
