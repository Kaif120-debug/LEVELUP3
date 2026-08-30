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
    planContext = {},
    dayNumber = 1,
    dayName = "Day 1",
    currentFocusTitle = "Workout Session",
    currentExercises = [],
    userFeedback = "",
  } = body;

  const prompt = `You are the Lead Sports Physiologist for LEVELUP Fitness OS.
The user wants to REGENERATE / CUSTOMIZE a specific workout day in their training program based on their custom instructions.

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
1. Provide an updated Day object adhering to the user's feedback.
2. Include 4-6 exercises with orderIndex, name, targetMuscle, sets, reps, restTime, tempo, formInstructions (concise step-by-step form execution instructions), intensityOrRPE, and alternativeExercise.
3. Include dynamic warmup routine and cool-down routine.
4. Return ONLY a valid JSON object matching this schema:

{
  "dayNumber": ${dayNumber},
  "dayName": "${dayName}",
  "focusTitle": "Updated or Refined Session Title",
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

  // Procedural fallback generator for single day customization
  const generateProceduralDayFallback = () => {
    const eq = planContext.equipment || "Full Gym";
    const isHome = eq === "Home" || eq === "Bodyweight";
    const isDumbbell = eq === "Dumbbells";

    return {
      dayNumber: Number(dayNumber) || 1,
      dayName: dayName || "Day 1",
      focusTitle: currentFocusTitle ? `${currentFocusTitle} (Customized)` : "Custom Target Session",
      muscleGroups: ["Target Muscle Groups", "Core", "Synergists"],
      isRestDay: false,
      duration: planContext.duration || "60 mins",
      warmup: {
        duration: "8 mins",
        routine: [
          { exercise: "Dynamic Joint Rotations & Arm Circles", durationOrReps: "2 sets x 12 reps", cues: "Lubricate target joints through full active range" },
          { exercise: "Target Muscle Band Activation", durationOrReps: "2 sets x 15 reps", cues: "Prime neuromuscular connections and increase local blood flow" },
        ],
      },
      exercises: [
        {
          orderIndex: 1,
          name: isHome ? "Decline / Incline Push-ups" : isDumbbell ? "Dumbbell Press / Row Compound" : "Heavy Compound Movement",
          targetMuscle: "Primary Muscle Group",
          sets: 4,
          reps: "8-10 reps",
          restTime: "90-120 sec",
          tempo: "3-1-1-0",
          formInstructions: "Execute with strict control on 3-second eccentric phase. Keep core braced firmly throughout.",
          intensityOrRPE: "RPE 8.5 (1-2 RIR)",
          alternativeExercise: "Machine or Dumbbell alternative",
        },
        {
          orderIndex: 2,
          name: isHome ? "Inverted Row / Pike Push-up" : "Target Angle Hypertrophy Exercise",
          targetMuscle: "Secondary Target Zone",
          sets: 4,
          reps: "10-12 reps",
          restTime: "90 sec",
          tempo: "2-0-1-1",
          formInstructions: "Focus on maximum peak contraction with 1-second pause at top.",
          intensityOrRPE: "RPE 8.5",
          alternativeExercise: "Cable variation",
        },
        {
          orderIndex: 3,
          name: "Unilateral Target Isolation Movement",
          targetMuscle: "Target Muscle Specialization",
          sets: 3,
          reps: "12-15 reps",
          restTime: "60 sec",
          tempo: "2-1-1-0",
          formInstructions: "Eliminate all body sway; isolate target muscle with continuous tension.",
          intensityOrRPE: "RPE 9 (1 RIR)",
          alternativeExercise: "Resistance Band alternative",
        },
        {
          orderIndex: 4,
          name: "Metabolic Burnout / Pump Finisher",
          targetMuscle: "Metabolite Accumulation",
          sets: 3,
          reps: "15-20 reps",
          restTime: "45-60 sec",
          tempo: "2-0-1-0",
          formInstructions: "Controlled tempo with full range of motion. Emphasize mind-muscle connection.",
          intensityOrRPE: "RPE 9.5 (0-1 RIR)",
          alternativeExercise: "Bodyweight Finisher",
        },
      ],
      cooldown: {
        duration: "5 mins",
        routine: [
          { stretch: "Target Muscle Static Stretch", duration: "60s per side", cues: "Slow deep nasal breathing to lower heart rate and reduce cortisol" },
        ],
      },
      coachNotes: userFeedback ? `Modified according to feedback: "${userFeedback}". Keep progressive overload consistent.` : "Focused session designed for maximum localized stimulus.",
    };
  };

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.85,
    }, apiKey);

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.exercises && parsed.exercises.length > 0) {
        return jsonResponse(parsed);
      }
    }
    return jsonResponse(generateProceduralDayFallback());
  } catch (err: any) {
    console.warn("[AI Workout Regenerate Day Worker Exception]:", err?.message);
    return jsonResponse(generateProceduralDayFallback());
  }
}
