import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import { generateRecipes } from "../services/aiService.js";

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

export async function saveRecipe(req, res) {
  try {
    const recipe = await Recipe.create({ ...req.body, user: req.userId });
    res.status(201).json({ recipe });
  } catch (err) {
    res.status(500).json({ error: "Failed to save recipe.", details: err.message });
  }
}

export async function listSavedRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ user: req.userId }).sort({ createdAt: -1 });
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
