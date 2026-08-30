import { callGeminiCascade, safeExtractJson } from "./gemini-helper";

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
  if (method === "OPTIONS") {
    return onRequestOptions();
  }
  if (method === "POST") {
    return onRequestPost(context);
  }
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
    goal = "Hypertrophy",
    duration = 45,
    experience = "Intermediate",
    equipment = "Gym",
    targetMuscles = "Full Body",
    preferences = "",
  } = body;

  const prompt = `You are a certified strength and conditioning specialist (CSCS).
Create an optimal workout session based on:
- Goal: ${goal}
- Duration: ${duration} minutes
- Experience: ${experience}
- Equipment: ${equipment}
- Target Muscles: ${targetMuscles}
- Preferences: ${preferences}

Return valid JSON with schema:
{
  "name": "Workout Name",
  "targetGoal": "${goal}",
  "duration": ${duration},
  "estimatedCalories": 350,
  "difficulty": "${experience}",
  "splitType": "Custom Split",
  "equipment": "${equipment}",
  "targetMuscleGroups": ["Chest", "Triceps"],
  "warmup": [
    { "exercise": "Arm Circles", "duration": "2 mins", "notes": "Dynamic" }
  ],
  "exercises": [
    {
      "name": "Incline Dumbbell Press",
      "targetMuscle": "Upper Chest",
      "sets": 4,
      "reps": "8-10 reps",
      "restTime": "90s",
      "tempo": "3-0-1-0",
      "notes": "Control eccentric"
    }
  ],
  "cooldown": [
    { "exercise": "Doorway Chest Stretch", "duration": "2 mins", "notes": "Static" }
  ],
  "coachingNotes": "Focus on progressive overload."
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.7,
    }, apiKey);

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.exercises && parsed.exercises.length > 0) {
        return jsonResponse(parsed);
      }
    }
  } catch (err: any) {
    console.warn("[AI Generate Workout Worker Exception]:", err?.message);
  }

  return jsonResponse({
    name: `${goal} Protocol (${equipment})`,
    targetGoal: goal,
    duration: Number(duration) || 45,
    estimatedCalories: Math.round((Number(duration) || 45) * 7.5),
    difficulty: experience,
    splitType: "Full Body / Targeted",
    equipment,
    targetMuscleGroups: [targetMuscles],
    warmup: [
      { exercise: "Dynamic Joint Mobility Flow", duration: "5 mins", notes: "Focus on active ranges" },
      { exercise: "Activation Drills", duration: "3 mins", notes: "Glute and scapular firing" },
    ],
    exercises: [
      {
        name: equipment === "Home" ? "Push-up Variations" : "Dumbbell Press / Bench Press",
        targetMuscle: "Chest & Triceps",
        sets: 4,
        reps: "8-12 reps",
        restTime: "90s",
        tempo: "3-1-1-0",
        notes: "Full range of motion with paused stretch",
      },
      {
        name: equipment === "Home" ? "Inverted Row / Doorway Row" : "Chest-Supported Row",
        targetMuscle: "Upper Back & Lats",
        sets: 4,
        reps: "10-12 reps",
        restTime: "90s",
        tempo: "2-0-1-1",
        notes: "Retract scapulae and pull to lower ribs",
      },
      {
        name: "Goblet Squats / Bulgarian Split Squats",
        targetMuscle: "Quadriceps & Glutes",
        sets: 3,
        reps: "10-12 reps",
        restTime: "90s",
        tempo: "3-0-1-0",
        notes: "Maintain neutral spine and full depth",
      },
      {
        name: "Romanian Deadlift (Dumbbell)",
        targetMuscle: "Hamstrings & Posterior Chain",
        sets: 3,
        reps: "10-12 reps",
        restTime: "90s",
        tempo: "3-1-1-0",
        notes: "Deep hinge feeling hamstring tension",
      },
    ],
    cooldown: [
      { exercise: "Full Body Static Stretching", duration: "5 mins", notes: "Deep diaphragmatic breathing" },
    ],
    coachingNotes: "Execute every rep with crisp form and maintain at least 1-2 reps in reserve.",
  });
}
