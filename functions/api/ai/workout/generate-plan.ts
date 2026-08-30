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
    goal = "Muscle Gain",
    experience = "Intermediate",
    trainingDays = 4,
    duration = "60 mins",
    equipment = "Full Gym",
    preferredSplit = "Upper / Lower",
    targetMuscles = [],
    limitations = "",
    preferences = "",
    regenerationCount = 0,
    previousPlan = null,
  } = body;

  const numDays = Math.max(2, Math.min(7, Number(trainingDays) || 4));
  const targetMusclesStr = Array.isArray(targetMuscles) && targetMuscles.length > 0
    ? targetMuscles.join(", ")
    : "Comprehensive Balanced Development";

  // Dynamic Procedural Fallback generator supporting 2 to 7 full training days
  const generateProceduralFallbackPlan = () => {
    const isHome = equipment === "Home" || equipment === "Bodyweight";
    const isDumbbellOnly = equipment === "Dumbbells";

    const dayTemplates = [
      {
        dayNumber: 1,
        dayName: "Day 1",
        focusTitle: preferredSplit.includes("Push") ? "Push (Chest, Shoulders & Triceps)" : "Upper Body Power & Hypertrophy",
        muscleGroups: ["Chest", "Front/Side Deltoids", "Triceps", "Upper Back"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Band Pull-Aparts & Shoulder Dislocates", durationOrReps: "2 sets x 15 reps", cues: "Squeeze shoulder blades together with controlled tempo" },
            { exercise: "Scapular Push-ups & Arm Circles", durationOrReps: "10 reps each direction", cues: "Activate serratus anterior and lubricate glenohumeral joint" },
            { exercise: "Specific Warm-Up Sets", durationOrReps: "2-3 pyramid sets with light load", cues: "Groove bar path and neural prep without fatiguing muscles" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Decline Push-ups (Feet Elevated)" : isDumbbellOnly ? "Flat Dumbbell Bench Press" : "Incline Dumbbell Bench Press",
            targetMuscle: "Pectoralis Major (Clavicular & Sternal)",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90-120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Retract and depress shoulder blades into bench. Lower dumbbells flared at 45 degrees for a deep 3-second stretch across chest, then drive up smoothly.",
            intensityOrRPE: "RPE 8 (2 RIR)",
            alternativeExercise: "Barbell Incline Press or Push-up variations",
          },
          {
            orderIndex: 2,
            name: isHome ? "Inverted Bed/Table Row" : isDumbbellOnly ? "Chest-Supported Dumbbell Row" : "Chest-Supported T-Bar Row / Cable Row",
            targetMuscle: "Latissimus Dorsi & Rhomboids",
            sets: 4,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "2-0-1-1",
            formInstructions: "Pull elbows straight back toward hips. Squeeze shoulder blades together firmly at peak contraction for 1 second before lowering under control.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Single-Arm Dumbbell Row",
          },
          {
            orderIndex: 3,
            name: isHome ? "Pike Push-ups (Elevated)" : "Dumbbell Seated Overhead Shoulder Press",
            targetMuscle: "Anterior & Lateral Deltoids",
            sets: 3,
            reps: "8-10 reps",
            restTime: "90 sec",
            tempo: "3-0-1-0",
            formInstructions: "Keep core braced with ribs tucked. Press dumbbells vertically in slight arc overhead without arching lower back excessively.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Standing Landmine Press",
          },
          {
            orderIndex: 4,
            name: "Dumbbell Lean-Away Lateral Raises",
            targetMuscle: "Lateral Deltoids (Side Shoulders)",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-1-1-0",
            formInstructions: "Lead with elbows and pinkies slightly elevated. Lift to shoulder height with minimal swinging, pausing briefly at the top.",
            intensityOrRPE: "RPE 9 (1 RIR)",
            alternativeExercise: "Cable Lateral Raises or Resistance Band Raises",
          },
          {
            orderIndex: 5,
            name: isHome ? "Bench/Chair Triceps Dips" : "Overhead Dumbbell / Cable Triceps Extension",
            targetMuscle: "Triceps Brachii (Long Head)",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "3-0-1-1",
            formInstructions: "Keep elbows tucked close to ears. Lower weight behind head until full triceps stretch, then lock out forcefully.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Rope Cable Pushdown",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Doorway Pectoral Stretch", duration: "45s per side", cues: "Breathe deeply into diaphragm while feeling stretch across chest and shoulders" },
            { stretch: "Cross-Body Posterior Capsule Stretch", duration: "45s per side", cues: "Gently pull arm across chest keeping shoulder down" },
          ],
        },
        coachNotes: "Focus on mind-muscle connection during the eccentric lowering phase. Do not sacrifice range of motion for heavier weight.",
      },
      {
        dayNumber: 2,
        dayName: "Day 2",
        focusTitle: preferredSplit.includes("Pull") ? "Pull (Back, Rear Delts & Biceps)" : "Lower Body Posterior & Quad Focus",
        muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "World's Greatest Stretch & Hip Openers", durationOrReps: "5 reps each side", cues: "Open hips, thoracic spine, and ankles dynamically" },
            { exercise: "Bodyweight Glute Bridges & Monster Walks", durationOrReps: "2 sets x 12 reps", cues: "Fire gluteus medius and prime hip extension" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Bulgarian Split Squats (Bodyweight)" : isDumbbellOnly ? "Dumbbell Goblet Squat / Split Squat" : "Barbell Back Squat / Hack Squat",
            targetMuscle: "Quadriceps & Gluteus Maximus",
            sets: 4,
            reps: "6-8 reps",
            restTime: "120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Screw feet firmly into floor with tripod foot pressure. Descend with torso braced until hip crease is parallel or below knees.",
            intensityOrRPE: "RPE 8 (2 RIR)",
            alternativeExercise: "Leg Press or Walking Dumbbell Lunges",
          },
          {
            orderIndex: 2,
            name: isHome ? "Single-Leg Romanian Deadlift" : "Romanian Deadlift (Dumbbell or Barbell)",
            targetMuscle: "Hamstrings & Glutes",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90-120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Hinge at hips by pushing pelvis back while maintaining neutral spine. Lower dumbbells just below knees until deep hamstring stretch.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Lying or Seated Leg Curls",
          },
          {
            orderIndex: 3,
            name: "Bulgarian Split Squats",
            targetMuscle: "Quads & Glute Medius",
            sets: 3,
            reps: "10-12 reps/leg",
            restTime: "90 sec",
            tempo: "2-0-1-0",
            formInstructions: "Elevate rear foot on bench. Drop back knee toward floor while keeping front shin relatively vertical and front heel anchored.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Walking Lunges or Step-ups",
          },
          {
            orderIndex: 4,
            name: "Standing Single-Leg Calf Raises",
            targetMuscle: "Gastrocnemius & Soleus",
            sets: 4,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-2-1-1",
            formInstructions: "Pause for full 2-second stretch at bottom and 1-second squeeze at apex.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Seated Calf Raise",
          },
          {
            orderIndex: 5,
            name: "Hanging Leg Raises / Captain's Chair",
            targetMuscle: "Rectus Abdominis & Deep Core",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Posteriorly tilt pelvis and curl knees toward chest without swinging or using momentum.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Cable Woodchoppers or Ab Wheel Rollouts",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Kneeling Hip Flexor & Quad Stretch", duration: "60s per leg", cues: "Squeeze glute of back leg to deepen hip flexor release" },
            { stretch: "Pigeon Pose Glute Stretch", duration: "60s per leg", cues: "Keep hips square and breathe deeply" },
          ],
        },
        coachNotes: "Lower body workouts generate significant central fatigue. Hydrate well and prioritize post-workout protein intake.",
      },
      {
        dayNumber: 3,
        dayName: "Day 3",
        focusTitle: preferredSplit.includes("Push") ? "Legs & Core Dynamic Power" : "Active Recovery & Mobility Protocol",
        muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Core"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Dynamic Leg Swings & Hip Airplanes", durationOrReps: "10 reps each leg", cues: "Activate stabilizers and improve dynamic balance" },
            { exercise: "Bodyweight Cossack Squats", durationOrReps: "2 sets x 8 reps/side", cues: "Mobilize adductors and deep hip capsules" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Jump Squats / Pistol Squats" : isDumbbellOnly ? "Dumbbell Front Squat" : "Leg Press / Front Squat",
            targetMuscle: "Quadriceps & Core",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90-120 sec",
            tempo: "3-1-1-0",
            formInstructions: "Keep torso upright and drive through mid-foot with continuous quad tension.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Goblet Squats",
          },
          {
            orderIndex: 2,
            name: isHome ? "Nordic Hamstring Curls / Slider Curls" : "Lying Dumbbell / Machine Leg Curl",
            targetMuscle: "Hamstrings (Knee Flexion)",
            sets: 4,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "3-0-1-1",
            formInstructions: "Control eccentric lowering phase for 3 full seconds. Avoid hip lifting off pad.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Single-leg Deadlift",
          },
          {
            orderIndex: 3,
            name: "Walking Dumbbell Lunges",
            targetMuscle: "Gluteus Maximus & Vastus Medialis",
            sets: 3,
            reps: "12 steps/leg",
            restTime: "90 sec",
            tempo: "2-0-1-0",
            formInstructions: "Take long stride to bias glute recruitment, keeping front knee tracking over second toe.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Reverse Lunges",
          },
          {
            orderIndex: 4,
            name: "Seated Calf Raises",
            targetMuscle: "Soleus",
            sets: 4,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "2-2-1-1",
            formInstructions: "Deep pause at the bottom to eliminate Achilles tendon stretch reflex.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Standing Calf Raise",
          },
          {
            orderIndex: 5,
            name: "Ab Wheel Rollouts / Plank Walkouts",
            targetMuscle: "Anterior Core & Rectus Abdominis",
            sets: 3,
            reps: "10-12 reps",
            restTime: "60 sec",
            tempo: "3-1-1-0",
            formInstructions: "Maintain posterior pelvic tilt and brace abs hard to prevent lumbar hyperextension.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Dead Bug with Hold",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Standing Quad Stretch", duration: "45s per side", cues: "Tuck tailbone and keep knees together" },
            { stretch: "Seated Hamstring Stretch", duration: "45s per side", cues: "Reach chest toward toes with flat back" },
          ],
        },
        coachNotes: "Focus on deep range of motion and explosive concentric drive on compound leg movements.",
      },
      {
        dayNumber: 4,
        dayName: "Day 4",
        focusTitle: "Upper Body Hypertrophy & Deltoid/Arm Specialization",
        muscleGroups: ["Chest", "Upper Back", "Biceps", "Triceps", "Rear Delts"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Face Pulls with Resistance Band", durationOrReps: "2 sets x 15 reps", cues: "Warm up rotator cuff and external rotators" },
            { exercise: "Yoga Push-up to Downward Dog", durationOrReps: "8 reps", cues: "Dynamic upper chain activation" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Wide-Grip Pull-ups / Doorway Rows" : "Neutral-Grip Lat Pulldown / Weighted Pull-ups",
            targetMuscle: "Latissimus Dorsi (Width & Thickness)",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90 sec",
            tempo: "3-0-1-1",
            formInstructions: "Drive elbows down and back toward ribs. Full dead-hang stretch at top, pull bar to upper clavicle.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Single-Arm Cable Pulldown",
          },
          {
            orderIndex: 2,
            name: "Dumbbell Flat Bench Press / Low Cable Press",
            targetMuscle: "Sternal Pectoralis Major",
            sets: 3,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "3-0-1-0",
            formInstructions: "Keep wrists stacked directly over elbows. Press dumbbells up and together with intense chest squeeze.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Machine Chest Press",
          },
          {
            orderIndex: 3,
            name: "Seated Face Pulls with External Rotation",
            targetMuscle: "Rear Deltoids & Infraspinatus",
            sets: 3,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-2",
            formInstructions: "Pull rope to bridge of nose while externally rotating hands back. Hold peak contraction for 2 seconds.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Rear Delt Dumbbell Flyes",
          },
          {
            orderIndex: 4,
            name: "Incline Dumbbell Biceps Curls",
            targetMuscle: "Biceps Brachii (Long Head Stretch)",
            sets: 3,
            reps: "10-12 reps",
            restTime: "60 sec",
            tempo: "3-0-1-1",
            formInstructions: "Set bench to 45 degrees. Allow arms to hang straight down for deep stretch, curl up while supinating wrists.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "EZ-Bar Preacher Curls",
          },
          {
            orderIndex: 5,
            name: "Cross-Body Cable / Dumbbell Triceps Extensions",
            targetMuscle: "Triceps Lateral & Medial Heads",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Keep upper arm pinned at side. Extend forearm fully and squeeze triceps hard.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Skull Crushers",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Overhead Lat & Triceps Stretch", duration: "45s each side", cues: "Lengthen lateral ribcage and latissimus dorsi" },
          ],
        },
        coachNotes: "Focus on isolating the target muscle with zero body english on curls and extensions.",
      },
      {
        dayNumber: 5,
        dayName: "Day 5",
        focusTitle: "Push Hypertrophy & Deltoid/Chest Specialization",
        muscleGroups: ["Upper Chest", "Lateral Delts", "Triceps", "Core"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Dynamic Chest Fly Stretch & Band Dislocations", durationOrReps: "2 sets x 12 reps", cues: "Open chest and warm up anterior shoulder capsules" },
            { exercise: "Y-T-W Scapular Raises", durationOrReps: "10 reps each", cues: "Activate mid/lower traps and rotator cuff" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Incline Feet-Elevated Push-ups" : isDumbbellOnly ? "Incline Dumbbell Fly-Press" : "Incline Barbell Bench Press",
            targetMuscle: "Clavicular Pectoralis Major",
            sets: 4,
            reps: "8-10 reps",
            restTime: "90 sec",
            tempo: "3-1-1-0",
            formInstructions: "Lower the weight with a controlled 3-second tempo to upper chest, drive up without locking out elbows completely.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Incline Dumbbell Press",
          },
          {
            orderIndex: 2,
            name: "Dumbbell Arnold Press / Standing Overhead Press",
            targetMuscle: "Anterior & Lateral Deltoids",
            sets: 3,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "3-0-1-0",
            formInstructions: "Rotate palms from facing you at bottom to facing forward at top lockout.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Seated Dumbbell Press",
          },
          {
            orderIndex: 3,
            name: "Cable / Dumbbell Incline Chest Flyes",
            targetMuscle: "Inner & Upper Pectoralis",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-1-1-1",
            formInstructions: "Maintain soft bend in elbows. Squeeze chest vigorously at peak contraction.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Floor Flyes",
          },
          {
            orderIndex: 4,
            name: "Cable Lateral Raises / Heavy Dumbbell Partials",
            targetMuscle: "Lateral Deltoids",
            sets: 4,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Raise arms out to 90 degrees with pinkies slightly higher than thumbs.",
            intensityOrRPE: "RPE 9.5",
            alternativeExercise: "Band Lateral Raise",
          },
          {
            orderIndex: 5,
            name: "Rope Triceps Pushdowns",
            targetMuscle: "Triceps Lateral Head",
            sets: 3,
            reps: "12-15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Spread the rope wide at the bottom of the movement for maximum peak contraction.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Diamond Push-ups",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Behind-the-Back Chest Opener", duration: "45s hold", cues: "Interlace fingers behind back and lift gently" },
          ],
        },
        coachNotes: "Maintain maximum tension on the targeted muscle groups. Keep rest times strictly on clock.",
      },
      {
        dayNumber: 6,
        dayName: "Day 6",
        focusTitle: "Pull Hypertrophy, Posterior Chain & Arm Finisher",
        muscleGroups: ["Lats", "Rhomboids", "Hamstrings", "Biceps", "Core"],
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Cat-Cow & Thoracic Rotation Flow", durationOrReps: "10 reps each side", cues: "Mobilize spine and posterior chain" },
            { exercise: "Single-Leg Glute Bridges", durationOrReps: "12 reps/side", cues: "Activate hamstrings and glutes" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: isHome ? "Pull-ups (Pronated Grip)" : isDumbbellOnly ? "Heavy Single-Arm Dumbbell Row" : "Barbell Deadlift / Heavy Cable Row",
            targetMuscle: "Erector Spinae, Lats & Upper Back",
            sets: 4,
            reps: "6-8 reps",
            restTime: "120 sec",
            tempo: "2-1-1-0",
            formInstructions: "Maintain flat lumbar spine, brace abdominal wall tightly, and drive through heels.",
            intensityOrRPE: "RPE 8",
            alternativeExercise: "Rack Pulls or Dumbbell Deadlifts",
          },
          {
            orderIndex: 2,
            name: "Single-Arm High Cable Pulldown / Dumbbell Pullover",
            targetMuscle: "Latissimus Dorsi (Lower Lat Sweep)",
            sets: 3,
            reps: "10-12 reps",
            restTime: "90 sec",
            tempo: "3-0-1-1",
            formInstructions: "Drive elbow directly into hip pocket for a localized lat pump.",
            intensityOrRPE: "RPE 8.5",
            alternativeExercise: "Dumbbell Pullover",
          },
          {
            orderIndex: 3,
            name: "Dumbbell Hammer Curls",
            targetMuscle: "Brachialis & Brachioradialis",
            sets: 3,
            reps: "10-12 reps",
            restTime: "60 sec",
            tempo: "2-0-1-0",
            formInstructions: "Keep wrists neutral with palms facing each other throughout the rep.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Rope Cable Curls",
          },
          {
            orderIndex: 4,
            name: "Rear Delt Reverse Flyes (Prone or Cable)",
            targetMuscle: "Posterior Deltoids",
            sets: 3,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "2-0-1-1",
            formInstructions: "Lead with elbows and avoid shrugging traps.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Face Pulls",
          },
          {
            orderIndex: 5,
            name: "Hanging Knee / Leg Raises with Russian Twists",
            targetMuscle: "Obliques & Rectus Abdominis",
            sets: 3,
            reps: "15 reps",
            restTime: "60 sec",
            tempo: "Controlled",
            formInstructions: "Rotate torso smoothly under tension without momentum.",
            intensityOrRPE: "RPE 9",
            alternativeExercise: "Bicycle Crunches",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Child's Pose Lat Stretch", duration: "60s", cues: "Walk hands to each side to stretch each lat" },
          ],
        },
        coachNotes: "Finishing the training block with optimal volume across upper back and pulling musculature.",
      },
      {
        dayNumber: 7,
        dayName: "Day 7",
        focusTitle: "Active Recovery, Mobility & Core Longevity Protocol",
        muscleGroups: ["Full Body Fascia", "Core", "Joint Capsules"],
        isRestDay: true,
        duration: "30 mins",
        warmup: {
          duration: "5 mins",
          routine: [
            { exercise: "Diaphragmatic Box Breathing", durationOrReps: "3 mins", cues: "Inhale 4s, hold 4s, exhale 4s, hold 4s" },
          ],
        },
        exercises: [
          {
            orderIndex: 1,
            name: "Low-Intensity Zone 2 Aerobic Flush",
            targetMuscle: "Cardiovascular & Lymphatic Drainage",
            sets: 1,
            reps: "25-30 mins",
            restTime: "0 sec",
            tempo: "Steady pace",
            formInstructions: "Maintain nasal breathing only at conversational effort.",
            intensityOrRPE: "RPE 4-5",
            alternativeExercise: "Outdoor Walk or Swimming",
          },
          {
            orderIndex: 2,
            name: "90/90 Hip Flow & Thoracic Spine Mobilization",
            targetMuscle: "Hip Rotators & Thoracic Spine",
            sets: 2,
            reps: "10 reps each",
            restTime: "30 sec",
            tempo: "Slow & smooth",
            formInstructions: "Breathe into tight zones to expand joint capsules.",
            intensityOrRPE: "RPE 3",
            alternativeExercise: "Cat-Cow Flow",
          },
        ],
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Legs Up The Wall Pose", duration: "5 mins", cues: "Promote venous return and deep parasympathetic tone" },
          ],
        },
        coachNotes: "Recovery is when physiological remodeling occurs. Prioritize hydration, nutrition, and restorative rest.",
      },
    ];

    const finalSchedule = dayTemplates.slice(0, numDays);

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      planName: `${goal} Master Protocol (${preferredSplit})`,
      overview: `A science-based ${numDays}-day ${preferredSplit} training system engineered for ${experience} lifters. Emphasizes mechanical tension, optimal stimulus-to-fatigue ratios, and progressive overload with ${equipment}.`,
      goal,
      experience,
      equipment,
      splitName: preferredSplit,
      trainingDaysCount: numDays,
      estimatedDuration: duration,
      targetMuscles: targetMusclesStr,
      progressiveOverloadGuidance: {
        principles: [
          "Double Progression Strategy: Maintain weight until you hit the upper rep ceiling for all sets with immaculate form.",
          "Controlled Eccentrics: Maintain 2-3 second lowering tempo on all compound movements for maximal mechanical tension.",
          "Proximity to Failure: Train compound lifts at RPE 8 (2 RIR); finish isolation movements at RPE 9-10 (0-1 RIR).",
        ],
        progressionRule: "Add 2.5kg / 5lbs to upper body lifts or 5kg / 10lbs to lower body lifts once you reach the maximum rep target on all sets.",
        rpeGuidance: "Weeks 1-2: RPE 7-8. Weeks 3-5: RPE 8-9. Week 6: Deload (RPE 6, 50% volume).",
        tempoAdvice: "3-1-1-0 on compound presses and squats (3s down, 1s pause in stretch, 1s up).",
        deloadStrategy: "Perform a deload every 6-8 weeks by reducing working sets by 40% while preserving load intensity.",
      },
      weeklySchedule: finalSchedule,
    };
  };

  const previousPlanContext = previousPlan && previousPlan.weeklySchedule
    ? `
PREVIOUS PLAN TO AVOID (REGENERATION #${regenerationCount + 1}):
The user requested a novel variation. Avoid identical exercise selections:
${previousPlan.weeklySchedule.map((d: any) => `Day ${d.dayNumber} (${d.focusTitle}): ${(d.exercises || []).map((e: any) => e.name).join(", ")}`).join("\n")}
`
    : "";

  const splitArchitectureGuide = `
SPLIT ARCHITECTURE FOR EXACTLY ${numDays} TRAINING DAYS:
${numDays === 2 ? `- Day 1: Full Body (Squat / Push focus)
- Day 2: Full Body (Hinge / Pull focus)` :
numDays === 3 ? `- Day 1: Push / Upper Body or Full Body A
- Day 2: Pull / Posterior Chain or Full Body B
- Day 3: Legs / Anterior Chain or Full Body C` :
numDays === 4 ? `- Day 1: Upper Body Strength & Power
- Day 2: Lower Body Strength & Posterior
- Day 3: Upper Body Hypertrophy & Pump
- Day 4: Lower Body Hypertrophy & Core` :
numDays === 5 ? `- Day 1: Push / Chest Primary
- Day 2: Pull / Back & Rear Delts
- Day 3: Legs / Lower Body Power
- Day 4: Upper Body Hypertrophy & Weak Point Focus
- Day 5: Lower Body & Core Specialization` :
numDays === 6 ? `- Day 1: Push (Heavy / Strength focus)
- Day 2: Pull (Heavy / Strength focus)
- Day 3: Legs (Heavy / Strength focus)
- Day 4: Push (Hypertrophy / Delts focus)
- Day 5: Pull (Hypertrophy / Lats & Arms focus)
- Day 6: Legs (Hypertrophy / Posterior Chain focus)` :
`- 7-day periodized athlete microcycle across all movement patterns`
}
`;

  const prompt = `You are the Lead Sports Physiologist, CSCS Strength Coach, and Master Trainer for LEVELUP Fitness OS.
Design a world-class, scientific, periodized, evidence-based weekly workout plan strictly customized to the user's specific profile:

USER PROFILE & CONSTRAINTS:
- Primary Fitness Goal: ${goal} (e.g., Muscle Gain / Hypertrophy, Fat Loss / Body Recomposition, Max Strength, General Fitness)
- Training Experience Level: ${experience} (Beginner / Intermediate / Advanced)
- Training Frequency: Exactly ${numDays} training days per week. You MUST create exactly ${numDays} day objects in "weeklySchedule".
- Target Workout Duration: ${duration}
- Available Equipment: ${equipment} (Full Gym / Dumbbells / Home / Bodyweight)
- Preferred Split: ${preferredSplit}
- Target Muscle Groups Focus: ${targetMusclesStr}
- Medical/Physical Limitations & Injuries: ${limitations || "None reported"}
- Special Preferences / Requests: ${preferences || "Focus on optimal biomechanics and joint longevity"}
- Iteration / Regeneration Count: ${regenerationCount}

${splitArchitectureGuide}
${previousPlanContext}

CRITICAL ARCHITECTURAL REQUIREMENTS:
1. "weeklySchedule" MUST contain an array of EXACTLY ${numDays} distinct day items (length = ${numDays}). Do NOT return fewer days or more days.
2. For each day, provide:
   - "dayNumber": 1, 2, ... up to ${numDays}
   - "dayName": "Day 1", "Day 2", etc.
   - "focusTitle": Specific descriptive training focus
   - "muscleGroups": Array of target muscle strings (e.g. ["Chest", "Front Delts", "Triceps"])
   - "isRestDay": boolean (false for scheduled training sessions)
   - "duration": "${duration}"
   - "warmup": { "duration": "8 mins", "routine": [ { "exercise": "name", "durationOrReps": "e.g. 2 x 15", "cues": "concise mobility cue" } ] } (3-4 specific dynamic mobility & activation drills)
   - "exercises": Array of 4-6 exercises arranged in optimal biomechanical order.
     Each exercise MUST have:
     * "orderIndex": 1, 2, 3...
     * "name": Exercise name matching ${equipment}
     * "targetMuscle": Specific anatomical muscle head
     * "sets": Integer (e.g. 3 or 4)
     * "reps": String with target rep range (e.g. "6-8 reps", "8-10 reps", "12-15 reps")
     * "restTime": String (e.g. "90-120 sec", "60 sec")
     * "tempo": Tempo notation string (e.g. "3-1-1-0", "2-0-1-1")
     * "formInstructions": Detailed, concise step-by-step coaching cue explaining proper setup, joint angles, breathing, and common flaws to avoid.
     * "intensityOrRPE": String (e.g. "RPE 8 (2 RIR)", "RPE 9 (1 RIR)")
     * "alternativeExercise": Smart equipment/injury alternative
   - "cooldown": { "duration": "5 mins", "routine": [ { "stretch": "name", "duration": "45s per side", "cues": "recovery cues" } ] }
   - "coachNotes": Practical coaching takeaway for the session.
3. "progressiveOverloadGuidance": Include actionable double progression rules, RPE guidelines, tempo advice, and deload protocols.
4. Strictly respect the user's limitations (${limitations || "None"}) and available equipment (${equipment}). Never prescribe barbells if equipment is Dumbbells or Bodyweight.

Return ONLY a valid JSON object matching this schema:
{
  "planName": "Descriptive plan title",
  "overview": "Scientific rationale and stimulus breakdown",
  "goal": "${goal}",
  "experience": "${experience}",
  "equipment": "${equipment}",
  "splitName": "${preferredSplit}",
  "trainingDaysCount": ${numDays},
  "estimatedDuration": "${duration}",
  "targetMuscles": "${targetMusclesStr}",
  "progressiveOverloadGuidance": {
    "principles": ["Rule 1", "Rule 2", "Rule 3"],
    "progressionRule": "Exact double progression rule",
    "rpeGuidance": "RPE roadmap across training block",
    "tempoAdvice": "Tempo guide",
    "deloadStrategy": "Deload timing and execution"
  },
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "dayName": "Day 1",
      "focusTitle": "Session Title",
      "muscleGroups": ["Muscle 1", "Muscle 2"],
      "isRestDay": false,
      "duration": "${duration}",
      "warmup": {
        "duration": "8 mins",
        "routine": [
          { "exercise": "Drill name", "durationOrReps": "2 x 12", "cues": "Mobility cues" }
        ]
      },
      "exercises": [
        {
          "orderIndex": 1,
          "name": "Exercise Name",
          "targetMuscle": "Muscle head",
          "sets": 4,
          "reps": "8-10 reps",
          "restTime": "90 sec",
          "tempo": "3-1-1-0",
          "formInstructions": "Detailed biomechanical step-by-step coaching cue.",
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
      "coachNotes": "Key takeaway for today."
    }
  ]
}`;

  try {
    const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();
    const result = await callGeminiCascade(prompt, {
      responseMimeType: "application/json",
      temperature: 0.85,
    }, apiKey);

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.weeklySchedule && Array.isArray(parsed.weeklySchedule) && parsed.weeklySchedule.length > 0) {
        parsed.id = parsed.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        parsed.goal = parsed.goal || goal;
        parsed.experience = parsed.experience || experience;
        parsed.equipment = parsed.equipment || equipment;
        parsed.splitName = parsed.splitName || preferredSplit;
        parsed.estimatedDuration = parsed.estimatedDuration || duration;

        // If Gemini returned fewer days than requested, dynamically append remaining days from procedural fallback
        if (parsed.weeklySchedule.length < numDays) {
          const fallback = generateProceduralFallbackPlan();
          for (let i = parsed.weeklySchedule.length; i < numDays; i++) {
            if (fallback.weeklySchedule[i]) {
              parsed.weeklySchedule.push({
                ...fallback.weeklySchedule[i],
                dayNumber: i + 1,
                dayName: `Day ${i + 1}`,
              });
            }
          }
        }

        // Format and enforce exact day count and indexes
        parsed.weeklySchedule = parsed.weeklySchedule.slice(0, numDays).map((day: any, idx: number) => ({
          dayNumber: idx + 1,
          dayName: day.dayName || `Day ${idx + 1}`,
          focusTitle: day.focusTitle || `${preferredSplit} - Day ${idx + 1}`,
          muscleGroups: Array.isArray(day.muscleGroups) ? day.muscleGroups : ["Target Muscles"],
          isRestDay: Boolean(day.isRestDay),
          duration: day.duration || duration,
          warmup: day.warmup || {
            duration: "8 mins",
            routine: [
              { exercise: "Dynamic Joint Preparation", durationOrReps: "2 sets x 10 reps", cues: "Open joint angles" },
            ],
          },
          exercises: (day.exercises || []).map((ex: any, exIdx: number) => ({
            orderIndex: exIdx + 1,
            name: ex.name || "Compound Movement",
            targetMuscle: ex.targetMuscle || "Target Muscle",
            sets: Number(ex.sets) || 3,
            reps: String(ex.reps || "8-12 reps"),
            restTime: String(ex.restTime || "90 sec"),
            tempo: String(ex.tempo || "3-0-1-0"),
            formInstructions: String(ex.formInstructions || "Maintain controlled tempo throughout rep."),
            intensityOrRPE: String(ex.intensityOrRPE || "RPE 8"),
            alternativeExercise: ex.alternativeExercise || "",
          })),
          cooldown: day.cooldown || {
            duration: "5 mins",
            routine: [
              { stretch: "Static Full-Body Stretch", duration: "45s per side", cues: "Deep diaphragmatic breathing" },
            ],
          },
          coachNotes: day.coachNotes || "Focus on progressive overload and pristine form.",
        }));

        parsed.trainingDaysCount = parsed.weeklySchedule.length;
        return jsonResponse(parsed);
      }
    }
    return jsonResponse(generateProceduralFallbackPlan());
  } catch (err: any) {
    console.warn("[AI Workout Generate Plan Worker Exception]:", err?.message);
    return jsonResponse(generateProceduralFallbackPlan());
  }
}
