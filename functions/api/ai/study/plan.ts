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
    courseName = "DBMS & Distributed Systems",
    examDate,
    level = "Intermediate",
    dailyStudyMinutes = 60,
    daysCount = 7,
    targetGoal = "Ace Exam (90%+)",
    weakTopics = [],
    existingAssignments = [],
  } = body;

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
    "3-4 bullet points highlighting strategic focus"
  ],
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme title",
      "focusArea": "Core focus concept",
      "estimatedMinutes": ${studyMins},
      "keyMilestone": "Clear deliverable milestone for the day",
      "quizTopicSuggestion": "Topic to self-quiz on",
      "tasks": [
        {
          "id": "task-d1-1",
          "title": "Actionable task name",
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
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are LEVELUP AI Academic Coach, specialized in spaced repetition, exam preparation, and accelerated learning roadmaps. Return strictly valid JSON.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      apiKey
    );

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Study Plan Worker Error]:", err?.message);
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
      focusArea: isLast ? "Exam readiness & memory consolidation" : `Module ${d} key principles and problem sets`,
      estimatedMinutes: studyMins,
      keyMilestone: isLast ? "Complete final formula sheet & timed test" : `Master Module ${d} problem set with 85%+ accuracy`,
      quizTopicSuggestion: `${subject} - Module ${d}`,
      tasks: [
        {
          id: `task-d${d}-1`,
          title: isLast ? "Flashcard & Key Concept Blitz" : `Deep Dive: ${subject} Fundamentals Part ${d}`,
          durationMinutes: partTime,
          type: "concept",
          description: `Study core definitions, theorems, and structural rules with active note-taking.`,
        },
        {
          id: `task-d${d}-2`,
          title: isLast ? "Timed High-Yield Practice Exam" : `Solve 6-8 Targeted Practice Problems`,
          durationMinutes: partTime,
          type: "practice",
          description: `Apply problem-solving methods without looking at solutions first.`,
        },
        {
          id: `task-d${d}-3`,
          title: isLast ? "Mistake Journal Review & Rest" : `Quick 10-Question Self Quiz & Error Log`,
          durationMinutes: studyMins - (partTime * 2),
          type: "quiz",
          description: `Test retention and record any misunderstandings in your review notes.`,
        },
      ],
    });
  }

  return jsonResponse({
    id: `plan-fb-${Date.now()}`,
    planTitle: `${daysNum}-Day Master Study Strategy for ${subject}`,
    subject,
    courseName,
    targetGoal,
    level,
    totalDays: daysNum,
    dailyStudyMinutes: studyMins,
    examDate: examDate || "",
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
}
