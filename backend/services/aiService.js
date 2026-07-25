import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-flash-latest"; // Google's rolling alias — always points to their current recommended fast model, avoiding version-deprecation breakage

/**
 * Generates recipe suggestions from a list of ingredients the user has on hand.
 * Returns structured JSON: an array of recipe objects.
 *
 * We ask the model to return ONLY JSON (no prose, no markdown fences) and set
 * responseMimeType to "application/json" so Gemini constrains its own output,
 * so the response can be parsed directly and rendered as real UI components
 * rather than dumped as raw AI text.
 */
export async function generateRecipes({ ingredients, dietaryPreferences = [], count = 3 }) {
  const prefsText = dietaryPreferences.length
    ? `The user follows these dietary preferences: ${dietaryPreferences.join(", ")}. Every recipe must respect them.`
    : "The user has no specific dietary restrictions.";

  const systemPrompt = `You are a recipe generation engine for a meal-planning app.
Given a list of ingredients a user already has, suggest realistic, cookable recipes
that use as many of those ingredients as possible.
${prefsText}

Respond with ONLY valid JSON, no markdown code fences, no explanation text before or after.
The JSON must match this exact shape:

{
  "recipes": [
    {
      "title": "string",
      "description": "one sentence, appetizing but plain description",
      "usedIngredients": ["ingredient the user already has", ...],
      "missingIngredients": ["ingredient the user needs to buy", ...],
      "steps": ["step 1", "step 2", ...],
      "estimatedMinutes": number,
      "servings": number
    }
  ]
}`;

  const userMessage = `Ingredients I have: ${ingredients.join(", ")}.
Suggest ${count} different recipes.`;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
    },
  });

  const rawText = response.text;
  return parseRecipeJSON(rawText);
}

export function parseRecipeJSON(rawText) {
  // Defensive parsing: even with JSON mode enabled, strip any stray markdown
  // fences before parsing, since some models still wrap output in them.
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.recipes)) {
    throw new Error("AI response did not contain a 'recipes' array.");
  }

  return parsed.recipes;
}
