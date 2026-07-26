import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import { generateRecipes, detectIngredientsFromImage, generateWeeklyPlan } from "../services/aiService.js";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export async function generate(req, res) {
  try {
    const { ingredients, count } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "ingredients must be a non-empty array." });
    }

    const user = await User.findById(req.userId);
    const recipes = await generateRecipes({
      ingredients,
      dietaryPreferences: user?.dietaryPreferences || [],
      count: count || 3,
    });

    res.json({ recipes });
  } catch (err) {
    console.error("Recipe generation failed:", err);
    res.status(502).json({ error: "AI recipe generation failed.", details: err.message });
  }
}

export async function weeklyPlan(req, res) {
  try {
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "ingredients must be a non-empty array." });
    }

    const user = await User.findById(req.userId);
    const plan = await generateWeeklyPlan({
      ingredients,
      dietaryPreferences: user?.dietaryPreferences || [],
    });

    res.json(plan);
  } catch (err) {
    console.error("Weekly plan generation failed:", err);
    res.status(502).json({ error: "AI weekly plan generation failed.", details: err.message });
  }
}

export async function detectIngredients(req, res) {
  try {
    const { base64Image, mimeType } = req.body;

    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: "base64Image and mimeType are required." });
    }
    if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return res.status(400).json({ error: `Unsupported image type: ${mimeType}` });
    }

    const ingredients = await detectIngredientsFromImage({ base64Image, mimeType });
    res.json({ ingredients });
  } catch (err) {
    console.error("Ingredient detection failed:", err);
    res.status(502).json({ error: "AI ingredient detection failed.", details: err.message });
  }
}

export async function saveRecipe(req, res) {
  try {
    const recipe = await Recipe.create({ ...req.body, user: req.userId });
    res.status(201).json({ recipe });
  } catch (err) {
    res.status(500).json({ error: "Failed to save recipe.", details: err.message });
  }
}

export async function getRecipe(req, res) {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.userId });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipe.", details: err.message });
  }
}

export async function listSavedRecipes(req, res) {
  try {
    const { q, maxMinutes } = req.query;
    const filter = { user: req.userId };

    if (q) {
      // Case-insensitive search across title and both ingredient lists
      const regex = new RegExp(q, "i");
      filter.$or = [{ title: regex }, { usedIngredients: regex }, { missingIngredients: regex }];
    }
    if (maxMinutes) {
      filter.estimatedMinutes = { $lte: Number(maxMinutes) };
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved recipes.", details: err.message });
  }
}

export async function deleteRecipe(req, res) {
  try {
    const result = await Recipe.deleteOne({ _id: req.params.id, user: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recipe.", details: err.message });
  }
}
