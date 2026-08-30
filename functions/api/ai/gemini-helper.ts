/**
 * Universal Gemini API Cascade Helper
 * Compatible with Cloudflare Workers, Cloudflare Pages, Node.js, and Express.
 */

export interface GeminiCascadeOptions {
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}

export interface GeminiCascadeResult {
  text: string;
  modelUsed: string;
}

export async function callGeminiCascade(
  contents: string,
  options?: GeminiCascadeOptions,
  envKey?: string
): Promise<GeminiCascadeResult | null> {
  const apiKey = (
    envKey ||
    (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
    ""
  ).trim();

  if (!apiKey) {
    console.warn("[Gemini Helper] No GEMINI_API_KEY found in environment.");
    return null;
  }

  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: contents }],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
        },
      };

      if (options?.responseMimeType) {
        payload.generationConfig.responseMimeType = options.responseMimeType;
      }

      if (options?.systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "levelup-workout-builder",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`[Gemini Helper] Model ${model} returned ${response.status}: ${errorBody}`);
        continue;
      }

      const data: any = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText && generatedText.trim()) {
        return {
          text: generatedText.trim(),
          modelUsed: model,
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini Helper] Error with model ${model}:`, err?.message);
    }
  }

  return null;
}
