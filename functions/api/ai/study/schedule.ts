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
    courses = ["Database Systems", "Algorithms", "Computer Networks"],
    dailyStudyHours = 2,
    targetGoal = "Consistent Academic Progress",
  } = body;

  const hours = Math.min(10, Math.max(1, Number(dailyStudyHours) || 2));
  const coursesList = Array.isArray(courses) && courses.length > 0 ? courses : ["Core Course 1", "Core Course 2"];

  const prompt = `You are LEVELUP AI Study Schedule Architect.
Build an optimal 7-day balanced weekly study schedule for a student.
- Courses: ${coursesList.join(", ")}
- Daily Available Hours: ${hours} hours/day
- Goal: ${targetGoal}

Return strictly valid JSON:
{
  "id": "sched-${Date.now()}",
  "scheduleTitle": "7-Day High-Retention Academic Schedule",
  "dailyHours": ${hours},
  "strategyNote": "2-sentence cognitive rationale on interleaving and spaced review",
  "days": [
    {
      "dayName": "Monday",
      "focusCourse": "${coursesList[0] || 'Primary Course'}",
      "totalMinutes": ${hours * 60},
      "blocks": [
        {
          "timeSlot": "Morning / Session 1",
          "subject": "${coursesList[0] || 'Primary Course'}",
          "durationMinutes": ${Math.floor((hours * 60) * 0.6)},
          "activity": "Deep Concept Absorption & Active Problem Solving"
        },
        {
          "timeSlot": "Evening / Session 2",
          "subject": "${coursesList[1] || coursesList[0] || 'Secondary Course'}",
          "durationMinutes": ${Math.floor((hours * 60) * 0.4)},
          "activity": "Flashcard Spaced Review & Self-Quiz"
        }
      ]
    }
  ],
  "weeklyMilestones": [
    "Complete 4 active recall drills across all registered courses",
    "Maintain 100% adherence to spaced repetition blocks"
  ]
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(
      prompt,
      {
        systemInstruction: "You are an elite academic schedule strategist. Return structured weekly study schedules in JSON.",
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
    console.warn("[AI Study Schedule Worker Error]:", err?.message);
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const fallbackDays = daysOfWeek.map((dayName, idx) => {
    const primary = coursesList[idx % coursesList.length] || "Course A";
    const secondary = coursesList[(idx + 1) % coursesList.length] || "Course B";
    const totalMins = hours * 60;
    const part1 = Math.floor(totalMins * 0.65);
    const part2 = totalMins - part1;

    return {
      dayName,
      focusCourse: primary,
      totalMinutes: totalMins,
      blocks: [
        {
          timeSlot: "Block 1 (Deep Work)",
          subject: primary,
          durationMinutes: part1,
          activity: "Core concepts, theory deconstruction, and structured practice sets.",
        },
        {
          timeSlot: "Block 2 (Active Recall & Interleaving)",
          subject: secondary,
          durationMinutes: part2,
          activity: "Spaced retrieval flashcards, error log review, and rapid mini-quiz.",
        },
      ],
    };
  });

  return jsonResponse({
    id: `sched-fb-${Date.now()}`,
    scheduleTitle: `7-Day High-Retention Study Schedule`,
    dailyHours: hours,
    strategyNote: "Utilizes interleaving to prevent cognitive saturation by rotating subjects between morning and evening blocks.",
    days: fallbackDays,
    weeklyMilestones: [
      `Maintain ${hours} daily hours with zero missed active-recall checkpoints.`,
      `Complete 1 cumulative mock test covering all active courses at week's end.`,
    ],
    createdAt: new Date().toISOString(),
  });
}
