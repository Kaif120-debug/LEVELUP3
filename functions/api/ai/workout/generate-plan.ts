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

// Comprehensive scientific movement database with multiple variants per movement pattern & equipment
interface ExerciseTemplate {
  name: string;
  targetMuscle: string;
  equipment: "Full Gym" | "Dumbbells" | "Home" | "Bodyweight";
  formInstructions: string;
  intensityOrRPE: string;
  alternativeExercise: string;
}

const EXERCISE_CATALOG: Record<string, ExerciseTemplate[]> = {
  // --- CHEST / HORIZONTAL PUSH ---
  chest_compound_flat: [
    {
      name: "Barbell Flat Bench Press",
      targetMuscle: "Pectoralis Major (Sternal & Costal Heads)",
      equipment: "Full Gym",
      formInstructions: "Retract and depress scapulae into the bench. Maintain slight arch in thoracic spine, lower bar to mid-sternum under 3s control, then drive upward explosively.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Flat Dumbbell Press",
    },
    {
      name: "Flat Dumbbell Bench Press",
      targetMuscle: "Pectoralis Major (Mid & Outer Fibers)",
      equipment: "Dumbbells",
      formInstructions: "Keep wrists stacked directly over elbows. Lower dumbbells to 45-degree angle relative to torso for deep pec stretch, then press up in a converging arc.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Barbell Bench Press or Floor Press",
    },
    {
      name: "Standard Push-ups with 2s Deficit Pause",
      targetMuscle: "Pectoralis Major & Anterior Deltoid",
      equipment: "Bodyweight",
      formInstructions: "Maintain rigid plank alignment from crown to heels. Lower chest to floor with elbows at 45 degrees, pause for 2s at bottom, then press up.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Elevated Push-ups",
    },
    {
      name: "Chest-Focused Parallel Bar Dips",
      targetMuscle: "Lower Pectoralis Major & Triceps",
      equipment: "Full Gym",
      formInstructions: "Lean torso forward roughly 30 degrees with elbows flared slightly. Descend until shoulders reach elbow depth, then press forcefully through palms.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Decline Dumbbell Press",
    },
    {
      name: "Floor Dumbbell Chest Press",
      targetMuscle: "Pectoralis Major & Triceps",
      equipment: "Dumbbells",
      formInstructions: "Lie on floor with knees bent. Lower triceps to lightly touch floor, pause 1s to eliminate elastic momentum, then press up.",
      intensityOrRPE: "RPE 8",
      alternativeExercise: "Push-ups",
    },
    {
      name: "Decline Push-ups (Feet Elevated on Chair/Box)",
      targetMuscle: "Upper Pectoralis & Anterior Deltoid",
      equipment: "Home",
      formInstructions: "Place feet elevated on chair or bed. Keep core tightly braced, lower chest toward ground, and press up smoothly.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Standard Push-ups",
    },
  ],

  chest_incline: [
    {
      name: "Incline Dumbbell Bench Press (30° Angle)",
      targetMuscle: "Clavicular Pectoralis Major (Upper Chest)",
      equipment: "Full Gym",
      formInstructions: "Set bench to 30 degrees. Lower dumbbells until level with upper chest for a deep stretch, then drive upward without clanking weights at apex.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Incline Barbell Press",
    },
    {
      name: "Incline Dumbbell Bench Press",
      targetMuscle: "Upper Pectoralis Major",
      equipment: "Dumbbells",
      formInstructions: "Set adjustable bench to 30-45 degrees. Lower dumbbells in controlled 3s tempo, flare elbows at 45 degrees, and drive up with chest squeeze.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Incline Dumbbell Fly-Press",
    },
    {
      name: "Low-to-High Cable Chest Flyes",
      targetMuscle: "Clavicular Head & Inner Pectoralis",
      equipment: "Full Gym",
      formInstructions: "Set cables at bottom pulleys. With slight elbow bend, scoop handles upward and together to chin height, squeezing upper chest for 1 full second.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Incline Dumbbell Flyes",
    },
    {
      name: "Incline Dumbbell Fly-Press",
      targetMuscle: "Upper Pectoralis Major (Stretch-Mediated)",
      equipment: "Dumbbells",
      formInstructions: "Combine fly eccentric with pressing concentric: lower out wide for deep stretch, tuck elbows slightly on the way up to press.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Flat Dumbbell Flyes",
    },
    {
      name: "Pike to Cobra Dynamic Push-up Flow",
      targetMuscle: "Upper Chest & Shoulder Girdle",
      equipment: "Bodyweight",
      formInstructions: "From downward dog/pike position, swoop chest down close to floor and transition smoothly into cobra, emphasizing eccentric control.",
      intensityOrRPE: "RPE 8",
      alternativeExercise: "Feet-Elevated Push-ups",
    },
  ],

  chest_isolation: [
    {
      name: "Pec Deck Machine Flyes",
      targetMuscle: "Sternal Pectoralis Major (Peak Contraction)",
      equipment: "Full Gym",
      formInstructions: "Set seat height so handles align with mid-chest. Sweep arms together, squeeze pecs hard at midline for 2 seconds, and resist the 3s stretch back.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Standing Cable Crossover",
    },
    {
      name: "Standing Cable Crossovers (Middle Pulley)",
      targetMuscle: "Sternal Pectoralis Major",
      equipment: "Full Gym",
      formInstructions: "Step forward into staggered stance. Drive handles across body with slight cross-over at finish to maximize short-muscle position tension.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Dumbbell Flyes",
    },
    {
      name: "Flat Dumbbell Chest Flyes with Iso-Pause",
      targetMuscle: "Pectoralis Major Outer Border",
      equipment: "Dumbbells",
      formInstructions: "Maintain 15-degree bend in elbows. Lower weights out wide until deep chest stretch, pause 1s at bottom, then squeeze chest to bring dumbbells up.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Svend Press",
    },
    {
      name: "Floor Slide Chest Flyes (using towels/sliders)",
      targetMuscle: "Pectoralis Major & Serratus Anterior",
      equipment: "Bodyweight",
      formInstructions: "From knees, slide hands out laterally on smooth floor, then engage chest and core to pull hands back inward to start.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Wide Grip Push-ups",
    },
  ],

  // --- SHOULDERS / VERTICAL PUSH & DELTOIDS ---
  shoulders_compound: [
    {
      name: "Standing Overhead Barbell Press (OHP)",
      targetMuscle: "Anterior Deltoids, Clavicular Pec & Triceps",
      equipment: "Full Gym",
      formInstructions: "Squeeze glutes and brace abdominal wall. Press barbell vertically clearing chin, locking out overhead with biceps aligned next to ears.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Seated Dumbbell Overhead Press",
    },
    {
      name: "Seated Dumbbell Shoulder Press",
      targetMuscle: "Anterior & Lateral Deltoids",
      equipment: "Dumbbells",
      formInstructions: "Sit with back supported. Press dumbbells upward in a slight natural arc, locking out overhead without allowing lumbar spine to hyperextend.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Standing Dumbbell Press",
    },
    {
      name: "Dumbbell Arnold Press",
      targetMuscle: "Anterior & Lateral Deltoids (Rotational)",
      equipment: "Dumbbells",
      formInstructions: "Start with dumbbells at collarbones with palms facing you. Rotate wrists outward as you press overhead, finishing with palms facing forward.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Seated DB Press",
    },
    {
      name: "Seated Machine Shoulder Press",
      targetMuscle: "Anterior & Lateral Deltoids",
      equipment: "Full Gym",
      formInstructions: "Adjust seat so handles start at ear level. Drive up smoothly to near lockout, lowering under strict 3-second control.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Overhead Barbell Press",
    },
    {
      name: "Elevated Pike Push-ups",
      targetMuscle: "Anterior Deltoids & Triceps",
      equipment: "Bodyweight",
      formInstructions: "Elevate feet on bench or bed, hips bent 90 degrees directly over hands. Lower top of head toward floor between hands, then press back up.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Standard Pike Push-ups",
    },
  ],

  shoulders_lateral: [
    {
      name: "Cable Lateral Raises (Behind the Back / Cuff)",
      targetMuscle: "Lateral Deltoids (Side Delts)",
      equipment: "Full Gym",
      formInstructions: "Attach cable cuff to wrist. Step slightly forward of pulley, raise arm out to 90 degrees leading with elbow, pausing at the apex.",
      intensityOrRPE: "RPE 9 (1 RIR)",
      alternativeExercise: "Dumbbell Lateral Raise",
    },
    {
      name: "Dumbbell Lean-Away Lateral Raises",
      targetMuscle: "Lateral Deltoids (Constant Tension)",
      equipment: "Dumbbells",
      formInstructions: "Hold sturdy post and lean torso 15 degrees laterally. Raise dumbbell to shoulder height with pinky tilted slightly upward, avoiding swinging.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Seated Dumbbell Lateral Raises",
    },
    {
      name: "Seated Dumbbell Lateral Raises (Strict Dead-Stop)",
      targetMuscle: "Lateral Deltoids (Isolated)",
      equipment: "Dumbbells",
      formInstructions: "Sit on bench. Raise dumbbells to shoulder level with strict form, completely eliminating lower back momentum.",
      intensityOrRPE: "RPE 9.5",
      alternativeExercise: "Standing Lateral Raises",
    },
    {
      name: "Resistance Band / Water-Jug Lateral Raises",
      targetMuscle: "Lateral Deltoids",
      equipment: "Home",
      formInstructions: "Step on band center. Pull handles out laterally to 90 degrees with a 1-second squeeze at the apex.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Prone Y-Raises",
    },
  ],

  shoulders_rear_delt: [
    {
      name: "Seated Face Pulls with External Rotation",
      targetMuscle: "Posterior Deltoids & Rotator Cuff (Infraspinatus)",
      equipment: "Full Gym",
      formInstructions: "Set rope at forehead height. Pull toward bridge of nose while rotating thumbs and wrists backward, squeezing scapulae firmly for 2s.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Reverse Cable Flyes",
    },
    {
      name: "Incline Chest-Supported Dumbbell Rear Delt Flyes",
      targetMuscle: "Posterior Deltoids & Rhomboids",
      equipment: "Dumbbells",
      formInstructions: "Lie chest-down on 30-degree incline bench. Sweep dumbbells outward in wide arc leading with elbows, keeping traps relaxed.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Face Pulls",
    },
    {
      name: "Reverse Pec Deck Machine Flyes",
      targetMuscle: "Posterior Deltoids",
      equipment: "Full Gym",
      formInstructions: "Sit facing machine pad. Drive handles backward with elbows slightly unlocked, isolating the rear deltoid cap.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Bent-Over DB Rear Delt Flyes",
    },
    {
      name: "Prone Y-T-W Scapular Isometric Holds",
      targetMuscle: "Rear Deltoids, Lower Traps & Rhomboids",
      equipment: "Bodyweight",
      formInstructions: "Lie face down on floor. Cycle through Y, T, and W arm positions, holding each for 5 seconds with active scapular retraction.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Band Pull-Aparts",
    },
  ],

  // --- BACK / VERTICAL & HORIZONTAL PULL ---
  back_vertical_pull: [
    {
      name: "Overhand Wide-Grip Lat Pulldown",
      targetMuscle: "Latissimus Dorsi (Outer Width) & Teres Major",
      equipment: "Full Gym",
      formInstructions: "Grip bar 1.5x shoulder width. Depress scapulae, drive elbows straight down toward ribs, and touch bar to upper clavicle with chest puffed.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Pull-ups",
    },
    {
      name: "Bodyweight / Weighted Pull-ups (Pronated Grip)",
      targetMuscle: "Latissimus Dorsi & Upper Back",
      equipment: "Full Gym",
      formInstructions: "Start from dead-hang stretch. Pull chest to bar by driving elbows down into hips, pausing at top before 3-second lowering.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Lat Pulldowns",
    },
    {
      name: "Neutral-Grip Lat Pulldown / Mag-Grip Pulldown",
      targetMuscle: "Latissimus Dorsi & Brachialis",
      equipment: "Full Gym",
      formInstructions: "Use close neutral grip. Pull handle to chest while arching upper thoracic spine, achieving maximum lower lat contraction.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Underhand Lat Pulldown",
    },
    {
      name: "Dumbbell Pullover across Flat Bench",
      targetMuscle: "Latissimus Dorsi & Serratus Anterior",
      equipment: "Dumbbells",
      formInstructions: "Rest upper back across bench. Lower dumbbell behind head in deep arc feeling deep lat stretch, then pull back to forehead level.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Single-Arm DB Pullover",
    },
    {
      name: "Pull-ups / Chin-ups (Doorway Bar or Rafters)",
      targetMuscle: "Latissimus Dorsi & Biceps",
      equipment: "Home",
      formInstructions: "Hang with full elbow extension. Pull up until chin clears bar, holding top position for 1 full second before 3s eccentric.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Towel Inverted Rows",
    },
  ],

  back_horizontal_pull: [
    {
      name: "Chest-Supported T-Bar Row / Machine Row",
      targetMuscle: "Mid-Traps, Rhomboids & Latissimus Dorsi",
      equipment: "Full Gym",
      formInstructions: "Lie against chest pad to eliminate lumbar strain. Pull handles back driving elbows past torso, squeezing shoulder blades together for 1s.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Seated Cable Row",
    },
    {
      name: "Single-Arm Dumbbell Row (Lawnmower Row)",
      targetMuscle: "Latissimus Dorsi & Lower Traps",
      equipment: "Dumbbells",
      formInstructions: "Support knee and hand on bench. Pull dumbbell toward hip pocket keeping elbow tucked close to side, lowering for deep lat stretch.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Chest-Supported Dumbbell Row",
    },
    {
      name: "Bent-Over Barbell Pendlay Row",
      targetMuscle: "Erector Spinae, Latissimus Dorsi & Rhomboids",
      equipment: "Full Gym",
      formInstructions: "Hinge at hips with back parallel to floor. Explosively pull barbell to lower chest from dead-stop off floor, then lower under control.",
      intensityOrRPE: "RPE 8",
      alternativeExercise: "Barbell Yates Row",
    },
    {
      name: "Seated Cable Row (Close-Grip V-Bar)",
      targetMuscle: "Latissimus Dorsi, Rhomboids & Erector Spinae",
      equipment: "Full Gym",
      formInstructions: "Sit upright with neutral spine. Pull attachment to abdomen, flare lats out during 3s eccentric stretch without rounding lumbar spine.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Chest Supported Row",
    },
    {
      name: "Chest-Supported Incline Dumbbell Row",
      targetMuscle: "Upper Back, Rhomboids & Rear Delts",
      equipment: "Dumbbells",
      formInstructions: "Set bench to 30 degrees. Lie chest down and row both dumbbells simultaneously with elbows flared at 60 degrees for upper back bias.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Single-Arm DB Row",
    },
    {
      name: "Inverted Table / Sheet Bed Rows",
      targetMuscle: "Rhomboids, Middle Trapezius & Lats",
      equipment: "Bodyweight",
      formInstructions: "Position body under sturdy table or sheet tied in door. Pull chest up to edge keeping body straight, pause 1s at top.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Doorframe Towel Rows",
    },
  ],

  // --- LEGS / QUAD DOMINANT ---
  legs_quad_compound: [
    {
      name: "Barbell Back Squat (High-Bar / Quad Bias)",
      targetMuscle: "Quadriceps (Vastus Lateralis, Medialis) & Gluteus Maximus",
      equipment: "Full Gym",
      formInstructions: "Bar across upper traps. Descend with upright torso until hip crease is below knee level, driving through midfoot out of the hole.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Hack Squat or Leg Press",
    },
    {
      name: "Linear 45-Degree Leg Press (Close Stance)",
      targetMuscle: "Quadriceps (Vastus Medialis / Teardrop & Lateralis)",
      equipment: "Full Gym",
      formInstructions: "Place feet low and shoulder-width on sled. Lower weight until knees reach 90 degrees without lower back peeling off pad, then press smoothly.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Barbell Squat",
    },
    {
      name: "Dumbbell Goblet Squat with Heel Elevation",
      targetMuscle: "Quadriceps & Core Stability",
      equipment: "Dumbbells",
      formInstructions: "Hold dumbbell vertical at chest. Elevate heels on 1-inch plates to increase knee flexion, descend into deep squat with vertical torso.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Front Rack DB Squats",
    },
    {
      name: "Dumbbell Bulgarian Split Squats",
      targetMuscle: "Quadriceps & Gluteus Medius",
      equipment: "Dumbbells",
      formInstructions: "Elevate rear foot on bench. Drop back knee straight down toward floor with torso upright to heavily bias front quadriceps.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Walking DB Lunges",
    },
    {
      name: "Machine Hack Squat / Pendulum Squat",
      targetMuscle: "Quadriceps (Deep Knee Flexion)",
      equipment: "Full Gym",
      formInstructions: "Position shoulders under pads with back flat against backrest. Lower slowly for 3s to full depth, then drive up through midfoot.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Leg Press",
    },
    {
      name: "Bodyweight Bulgarian Split Squats with 3s Pause",
      targetMuscle: "Quadriceps & Glutes",
      equipment: "Bodyweight",
      formInstructions: "Rear foot on couch/chair. Lower under 3s tempo until back knee is 1 inch off floor, pause 2s, then drive up through front heel.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Air Squats with 3s Eccentric",
    },
  ],

  legs_quad_isolation: [
    {
      name: "Seated Machine Leg Extensions",
      targetMuscle: "Rectus Femoris & Vastus Lateralis",
      equipment: "Full Gym",
      formInstructions: "Set back pad so knees align with machine pivot. Extend legs fully, hold 1s at top lockout with quad squeeze, and lower for 3s.",
      intensityOrRPE: "RPE 9 (1 RIR)",
      alternativeExercise: "Sissy Squats",
    },
    {
      name: "Walking Dumbbell Lunges",
      targetMuscle: "Quadriceps, Glutes & Adductors",
      equipment: "Dumbbells",
      formInstructions: "Take measured steps forward. Lower back knee until gently grazing ground, tracking front knee over second toe.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Reverse Lunges",
    },
    {
      name: "Bodyweight Sissy Squats (Quad Stretch Focus)",
      targetMuscle: "Rectus Femoris (Lengthened Position)",
      equipment: "Bodyweight",
      formInstructions: "Hold doorframe for balance. Push knees forward while leaning torso backward in straight line, descending until deep quad stretch.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Step-ups",
    },
  ],

  // --- LEGS / POSTERIOR CHAIN & HAMSTRINGS ---
  legs_hamstring_hinge: [
    {
      name: "Barbell Romanian Deadlift (RDL)",
      targetMuscle: "Hamstrings (Biceps Femoris & Semitendinosus) & Glutes",
      equipment: "Full Gym",
      formInstructions: "Soft knee bend. Push hips back as far as possible keeping barbell skimming thighs, feeling deep hamstring stretch at shin level before driving hips forward.",
      intensityOrRPE: "RPE 8 (2 RIR)",
      alternativeExercise: "Dumbbell RDL",
    },
    {
      name: "Dumbbell Romanian Deadlift",
      targetMuscle: "Hamstrings & Gluteus Maximus",
      equipment: "Dumbbells",
      formInstructions: "Hold dumbbells in front of thighs. Hinge hips straight back keeping spine neutral, lower dumbbells just below knees until hamstrings are taut.",
      intensityOrRPE: "RPE 8",
      alternativeExercise: "Single-Leg Dumbbell RDL",
    },
    {
      name: "Barbell Hip Thrust with 2s Peak Squeeze",
      targetMuscle: "Gluteus Maximus & Upper Hamstrings",
      equipment: "Full Gym",
      formInstructions: "Upper back against bench, bar padded across hips. Drive through heels to full hip extension, tucking chin and squeezing glutes hard at apex for 2s.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Dumbbell Hip Thrust",
    },
    {
      name: "Single-Leg Romanian Deadlift (Bodyweight / DB)",
      targetMuscle: "Hamstrings & Glute Stabilizers",
      equipment: "Dumbbells",
      formInstructions: "Stand on one leg. Hinge forward extending opposite leg straight back like a lever, keeping pelvis square to floor.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Glute Bridges",
    },
    {
      name: "Nordic Hamstring Curls (Feet Anchored under Bed)",
      targetMuscle: "Hamstrings (Eccentric Overload)",
      equipment: "Bodyweight",
      formInstructions: "Kneel with ankles anchored. Lower torso forward under strict hamstring control as far as possible, catch with hands and push back up.",
      intensityOrRPE: "RPE 9.5",
      alternativeExercise: "Slider Hamstring Curls",
    },
  ],

  legs_hamstring_curl: [
    {
      name: "Seated Machine Leg Curl",
      targetMuscle: "Hamstrings (Knee Flexion in Hip-Flexed Stretch)",
      equipment: "Full Gym",
      formInstructions: "Lock thigh pad down tightly. Curl heels underneath seat smoothly, pause 1s at full contraction, and take 3 seconds to return to full stretch.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Lying Leg Curl",
    },
    {
      name: "Lying Dumbbell Leg Curl (Dumbbell Between Feet)",
      targetMuscle: "Hamstrings (Peak Knee Flexion)",
      equipment: "Dumbbells",
      formInstructions: "Lie prone on bench clamping dumbbell between arches of feet. Curl feet toward glutes, pausing briefly at the top.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Single-Leg Glute Bridges",
    },
    {
      name: "Lying Machine Hamstring Curl",
      targetMuscle: "Hamstrings (Biceps Femoris)",
      equipment: "Full Gym",
      formInstructions: "Lie face down with pad behind ankles. Curl heels toward glutes without allowing hips to rise off the bench pad.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Seated Leg Curl",
    },
    {
      name: "Towel / Slider Floor Hamstring Curls",
      targetMuscle: "Hamstrings & Glutes",
      equipment: "Bodyweight",
      formInstructions: "Lie on back with heels on towels on smooth floor. Bridge hips up and curl heels toward glutes simultaneously.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Single-Leg Glute Bridge",
    },
  ],

  // --- CALVES ---
  calves: [
    {
      name: "Standing Machine Calf Raises with 2s Stretch Pause",
      targetMuscle: "Gastrocnemius (Medial & Lateral Heads)",
      equipment: "Full Gym",
      formInstructions: "Ball of foot on ledge. Lower heels into deep 2-second stretch, then drive onto big toes, squeezing apex for 1 second.",
      intensityOrRPE: "RPE 9.5",
      alternativeExercise: "Leg Press Calf Raises",
    },
    {
      name: "Seated Machine Calf Raises",
      targetMuscle: "Soleus (Deep Calf Muscle)",
      equipment: "Full Gym",
      formInstructions: "Knees bent at 90 degrees. Lower into full stretch, pause 2s to eliminate Achilles elastic rebound, then press up.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Dumbbell Seated Calf Raise",
    },
    {
      name: "Single-Leg Dumbbell Calf Raises on Ledge",
      targetMuscle: "Gastrocnemius & Soleus",
      equipment: "Dumbbells",
      formInstructions: "Hold dumbbell on working side. Balance on one foot on stair ledge, performing full range-of-motion repetitions.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Bodyweight Calf Raises",
    },
    {
      name: "Single-Leg Stair Calf Raises (Bodyweight)",
      targetMuscle: "Gastrocnemius",
      equipment: "Bodyweight",
      formInstructions: "Perform on bottom stair step. 2-second pause at bottom stretch, 1-second squeeze at top.",
      intensityOrRPE: "RPE 9.5",
      alternativeExercise: "Elevated Calf Bounces",
    },
  ],

  // --- ARMS / BICEPS ---
  arms_biceps: [
    {
      name: "Incline Dumbbell Biceps Curls (45° Stretch)",
      targetMuscle: "Biceps Brachii (Long Head & Distal Stretch)",
      equipment: "Dumbbells",
      formInstructions: "Sit back on 45-degree incline bench with arms hanging straight down. Curl upward while supinating wrists, squeezing biceps hard at top.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Standing Barbell Curl",
    },
    {
      name: "Standing EZ-Bar Biceps Curl",
      targetMuscle: "Biceps Brachii (Short & Long Heads)",
      equipment: "Full Gym",
      formInstructions: "Keep elbows pinned at sides. Curl bar smoothly without swinging hips or shoulders, lowering under 3s control.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Dumbbell Alternating Curl",
    },
    {
      name: "Dumbbell Hammer Curls (Neutral Grip)",
      targetMuscle: "Brachialis & Brachioradialis (Forearm & Arm Thickness)",
      equipment: "Dumbbells",
      formInstructions: "Palms facing each other throughout rep. Curl dumbbells upward to collarbones, emphasizing upper forearm and brachialis.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Rope Cable Hammer Curls",
    },
    {
      name: "Cable Bayesian / Behind-the-Back Curls",
      targetMuscle: "Biceps Long Head (Maximum Stretch Position)",
      equipment: "Full Gym",
      formInstructions: "Step forward from low cable pulley so arm is pulled behind torso. Curl handle forward with intense focus on long head stretch.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Preacher Curls",
    },
    {
      name: "Towel Doorframe Curls / Isometric Chin-up Holds",
      targetMuscle: "Biceps Brachii & Forearms",
      equipment: "Bodyweight",
      formInstructions: "Loop towel around sturdy door handle or hold at chin-up apex, holding isometric contraction with maximum intent.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Doorway Curls",
    },
  ],

  // --- ARMS / TRICEPS ---
  arms_triceps: [
    {
      name: "Overhead Rope Cable Triceps Extensions",
      targetMuscle: "Triceps Brachii (Long Head Stretch)",
      equipment: "Full Gym",
      formInstructions: "Set pulley at chest height. Face away, extend arms overhead and spread rope ends apart at full lockout, feeling deep triceps stretch.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Overhead Dumbbell Extension",
    },
    {
      name: "Straight-Bar or V-Bar Cable Triceps Pushdowns",
      targetMuscle: "Triceps Brachii (Lateral & Medial Heads)",
      equipment: "Full Gym",
      formInstructions: "Keep elbows pinned tight against ribcage. Push bar straight down to thighs and lock elbows fully with 1s squeeze.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Rope Pushdowns",
    },
    {
      name: "Incline Dumbbell Skull Crushers",
      targetMuscle: "Triceps Brachii (Long & Lateral Heads)",
      equipment: "Dumbbells",
      formInstructions: "Lie on 15-degree incline. Lower dumbbells past ears bending only at the elbows, then extend forearms forcefully.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Close-Grip DB Press",
    },
    {
      name: "Single-Arm Overhead Dumbbell Triceps Extension",
      targetMuscle: "Triceps Long Head",
      equipment: "Dumbbells",
      formInstructions: "Hold dumbbell vertically behind head with elbow pointed up. Extend forearm to vertical lockout.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Triceps Kickbacks",
    },
    {
      name: "Diamond Push-ups / Chair Triceps Dips",
      targetMuscle: "Triceps Brachii & Anterior Deltoid",
      equipment: "Bodyweight",
      formInstructions: "Place index fingers and thumbs together under sternum. Lower chest to hands keeping elbows tucked close to sides, press up forcefully.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Bench Dips",
    },
  ],

  // --- CORE & ABS ---
  core: [
    {
      name: "Hanging Leg Raises / Captain's Chair Knee Tucks",
      targetMuscle: "Rectus Abdominis (Lower Fibers) & Hip Flexors",
      equipment: "Full Gym",
      formInstructions: "Hang from bar without swinging. Posteriorly tilt pelvis first, then curl knees or straight legs toward chest under control.",
      intensityOrRPE: "RPE 9",
      alternativeExercise: "Ab Wheel Rollouts",
    },
    {
      name: "Ab Wheel Rollouts from Knees",
      targetMuscle: "Anterior Core & Transverse Abdominis (Anti-Extension)",
      equipment: "Full Gym",
      formInstructions: "Maintain posterior pelvic tilt and rounded upper back. Roll wheel out as far as core can maintain without lower back sagging.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Plank Walkouts",
    },
    {
      name: "High-to-Low Cable Woodchoppers",
      targetMuscle: "Internal & External Obliques",
      equipment: "Full Gym",
      formInstructions: "Rotate torso across body in a diagonal downward chop, keeping arms extended and pivoting rear foot.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Russian Twists",
    },
    {
      name: "Dumbbell Suitcase Carries / Holds",
      targetMuscle: "Quadratus Lumborum & Anti-Lateral Flexion Core",
      equipment: "Dumbbells",
      formInstructions: "Hold heavy dumbbell on one side only. Walk with pristine vertical posture, actively resisting torso tilting.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Side Planks with Hip Dips",
    },
    {
      name: "Dead Bug with 3-Second Isometric Hold",
      targetMuscle: "Deep Core Stabilizers (Transverse Abdominis)",
      equipment: "Bodyweight",
      formInstructions: "Press lower back firmly flat into floor. Extend opposite arm and leg simultaneously while keeping lumbar spine glued down.",
      intensityOrRPE: "RPE 8.5",
      alternativeExercise: "Hollow Body Holds",
    },
  ],
};

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
    requestId = "",
  } = body;

  const numDays = Math.max(2, Math.min(7, Number(trainingDays) || 4));
  const targetMusclesStr = Array.isArray(targetMuscles) && targetMuscles.length > 0
    ? targetMuscles.join(", ")
    : "Comprehensive Balanced Development";

  const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const genId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRequestId = requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Multi-tier intelligent procedural fallback generator that varies exercises and respects constraints
  const generateProceduralFallbackPlan = () => {
    const isHome = equipment === "Home" || equipment === "Bodyweight";
    const isDumbbellOnly = equipment === "Dumbbells";
    const equipFilter = isHome ? "Bodyweight" : isDumbbellOnly ? "Dumbbells" : "Full Gym";

    // Helper to pick varied exercise from catalog matching equipment and category with seed rotation
    const pickExercise = (category: string, variationOffset = 0): ExerciseTemplate => {
      const list = EXERCISE_CATALOG[category] || [];
      const valid = list.filter((e) => {
        if (equipFilter === "Bodyweight") return e.equipment === "Bodyweight" || e.equipment === "Home";
        if (equipFilter === "Dumbbells") return e.equipment === "Dumbbells" || e.equipment === "Bodyweight" || e.equipment === "Home";
        return true;
      });
      const pool = valid.length > 0 ? valid : list;
      const idx = (Math.abs(Number(regenerationCount) || 0) + variationOffset) % pool.length;
      return pool[idx] || pool[0];
    };

    // Goal-specific prescription adjustments
    let repGuidance = "8-10 reps";
    let restGuidance = "90 sec";
    let tempoGuidance = "3-0-1-0";
    let rpeBase = "RPE 8 (2 RIR)";

    if (goal === "Strength") {
      repGuidance = "4-6 reps";
      restGuidance = "120-180 sec";
      tempoGuidance = "3-1-X-0";
      rpeBase = "RPE 8 (2 RIR)";
    } else if (goal === "Fat Loss") {
      repGuidance = "12-15 reps";
      restGuidance = "45-60 sec";
      tempoGuidance = "2-0-1-0";
      rpeBase = "RPE 8.5 (1-2 RIR)";
    } else if (goal === "General Fitness") {
      repGuidance = "10-12 reps";
      restGuidance = "60-75 sec";
      tempoGuidance = "2-1-1-0";
      rpeBase = "RPE 7.5";
    }

    const setsCount = experience === "Beginner" ? 3 : experience === "Advanced" ? 4 : 3;

    // Day architecture templates for up to 7 distinct days
    const dayBlueprints = [
      {
        dayNumber: 1,
        dayName: "Day 1",
        focusTitle: preferredSplit.includes("Push") ? "Push (Chest, Deltoids & Triceps)" : "Upper Body Power & Hypertrophy",
        muscleGroups: ["Chest", "Front/Side Deltoids", "Triceps", "Upper Back"],
        categories: ["chest_compound_flat", "back_horizontal_pull", "shoulders_compound", "shoulders_lateral", "arms_triceps"],
        coachNotes: "Focus on mind-muscle connection during the eccentric lowering phase. Do not sacrifice range of motion for heavier weight.",
      },
      {
        dayNumber: 2,
        dayName: "Day 2",
        focusTitle: preferredSplit.includes("Pull") ? "Pull (Lats, Upper Back & Biceps)" : "Lower Body Posterior & Quad Focus",
        muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
        categories: ["legs_quad_compound", "legs_hamstring_hinge", "legs_quad_isolation", "calves", "core"],
        coachNotes: "Lower body workouts generate significant central fatigue. Hydrate well and prioritize post-workout protein intake.",
      },
      {
        dayNumber: 3,
        dayName: "Day 3",
        focusTitle: preferredSplit.includes("Push") ? "Legs & Core Dynamic Power" : "Full Body Hypertrophy & Arms",
        muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Core"],
        categories: ["legs_quad_compound", "legs_hamstring_curl", "legs_hamstring_hinge", "calves", "core"],
        coachNotes: "Focus on deep range of motion and explosive concentric drive on compound leg movements.",
      },
      {
        dayNumber: 4,
        dayName: "Day 4",
        focusTitle: "Upper Body Hypertrophy & Deltoid/Arm Specialization",
        muscleGroups: ["Chest", "Upper Back", "Biceps", "Triceps", "Rear Delts"],
        categories: ["chest_incline", "back_vertical_pull", "shoulders_rear_delt", "arms_biceps", "arms_triceps"],
        coachNotes: "Focus on isolating the target muscle with zero body english on curls and extensions.",
      },
      {
        dayNumber: 5,
        dayName: "Day 5",
        focusTitle: "Push Hypertrophy & Deltoid/Chest Specialization",
        muscleGroups: ["Upper Chest", "Lateral Delts", "Triceps", "Core"],
        categories: ["chest_isolation", "shoulders_lateral", "shoulders_compound", "arms_triceps", "core"],
        coachNotes: "Maintain maximum tension on the targeted muscle groups. Keep rest times strictly on clock.",
      },
      {
        dayNumber: 6,
        dayName: "Day 6",
        focusTitle: "Pull Hypertrophy, Posterior Chain & Arm Finisher",
        muscleGroups: ["Lats", "Rhomboids", "Hamstrings", "Biceps", "Core"],
        categories: ["back_horizontal_pull", "back_vertical_pull", "arms_biceps", "shoulders_rear_delt", "core"],
        coachNotes: "Finishing the training block with optimal volume across upper back and pulling musculature.",
      },
      {
        dayNumber: 7,
        dayName: "Day 7",
        focusTitle: "Active Recovery, Mobility & Core Longevity Protocol",
        muscleGroups: ["Full Body Fascia", "Core", "Joint Capsules"],
        categories: ["core", "shoulders_rear_delt"],
        coachNotes: "Recovery is when physiological remodeling occurs. Prioritize hydration, nutrition, and restorative rest.",
      },
    ];

    const finalSchedule = dayBlueprints.slice(0, numDays).map((day, dIdx) => {
      const exercises = day.categories.map((cat, exIdx) => {
        // Vary using day index and offset so consecutive days use distinct variations
        const exTpl = pickExercise(cat, dIdx * 2 + exIdx + 1);
        return {
          orderIndex: exIdx + 1,
          name: exTpl.name,
          targetMuscle: exTpl.targetMuscle,
          sets: setsCount,
          reps: repGuidance,
          restTime: restGuidance,
          tempo: tempoGuidance,
          formInstructions: exTpl.formInstructions,
          intensityOrRPE: exTpl.intensityOrRPE || rpeBase,
          alternativeExercise: exTpl.alternativeExercise,
        };
      });

      return {
        dayNumber: dIdx + 1,
        dayName: `Day ${dIdx + 1}`,
        focusTitle: day.focusTitle,
        muscleGroups: day.muscleGroups,
        isRestDay: false,
        duration: duration || "60 mins",
        warmup: {
          duration: "8 mins",
          routine: [
            { exercise: "Dynamic Joint Rotations & Shoulder Dislocates", durationOrReps: "2 sets x 12 reps", cues: "Open joint capsules and lubricate synovial fluid" },
            { exercise: "Cat-Cow & World's Greatest Stretch", durationOrReps: "5 reps each side", cues: "Mobilize thoracic spine and hip flexors" },
          ],
        },
        exercises,
        cooldown: {
          duration: "5 mins",
          routine: [
            { stretch: "Full-Body Static Mobility Stretch", duration: "45s per side", cues: "Slow diaphragmatic nasal breathing to downregulate CNS" },
          ],
        },
        coachNotes: day.coachNotes,
      };
    });

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      generationId: genId,
      requestId: effectiveRequestId,
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
        tempoAdvice: tempoGuidance,
        deloadStrategy: "Perform a deload every 6-8 weeks by reducing working sets by 40% while preserving load intensity.",
      },
      weeklySchedule: finalSchedule,
    };
  };

  const previousPlanContext = previousPlan && previousPlan.weeklySchedule
    ? `
PREVIOUS PLAN TO AVOID (REGENERATION #${Number(regenerationCount) + 1}):
The user requested a novel variation. Avoid identical exercise selections from the previous generation:
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

[GENERATION TOKEN & SEED: ${seed} | Request: ${effectiveRequestId} | Cycle: ${regenerationCount}]

USER PROFILE & CONSTRAINTS:
- Primary Fitness Goal: ${goal}
- Training Experience Level: ${experience}
- Training Frequency: Exactly ${numDays} training days per week. You MUST create exactly ${numDays} day objects in "weeklySchedule".
- Target Workout Duration: ${duration}
- Available Equipment: ${equipment} (Full Gym / Dumbbells / Home / Bodyweight)
- Preferred Split: ${preferredSplit}
- Target Muscle Groups Focus: ${targetMusclesStr}
- Medical/Physical Limitations & Injuries: ${limitations || "None reported"}
- Special Preferences / Requests: ${preferences || "Focus on optimal biomechanics, high stimulus-to-fatigue ratio, and joint longevity"}
- Iteration / Regeneration Count: ${regenerationCount}

${splitArchitectureGuide}
${previousPlanContext}

CRITICAL DIVERSITY & PROGRAMMING RULES:
1. EXERCISE DIVERSITY & NOVELTY:
   - Do NOT repeatedly prescribe the exact same generic exercises. Explore diverse, biomechanically superior exercise variations across movement patterns.
   - For Chest: Vary among flat barbell press, incline dumbbell press, weighted dips, incline smith press, low-to-high cable flyes, machine chest press, dumbbell floor press.
   - For Back: Vary among chest-supported T-bar rows, wide-grip lat pulldowns, neutral-grip pull-ups, single-arm dumbbell rows, meadows rows, seal rows, straight-arm pulldowns.
   - For Shoulders: Vary among seated dumbbell overhead press, standing barbell OHP, Arnold press, cable lateral raises, dumbbell lean-away lateral raises, face pulls with external rotation.
   - For Legs: Vary among high-bar barbell squats, front squats, hack squats, 45-degree leg press, Bulgarian split squats, Romanian deadlifts (RDL), seated leg curls, walking dumbbell lunges, barbell hip thrusts.
   - For Arms: Vary among incline dumbbell curls, EZ-bar preacher curls, hammer curls, cable Bayesian curls, overhead rope extensions, cross-body cable extensions, skull crushers.
   - NEVER repeat the exact same exercise name multiple times in the same weekly schedule.

2. GOAL & EXPERIENCE TUNING:
   - "Muscle Gain": 3-4 working sets, 8-12 reps (10-15 for isolation), 3-0-1-0 tempo, 75-90s rest, RPE 8-9 (1-2 RIR).
   - "Fat Loss": 3-4 working sets, 12-16 reps, 2-0-1-0 tempo, 45-60s rest intervals, higher metabolic density.
   - "Strength": 4-5 working sets on main compound lifts, 3-6 reps, 3-1-X-0 tempo, 120-180s rest, RPE 7.5-8.5.
   - "General Fitness": 3 sets, 8-12 reps, 60-75s rest, balanced multi-planar functional movements.
   - "Beginner": 4-5 exercises/day, 2-3 sets, foundational lifts, clear form cues.
   - "Intermediate": 5-6 exercises/day, 3-4 sets, double progression.
   - "Advanced": 6-7 exercises/day, 3-5 sets, high-tension stretch-mediated overload.

3. STRICT EQUIPMENT COMPLIANCE:
   - "Full Gym": Barbells, dumbbells, cables, selectorized machines, leg press, hack squat.
   - "Dumbbells": Dumbbells, adjustable bench, bodyweight ONLY. No barbells or cable machines.
   - "Home" / "Bodyweight": Calisthenics, bands, pull-up bar, bodyweight. No commercial gym machines.

4. "weeklySchedule" MUST contain an array of EXACTLY ${numDays} distinct day items (length = ${numDays}).

Return ONLY a valid JSON object matching this schema:
{
  "planName": "Descriptive plan title reflecting goal and split",
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
      temperature: 0.9,
    }, apiKey);

    if (result?.text) {
      const parsed = safeExtractJson(result.text);
      if (parsed && parsed.weeklySchedule && Array.isArray(parsed.weeklySchedule) && parsed.weeklySchedule.length > 0) {
        parsed.id = parsed.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        parsed.generationId = genId;
        parsed.requestId = effectiveRequestId;
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
