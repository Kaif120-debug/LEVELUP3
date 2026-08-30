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

// Robust JSON extraction helper that handles markdown code fences, comments, and unescaped newlines
export function safeExtractJson(text: string): any {
  if (!text) return null;
  let clean = text.trim();
  
  // Strip markdown code fences if present
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Try direct parse first
  try {
    return JSON.parse(clean);
  } catch {
    // If direct parse fails, isolate the outermost balanced JSON object
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = clean.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonSub);
      } catch {
        // Strip trailing commas before closing braces/brackets
        const noTrailingCommas = jsonSub.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(noTrailingCommas);
        } catch {
          // Try regex match for json code block if present inside text
          const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              return JSON.parse(codeBlockMatch[1].trim());
            } catch {
              const cleanedBlock = codeBlockMatch[1].trim().replace(/,\s*([}\]])/g, '$1');
              try {
                return JSON.parse(cleanedBlock);
              } catch {
                // Ignore
              }
            }
          }
        }
      }
    }
  }
  return null;
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
