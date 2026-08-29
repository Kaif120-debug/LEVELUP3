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
      userMessage = "",
      profileContext = {},
      chatHistory = [],
    } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing required userMessage string" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const {
      age = 25,
      gender = "User",
      height = 175,
      weight = 75,
      targetWeight,
      goal = "Muscle Gain",
      activityLevel = "Moderately Active",
      trainingFrequency = "4-5 days/week",
      dietaryPreference = "High Protein",
      dailyCalories = 2450,
      proteinGrams = 165,
      carbsGrams = 270,
      fatGrams = 65,
      surplusDeficit = { type: "Surplus", amount: 250 },
      bmr = 1720,
      tdee = 2200,
    } = profileContext;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.slice(-6).map((msg: any) => `${msg.role === "assistant" ? "Macro Coach" : "User"}: ${msg.content}`).join("\n")
      : "";

    const systemInstruction = `You are LEVELUP's elite AI Macro & Sports Nutrition Coach.
You provide precise, science-backed, practical, and highly personalized nutrition advice.

CRITICAL COACHING RULES:
1. ALWAYS anchor your advice directly to the user's specific calculated targets and profile:
   - Current Weight: ${weight} kg ${targetWeight ? `(Target: ${targetWeight} kg)` : ""}
   - Fitness Goal: ${goal}
   - Daily Calories: ${dailyCalories} kcal (${surplusDeficit.type || "Goal"}: ${surplusDeficit.amount ? `${surplusDeficit.amount} kcal` : "aligned with TDEE"})
   - Daily Protein Target: ${proteinGrams} g (~${(proteinGrams / weight).toFixed(1)}g/kg)
   - Daily Carbohydrates: ${carbsGrams} g
   - Daily Fats: ${fatGrams} g
   - BMR: ${bmr} kcal | TDEE: ${tdee} kcal
   - Dietary Preference: ${dietaryPreference}
   - Training Frequency: ${trainingFrequency} | Activity Level: ${activityLevel}

2. When the user asks common questions, provide direct, actionable answers:
   - If asked "How much protein should I eat today?": State their exact target (${proteinGrams}g) and give a practical breakdown across their daily meals.
   - If asked "What should I eat to hit my protein goal?": Recommend exact whole-food portions conforming to ${dietaryPreference} (e.g. "150g chicken breast (~45g protein), 200g Greek yogurt (~20g protein), 1 scoop whey (~25g protein)").
   - If asked "I have X calories left, what can I eat?": Give 2-3 specific meal/snack recipes with approximate macro breakdowns matching the remaining energy.
   - If asked "How should I adjust my macros if my weight changes?": Explain the progressive adjustment protocol (e.g. track 7-14 day moving average weight; adjust calories by ±150-200 kcal if stalling).
   - If asked about pre/post workout nutrition, timing, or supplements (Creatine, Whey, Electrolytes): Give concise, evidence-based recommendations.

3. Formatting:
   - Use clean, structured Markdown (bold headers, concise bullet points, bold key numbers).
   - Keep answers conversational, authoritative, and direct.
   - Avoid generic fluff.`;

    const prompt = `${formattedHistory ? `RECENT CONVERSATION:\n${formattedHistory}\n\n` : ""}USER QUESTION:
"${userMessage}"

Provide your structured coaching response followed by 2-3 recommended follow-up questions for the athlete.
Return a JSON object with this schema:
{
  "answer": "Your comprehensive, formatted markdown coaching answer",
  "suggestedFollowUps": [
    "Suggested question 1",
    "Suggested question 2",
    "Suggested question 3"
  ]
}`;

    const geminiRes = await callGeminiCascade(
      prompt,
      {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
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
        if (parsed.answer) {
          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (parseErr) {
        console.warn("[Macro Coach Chat] Parse error:", parseErr);
      }
    }

    // Procedural Fallback if API is momentarily unreachable
    let fallbackAnswer = `Based on your profile (${weight}kg, ${goal}), your daily target is **${dailyCalories} kcal** with **${proteinGrams}g Protein**, **${carbsGrams}g Carbs**, and **${fatGrams}g Fats**.`;
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes("how much protein") || msgLower.includes("protein today")) {
      fallbackAnswer = `### Daily Protein Target: **${proteinGrams}g**\n\nFor your bodyweight of **${weight} kg** and your goal of **${goal}**, optimal muscle protein synthesis occurs at ~**${(proteinGrams / weight).toFixed(1)}g per kg**.\n\n**Recommended Daily Distribution:**\n- **Breakfast:** ~${Math.round(proteinGrams * 0.25)}g protein (e.g. 3 eggs + 100g egg whites or protein oats)\n- **Lunch:** ~${Math.round(proteinGrams * 0.3)}g protein (e.g. 150g chicken breast or paneer/tofu)\n- **Pre/Post-Workout:** ~${Math.round(proteinGrams * 0.2)}g protein (e.g. whey shake or Greek yogurt)\n- **Dinner:** ~${Math.round(proteinGrams * 0.25)}g protein (e.g. salmon, lean beef, or lentil dal)`;
    } else if (msgLower.includes("what should i eat") || msgLower.includes("hit my protein")) {
      fallbackAnswer = `### High-Protein Whole Food Recommendations (${dietaryPreference}):\n\nTo reach your **${proteinGrams}g daily protein target**, combine these high-yield staples:\n\n1. **Lean Animal / Dairy Sources:**\n   - **Chicken Breast:** 31g protein per 100g cooked (~165 kcal)\n   - **Liquid Egg Whites:** 11g protein per 100g (~52 kcal)\n   - **Non-Fat Greek Yogurt:** 10–12g protein per 100g (~60 kcal)\n   - **Whey / Plant Isolate:** 24–27g protein per scoop (~120 kcal)\n\n2. **Plant / Vegetarian Sources:**\n   - **Tofu / Tempeh:** 15–20g protein per 100g\n   - **Low-Fat Paneer:** 18–20g protein per 100g\n   - **Cooked Lentils / Chickpeas:** 9g protein per 100g\n\n*Combine 2–3 of these across your main meals to easily hit your daily goal!*`;
    } else if (msgLower.includes("calories left") || msgLower.includes("left")) {
      fallbackAnswer = `### Quick Fuel Options for Remaining Calories:\n\nHere are 3 quick meals based on your macro balance:\n\n1. **High-Protein Option (~350 kcal | 35g Protein, 20g Carbs, 5g Fat):**\n   - 200g Greek yogurt with 1 scoop protein powder & a handful of berries.\n\n2. **Balanced Snack (~400 kcal | 25g Protein, 45g Carbs, 10g Fat):**\n   - 2 slices whole grain sourdough + 3 scrambled eggs or 100g smoked salmon.\n\n3. **Quick Recovery Bowl (~500 kcal | 40g Protein, 60g Carbs, 8g Fat):**\n   - 150g grilled chicken or tofu + 150g jasmine rice + steamed green veggies.`;
    } else if (msgLower.includes("adjust") || msgLower.includes("weight changes")) {
      fallbackAnswer = `### Macro Adjustment Protocol:\n\n1. **Track 14-Day Rolling Average:** Weigh yourself daily in the morning after using the bathroom, and calculate the weekly average.\n2. **If Gaining Too Fast (>0.5% bodyweight/week on Muscle Gain):** Reduce carbs by 25g (-100 kcal) while keeping protein at **${proteinGrams}g**.\n3. **If Weight Stalls for 2 Consecutive Weeks on Fat Loss:** Reduce daily calories by 150–200 kcal (primarily from carbs/fats).\n4. **If Feeling Fatigued in the Gym:** Increase pre-workout carbs by 20–30g on heavy training days.`;
    }

    return new Response(
      JSON.stringify({
        answer: fallbackAnswer,
        suggestedFollowUps: [
          "How should I structure my pre-workout meal?",
          "What are good low-fat protein sources?",
          "How many meals per day is best for hypertrophy?",
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("[Macro Coach Chat Error]:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process chat message" }),
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
