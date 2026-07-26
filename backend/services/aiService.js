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
      "servings": number,
      "nutrition": {
        "caloriesPerServing": number,
        "proteinGrams": number,
        "carbsGrams": number,
        "fatGrams": number
      }
    }
  ]
}

Nutrition values are per single serving, and should be your best realistic estimate
given typical ingredient quantities for a home-cooked version of the dish — they don't
need to be lab-precise, just plausible and consistent with the recipe.`;

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

/**
 * Generates a full week's worth of dinner suggestions plus a single
 * consolidated shopping list across all 7 days (deduplicated, so an
 * ingredient needed by 3 recipes appears once, not 3 times).
 */
export async function generateWeeklyPlan({ ingredients, dietaryPreferences = [] }) {
  const prefsText = dietaryPreferences.length
    ? `The user follows these dietary preferences: ${dietaryPreferences.join(", ")}. Every recipe must respect them.`
    : "The user has no specific dietary restrictions.";

  const systemPrompt = `You are a weekly meal-planning engine for a meal-planning app.
Given ingredients a user already has, plan 7 dinners (Monday through Sunday),
using the on-hand ingredients where reasonable, and vary the recipes so the
week doesn't repeat the same dish or cuisine every day.
${prefsText}

Also produce ONE consolidated shopping list covering every ingredient needed
across all 7 days that the user does NOT already have — deduplicated, so if
3 recipes need onions, "onions" appears once in the shopping list, not three times.

Respond with ONLY valid JSON, no markdown code fences, no explanation text before or after.
The JSON must match this exact shape:

{
  "days": [
    {
      "day": "Monday",
      "title": "string",
      "description": "one sentence description",
      "estimatedMinutes": number,
      "servings": number
    }
  ],
  "shoppingList": ["ingredient", "ingredient", ...]
}

"days" must have exactly 7 entries, one per day of the week, in order starting Monday.`;

  const userMessage = `Ingredients I have: ${ingredients.join(", ")}.`;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      maxOutputTokens: 3000,
    },
  });

  return parseWeeklyPlanJSON(response.text);
}

export function parseWeeklyPlanJSON(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.days)) {
    throw new Error("AI response did not contain a 'days' array.");
  }
  if (!Array.isArray(parsed.shoppingList)) {
    throw new Error("AI response did not contain a 'shoppingList' array.");
  }

  return parsed;
}
/**
 * Detects food ingredients visible in a photo (e.g. a fridge or pantry shot)
 * using Gemini's multimodal vision input. Returns a flat array of ingredient
 * name strings, ready to merge into the user's ingredient list.
 */
export async function detectIngredientsFromImage({ base64Image, mimeType }) {
  const prompt = `Look at this photo of food/ingredients (e.g. a fridge, pantry, or counter).
List every distinct food ingredient you can clearly identify.

Respond with ONLY valid JSON, no markdown code fences, no explanation text before or after.
The JSON must match this exact shape:

{ "ingredients": ["ingredient name", "ingredient name", ...] }

Use simple, common ingredient names (e.g. "eggs", "spinach", "milk"), lowercase,
no quantities or brand names. If you can't confidently identify anything, return an empty array.`;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Image } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 500,
    },
  });

  return parseIngredientsJSON(response.text);
}

export function parseIngredientsJSON(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.ingredients)) {
    throw new Error("AI response did not contain an 'ingredients' array.");
  }

  // Normalize: trim, lowercase, drop empties/duplicates
  const seen = new Set();
  return parsed.ingredients
    .map((item) => String(item).trim().toLowerCase())
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}
