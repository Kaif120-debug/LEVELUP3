import { callGeminiCascade } from "../gemini-helper";

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));

    const {
      age = 25,
      gender = "Male",
      height = 175, // cm
      weight = 75, // kg
      targetWeight,
      goal = "Muscle Gain",
      activityLevel = "Moderately Active",
      trainingFrequency = "4-5 days/week",
      dietaryPreference = "High Protein",
    } = body;

    const ageNum = Math.max(14, Math.min(90, Number(age) || 25));
    const heightNum = Math.max(120, Math.min(250, Number(height) || 175));
    const weightNum = Math.max(35, Math.min(250, Number(weight) || 75));
    const targetWeightNum = targetWeight ? Number(targetWeight) : undefined;

    // Mathematical baseline calculations (Mifflin-St Jeor Equation)
    let bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum);
    if (gender?.toLowerCase().startsWith("f")) {
      bmr -= 161;
    } else {
      bmr += 5;
    }
    bmr = Math.round(bmr);

    let activityMultiplier = 1.55; // default moderate
    const actLower = (activityLevel || "").toLowerCase();
    if (actLower.includes("sedentary")) activityMultiplier = 1.2;
    else if (actLower.includes("light")) activityMultiplier = 1.375;
    else if (actLower.includes("mod")) activityMultiplier = 1.55;
    else if (actLower.includes("very") || actLower.includes("high")) activityMultiplier = 1.725;
    else if (actLower.includes("extra") || actLower.includes("athlete")) activityMultiplier = 1.9;

    const tdee = Math.round(bmr * activityMultiplier);

    // Goal adjustment
    let calorieDelta = 0;
    let deltaType: "Surplus" | "Deficit" | "Maintenance" = "Maintenance";
    const goalLower = (goal || "").toLowerCase();

    if (goalLower.includes("gain") || goalLower.includes("bulk") || goalLower.includes("hypertrophy")) {
      calorieDelta = 300; // Lean surplus
      deltaType = "Surplus";
    } else if (goalLower.includes("loss") || goalLower.includes("cut") || goalLower.includes("lean")) {
      calorieDelta = -450; // Sustainable deficit
      deltaType = "Deficit";
    }

    const calculatedCalories = Math.max(1200, tdee + calorieDelta);

    // Protein target calculation (~2.0 - 2.2g per kg bodyweight for gain/loss, ~1.8g for maintenance)
    let proteinPerKg = 2.0;
    if (deltaType === "Deficit") proteinPerKg = 2.2; // Higher protein in deficit to preserve lean mass
    else if (deltaType === "Surplus") proteinPerKg = 2.0;
    else proteinPerKg = 1.8;

    const calculatedProtein = Math.round(weightNum * proteinPerKg);
    const proteinCalories = calculatedProtein * 4;

    // Fat target calculation (~25% of total calories or ~0.9g/kg)
    const calculatedFat = Math.max(40, Math.round((calculatedCalories * 0.25) / 9));
    const fatCalories = calculatedFat * 9;

    // Remaining calories to Carbohydrates
    const remainingCaloriesForCarbs = Math.max(50 * 4, calculatedCalories - (proteinCalories + fatCalories));
    const calculatedCarbs = Math.round(remainingCaloriesForCarbs / 4);

    const fallbackCalculation = {
      dailyCalories: calculatedCalories,
      proteinGrams: calculatedProtein,
      carbsGrams: calculatedCarbs,
      fatGrams: calculatedFat,
      bmr,
      tdee,
      surplusDeficit: {
        type: deltaType,
        amount: Math.abs(calorieDelta),
        percentage: Math.round((Math.abs(calorieDelta) / tdee) * 100) || 0,
        rationale: deltaType === "Surplus"
          ? `A controlled lean surplus of +${calorieDelta} kcal optimizes muscle protein synthesis while minimizing adipose fat accumulation.`
          : deltaType === "Deficit"
          ? `A moderate deficit of ${calorieDelta} kcal (~18% under TDEE) maximizes adipose fat oxidation while sparing skeletal muscle mass.`
          : `Maintenance calorie intake matches your daily energy expenditure to preserve body composition while improving workout performance.`,
      },
      macroRatioPercentages: {
        protein: Math.round((proteinCalories / calculatedCalories) * 100),
        carbs: Math.round(((calculatedCarbs * 4) / calculatedCalories) * 100),
        fat: Math.round((fatCalories / calculatedCalories) * 100),
      },
      rationale: `Based on your profile (${weightNum}kg, ${heightNum}cm, ${ageNum}y, ${activityLevel}, ${trainingFrequency}), your Basal Metabolic Rate is ${bmr} kcal and estimated TDEE is ${tdee} kcal. For ${goal}, we calibrated a ${deltaType.toLowerCase()} of ${Math.abs(calorieDelta)} kcal, targeting ${proteinPerKg}g protein per kg of bodyweight (${calculatedProtein}g) to support ${goal.toLowerCase()} with high fidelity.`,
      mealTimingAdvice: [
        {
          timing: "Pre-Workout (60–90 min before)",
          recommendation: `Consume 30–40g complex carbs + 25–30g lean protein`,
          rationale: "Maximizes muscle glycogen availability and prevents workout-induced muscle catabolism.",
        },
        {
          timing: "Post-Workout (Within 2 hours)",
          recommendation: `Consume 30–40g fast-digesting protein + 40–60g carbohydrates`,
          rationale: "Triggers mTOR activation and replenishes depleted intramuscular glycogen stores.",
        },
        {
          timing: "Even Distribution Across Meals",
          recommendation: `Distribute ~${Math.round(calculatedProtein / 4)}g protein across 3–4 meals throughout the day`,
          rationale: "Sustains elevated muscle protein synthesis (MPS) rates continuously.",
        },
      ],
      foodSources: {
        protein: ["Chicken breast", "Liquid egg whites", "Whey isolate", "Greek yogurt", "Tofu / Paneer", "White fish"],
        carbs: ["Jasmine & basmati rice", "Oats", "Sweet potatoes", "Whole grain sourdough", "Quinoa", "Fresh berries"],
        fat: ["Extra virgin olive oil", "Avocados", "Raw almonds & walnuts", "Chia & flax seeds", "Egg yolks"],
      },
      adjustmentGuidelines: "Track your average morning weight across 14 days. If weight does not trend in the expected direction by 0.25–0.5% bodyweight per week, adjust daily calories by ±150–200 kcal while keeping protein static.",
    };

    const prompt = `You are the Principal Sports Dietitian and Metabolic Physiologist for LEVELUP.
Calculate and scientifically explain the exact macronutrient and caloric blueprint for this athlete:

USER PROFILE:
- Age: ${ageNum} years
- Gender: ${gender}
- Height: ${heightNum} cm
- Current Weight: ${weightNum} kg
${targetWeightNum ? `- Target Weight: ${targetWeightNum} kg` : ""}
- Fitness Goal: ${goal}
- Activity Level: ${activityLevel}
- Training Frequency: ${trainingFrequency}
- Dietary Preference: ${dietaryPreference}

CALCULATION STANDARDS:
1. Basal Metabolic Rate (BMR): Compute using Mifflin-St Jeor equation.
2. Total Daily Energy Expenditure (TDEE): Apply activity multiplier.
3. Goal Calorie Target:
   - Muscle Gain: +250 to +400 kcal lean surplus.
   - Fat Loss: -400 to -600 kcal sustainable deficit.
   - Maintenance: TDEE.
4. Protein Target: 1.8g to 2.4g per kg bodyweight based on goal.
5. Fat Target: 20% to 30% of total calories.
6. Carbohydrate Target: Remaining calories (4 kcal/g).
7. Tailor food source recommendations strictly to the dietary preference: "${dietaryPreference}".

Return ONLY a valid JSON object matching this exact schema:
{
  "dailyCalories": 2450,
  "proteinGrams": 165,
  "carbsGrams": 270,
  "fatGrams": 65,
  "bmr": 1720,
  "tdee": 2250,
  "surplusDeficit": {
    "type": "Surplus",
    "amount": 200,
    "percentage": 9,
    "rationale": "Clear scientific explanation of this surplus/deficit"
  },
  "macroRatioPercentages": {
    "protein": 27,
    "carbs": 44,
    "fat": 29
  },
  "rationale": "Comprehensive breakdown explaining how BMR, TDEE, protein multiplier, and energy split were calculated for this user",
  "mealTimingAdvice": [
    {
      "timing": "Pre-Workout (60-90m)",
      "recommendation": "Specific food/macro guidance",
      "rationale": "Physiological rationale"
    },
    {
      "timing": "Post-Workout",
      "recommendation": "Specific food/macro guidance",
      "rationale": "Physiological rationale"
    },
    {
      "timing": "Daily Spacing",
      "recommendation": "Even protein feedings",
      "rationale": "MPS explanation"
    }
  ],
  "foodSources": {
    "protein": ["Food 1", "Food 2", "Food 3", "Food 4"],
    "carbs": ["Food 1", "Food 2", "Food 3", "Food 4"],
    "fat": ["Food 1", "Food 2", "Food 3", "Food 4"]
  },
  "adjustmentGuidelines": "Actionable rules for when and how to adjust macros after 2-3 weeks of weight progress"
}`;

    const geminiRes = await callGeminiCascade(
      prompt,
      {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
      env?.GEMINI_API_KEY
    );

    if (geminiRes?.text) {
      try {
        let cleanText = geminiRes.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText);
        if (parsed.dailyCalories && parsed.proteinGrams) {
          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (parseErr) {
        console.warn("[Macro Coach Calculate] Parse error, using fallback:", parseErr);
      }
    }

    return new Response(JSON.stringify(fallbackCalculation), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[Macro Coach Calculate Error]:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to calculate macros" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
