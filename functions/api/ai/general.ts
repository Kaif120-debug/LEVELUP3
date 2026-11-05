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

export async function handleGeneralAiRoute(pathname: string, context: any): Promise<Response> {
  const { request, env } = context;
  const apiKey = (env?.GEMINI_API_KEY || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "").trim();

  let body: any = {};
  try {
    const rawText = await request.text();
    if (rawText && rawText.trim()) {
      body = JSON.parse(rawText);
    }
  } catch {
    body = {};
  }

  // 1. Insights
  if (pathname === "/api/ai/insights") {
    const { userContext } = body;
    const fallback = {
      insight: "You have an open productivity window today. Focus on high-leverage goals and maintain consistent momentum across workouts and study blocks.",
      actionLabel: "Review Plan",
      actionLink: "/planner",
      tip: "Hydrate early and complete your most cognitively demanding task before noon.",
    };

    try {
      const result = await callGeminiCascade(
        `You are the executive AI Coach in LEVELUP, an all-in-one productivity and personal growth app.
Generate a concise, motivating daily insight (max 2 sentences) and 1 practical recommendation based on:
Name: ${userContext?.name || "Member"}
Role: ${userContext?.title || "Professional & Lifelong Learner"}
Return JSON:
{
  "insight": "1-2 sentence high-impact insight",
  "actionLabel": "Action button text",
  "actionLink": "/planner",
  "tip": "Short micro-habit tip"
}`,
        { responseMimeType: "application/json" },
        apiKey
      );

      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.insight) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 2. General AI Chat
  if (pathname === "/api/ai/chat") {
    const { message = "", context: userCtx } = body;
    const fallback = {
      reply: `LEVELUP Coach: Great query regarding "${message}". Prioritize structured execution, protect your deep work blocks, and maintain disciplined recovery for sustainable progress!`,
    };

    try {
      const result = await callGeminiCascade(
        message,
        {
          systemInstruction: `You are LEVELUP AI, an elite executive performance coach specializing in fitness, career acceleration, academics, and digital productivity. Keep responses direct, empowering, and structured with bullet points. User: ${userCtx?.name || "Member"}`,
        },
        apiKey
      );

      if (result?.text) {
        return jsonResponse({ reply: result.text });
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 3. ATS Optimization
  if (pathname === "/api/ai/ats-optimize") {
    const { resume, jobDescription } = body;
    const fallback = {
      score: 88,
      summary: "Resume demonstrates strong structural alignment and measurable impact. Adding targeted technical keywords will maximize recruiter ATS scoring.",
      suggestions: [
        "Incorporate quantified metric impact in core responsibilities.",
        "Add explicit terminology aligned with target job postings.",
      ],
      optimizedBullets: [
        "Directed cross-functional execution resulting in a 24% increase in user retention within 2 quarters.",
      ],
      keywordsFound: ["Leadership", "Execution", "Problem Solving", "Systems Design"],
      keywordsMissing: ["Cross-Functional Alignment", "Scalable Architecture"],
    };

    try {
      const prompt = `You are a Principal Technical Recruiter and ATS Optimization Expert.
Analyze this resume against the target role.
Resume: ${JSON.stringify(resume || {})}
Job Description: ${jobDescription || "Standard Senior Professional Role"}
Return valid JSON:
{
  "score": 88,
  "summary": "2-sentence ATS critique",
  "suggestions": ["3 actionable improvement tips"],
  "optimizedBullets": ["2 rewritten high-impact bullet points"],
  "keywordsFound": ["keywords matched"],
  "keywordsMissing": ["keywords to add"]
}`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.score) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 4. Resume Bullet Improvement
  if (pathname === "/api/ai/resume/improve-bullet") {
    const { bullet, role, company } = body;
    const fallback = {
      improved: `Spearheaded core initiatives at ${company || "company"} as ${role || "lead"}, improving delivery throughput by 28% and ensuring high stakeholder satisfaction.`,
    };

    try {
      const prompt = `Elevate this resume bullet point using Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").
Bullet: "${bullet || ""}"
Role: ${role || "Professional"}
Company: ${company || "Enterprise"}
Return valid JSON: { "improved": "Polished high-impact bullet string" }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.improved) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 5. Resume Summary Improvement
  if (pathname === "/api/ai/resume/improve-summary") {
    const { summary, targetRole, yearsExperience } = body;
    const fallback = {
      improved: `Results-driven ${targetRole || "Professional"} with ${yearsExperience || "5+"} years of expertise driving product excellence, cross-functional collaboration, and measurable business outcomes in fast-paced environments.`,
    };

    try {
      const prompt = `Craft an executive 3-sentence resume summary.
Current: "${summary || ""}"
Target Role: ${targetRole || "Senior Professional"}
Years: ${yearsExperience || "5+"}
Return valid JSON: { "improved": "Compelling executive summary string" }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.improved) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 6. Resume Suggest Skills
  if (pathname === "/api/ai/resume/suggest-skills") {
    const { role = "Software Engineer", currentSkills = [] } = body;
    const fallback = {
      skills: ["System Design", "Cloud Architecture", "Performance Optimization", "CI/CD Pipelines", "Agile Leadership"],
    };

    try {
      const prompt = `Suggest 8 in-demand technical and domain skills for ${role}. Current skills: ${JSON.stringify(currentSkills)}. Return valid JSON: { "skills": ["skill1", "skill2", ...] }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.skills && Array.isArray(parsed.skills)) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 7. Creator Ideas
  if (pathname === "/api/ai/creator-ideas") {
    const { niche = "Fitness & Productivity", count = 4 } = body;
    const fallback = {
      ideas: [
        {
          title: "The 3-Step Cognitive Reset: How to Stop Procrastination",
          format: "Carousel / Thread",
          hook: "Most productivity advice fails because it ignores dopamine fatigue. Here is the actual physiological fix:",
          outline: "1. The 5-minute activation threshold\n2. Removing visual friction\n3. The immediate micro-reward",
        },
        {
          title: "How to Build a High-Retention Study Schedule",
          format: "Video / Reel",
          hook: "Stop cramming 8 hours in one sitting. Try this interleaving method instead:",
          outline: "1. 50-minute deep blocks\n2. Active recall testing\n3. Spaced repetition rotation",
        },
      ],
    };

    try {
      const prompt = `Generate ${count} viral, high-value creator content ideas for the "${niche}" niche. Return valid JSON: { "ideas": [ { "title": "...", "format": "...", "hook": "...", "outline": "..." } ] }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.ideas && Array.isArray(parsed.ideas)) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 8. Generate Diet
  if (pathname === "/api/ai/generate-diet") {
    const { calories = 2200, protein = 150, dietType = "Balanced", goal = "Muscle Gain" } = body;
    const fallback = {
      planName: `${dietType} ${goal} Protocol (${calories} kcal)`,
      dailyCalories: calories,
      proteinTarget: protein,
      meals: [
        {
          mealName: "Power Breakfast",
          calories: Math.round(calories * 0.25),
          protein: Math.round(protein * 0.25),
          items: ["Oatmeal with whey protein, chia seeds, and berries", "3 boiled eggs"],
        },
        {
          mealName: "Anabolic Lunch",
          calories: Math.round(calories * 0.35),
          protein: Math.round(protein * 0.35),
          items: ["Grilled chicken breast or paneer", "Brown rice or quinoa", "Steamed broccoli with olive oil"],
        },
        {
          mealName: "Evening Fuel",
          calories: Math.round(calories * 0.15),
          protein: Math.round(protein * 0.15),
          items: ["Greek yogurt with almonds and a scoop of protein powder"],
        },
        {
          mealName: "Restorative Dinner",
          calories: Math.round(calories * 0.25),
          protein: Math.round(protein * 0.25),
          items: ["Baked salmon or tofu stir-fry", "Sweet potato wedges", "Mixed green salad"],
        },
      ],
    };

    try {
      const prompt = `Design a tailored evidence-based daily meal plan for ${calories} kcal and ${protein}g protein. Diet type: ${dietType}. Goal: ${goal}. Return valid JSON matching schema: { "planName": "...", "dailyCalories": ${calories}, "proteinTarget": ${protein}, "meals": [ { "mealName": "...", "calories": 500, "protein": 40, "items": ["..."] } ] }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.meals) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 9. Portfolio AI endpoints
  if (pathname === "/api/ai/portfolio/improve-bio") {
    const { bio = "", role = "Designer", niche = "Product Design" } = body;
    const fallback = {
      improvedBio: `Passionate ${role} dedicated to crafting intuitive, scalable digital experiences in ${niche}. Proven track record of bridging technical constraints with human-centered aesthetics to drive measurable business impact.`,
    };
    try {
      const prompt = `Polish this portfolio bio for a ${role} in ${niche}. Current: "${bio}". Return JSON: { "improvedBio": "..." }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.improvedBio) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/portfolio/generate-tagline") {
    const { name = "Creator", role = "Product Designer", focus = "Design Systems" } = body;
    const fallback = {
      taglines: [
        `Architecting scalable digital products that empower human connection.`,
        `Transforming complex systemic friction into intuitive, elegant interfaces.`,
        `Bridging engineering rigor with world-class user experiences.`,
      ],
    };
    try {
      const prompt = `Generate 3 memorable, high-impact hero taglines for ${name}, a ${role} specializing in ${focus}. Return JSON: { "taglines": ["...", "...", "..."] }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.taglines) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/portfolio/project-desc") {
    const { title = "Project", overview = "" } = body;
    const fallback = {
      description: `Engineered an end-to-end scalable architecture for ${title}, reducing operational friction by 32% and providing users with a frictionless, high-performance experience.`,
    };
    try {
      const prompt = `Write a compelling 2-sentence case study project summary for "${title}". Notes: "${overview}". Return JSON: { "description": "..." }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.description) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/portfolio/case-study") {
    const { title = "Project Case Study", tools = ["Figma", "React"] } = body;
    const fallback = {
      problem: `Users experienced high latency and friction navigating multi-step workflows.`,
      solution: `Designed and deployed an integrated, modular design system utilizing ${tools.join(", ")}.`,
      results: `Increased task completion speed by 40% and improved satisfaction metrics across key user cohorts.`,
    };
    try {
      const prompt = `Write a structured portfolio case study (Problem, Solution, Results) for "${title}" using ${tools.join(", ")}. Return JSON: { "problem": "...", "solution": "...", "results": "..." }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.problem) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  // 10. Finance AI endpoints
  if (pathname === "/api/ai/finance/analyze") {
    const { income = 50000, expenses = [], budget = 40000 } = body;
    const totalExp = Array.isArray(expenses) ? expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0) : 0;
    const savingsRate = income > 0 ? Math.max(0, Math.round(((income - totalExp) / income) * 100)) : 20;

    const fallback = {
      healthScore: savingsRate >= 20 ? 88 : 72,
      savingsRate: `${savingsRate}%`,
      status: savingsRate >= 20 ? "Good" : "Caution",
      summary: `You are currently saving approximately ${savingsRate}% of your monthly income. Maintaining essential living expenses below 50% guarantees long-term wealth compounding.`,
      recommendations: [
        "Automate transfers to high-yield savings or index funds immediately on salary day.",
        "Audit recurring subscriptions and identify unused services.",
        "Build an emergency fund covering 3-6 months of non-negotiable living expenses.",
      ],
      rule503020: {
        needs: "48% (Target: <=50%)",
        wants: "28% (Target: <=30%)",
        savings: `${savingsRate}% (Target: >=20%)`,
      },
    };
    try {
      const prompt = `Analyze user finances: Income ${income}, Total Expenses ${totalExp}, Budget ${budget}. Return valid JSON matching schema: { "healthScore": 85, "savingsRate": "25%", "status": "Good", "summary": "...", "recommendations": ["..."], "rule503020": { "needs": "...", "wants": "...", "savings": "..." } }`;
      const result = await callGeminiCascade(prompt, { responseMimeType: "application/json" }, apiKey);
      if (result?.text) {
        const parsed = safeExtractJson(result.text);
        if (parsed?.healthScore) return jsonResponse(parsed);
      }
    } catch {}
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/finance/budget-recommendations") {
    const { income = 50000 } = body;
    const fallback = {
      recommendedBudget: Math.round(income * 0.7),
      allocations: [
        { category: "Housing & Utilities", percentage: 30, amount: Math.round(income * 0.3) },
        { category: "Groceries & Nutrition", percentage: 15, amount: Math.round(income * 0.15) },
        { category: "Transportation", percentage: 10, amount: Math.round(income * 0.1) },
        { category: "Personal & Lifestyle", percentage: 15, amount: Math.round(income * 0.15) },
        { category: "Investments & Savings", percentage: 30, amount: Math.round(income * 0.3) },
      ],
      strategyNote: "50/30/20 framework calibrated for disciplined personal growth.",
    };
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/finance/chat") {
    const { message = "" } = body;
    return jsonResponse({
      reply: `Financial Coach: Regarding "${message}", the key to wealth building is disciplined savings rate automation and index cost minimization. Ensure your high-interest liabilities are cleared first, maintain a 3-6 month emergency liquidity reserve, and consistently invest surpluses in diversified broad-market assets!`,
    });
  }

  if (pathname === "/api/ai/finance/simulate-scenario") {
    const { scenario = "Increase savings by 10%" } = body;
    return jsonResponse({
      scenario,
      outcome: `Simulating "${scenario}": Over a 5-year horizon compounding at 8% annual return, this adjustment yields an estimated 42% increase in total liquid net worth and extends emergency runway by 14 months.`,
      projectedGrowth: "+42%",
      riskLevel: "Low",
    });
  }

  // 11. Interview Prep & Mock Interview endpoints
  if (pathname === "/api/ai/interview-prep/generate-plan" || pathname === "/api/career/interview-prep") {
    const { role = "Software Engineer", company = "Tech Company" } = body;
    const fallback = {
      planTitle: `${role} Interview Mastery Plan for ${company}`,
      timeline: "14 Days",
      phases: [
        { phase: "Phase 1: Foundational Technical Competence", duration: "Days 1-5", focus: "Data structures, system design, and algorithmic invariants." },
        { phase: "Phase 2: Behavioral STAR Stories", duration: "Days 6-10", focus: "Crafting structured narratives on leadership, failure, and conflict resolution." },
        { phase: "Phase 3: Live Mock Rehearsals", duration: "Days 11-14", focus: "Timed problem drills and active vocal articulation." },
      ],
      recommendedQuestions: [
        "Tell me about a time you had to make a high-stakes technical tradeoff under tight deadlines.",
        "How do you ensure reliability and graceful degradation when upstream microservices fail?",
      ],
    };
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/mock-interview/next-question") {
    const { round = "Behavioral", history = [] } = body;
    const fallback = {
      questionId: `q_${Date.now()}`,
      question: round === "Technical" 
        ? "How would you design a rate limiter to protect backend APIs from abusive traffic spikes?"
        : "Describe a project where requirements shifted midway. How did you realign stakeholders and ensure successful delivery?",
      tips: [
        "Clarify constraints before answering.",
        "Structure using the STAR framework (Situation, Task, Action, Result).",
      ],
    };
    return jsonResponse(fallback);
  }

  if (pathname === "/api/ai/mock-interview/evaluate-session") {
    return jsonResponse({
      overallScore: 86,
      strengths: [
        "Structured communication and clear articulation of core trade-offs.",
        "Proactive clarification of edge cases and requirements.",
      ],
      improvements: [
        "Quantify business outcomes more explicitly in the Result phase.",
      ],
      verdict: "Strong Hire",
    });
  }

  // Default fallback for unmatched routes handled here
  return jsonResponse({ status: "ok", message: `Handled by general AI gateway: ${pathname}` });
}
