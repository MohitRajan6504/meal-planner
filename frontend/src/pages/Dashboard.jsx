import { useState } from "react";
import { api } from "../api/client.js";
import IngredientInput from "../components/IngredientInput.jsx";
import RecipeCard from "../components/RecipeCard.jsx";

export default function Dashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError("");
    setRecipes([]);
    try {
      const data = await api.generateRecipes({ ingredients, count: 3 });
      setRecipes(data.recipes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipe) => {
    try {
      const data = await api.saveRecipe(recipe);
      setSavedIds((prev) => new Set(prev).add(recipe.title));
      void data;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ paddingTop: 44 }}>
      <span className="eyebrow">What's in the pantry?</span>
      <h1>Turn what you have into dinner</h1>
      <p className="subtitle">
        Add the ingredients sitting in your fridge or pantry. We'll suggest recipes that use most of
        them, and flag anything you'd still need to buy.
      </p>

      <IngredientInput ingredients={ingredients} onChange={setIngredients} />

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={handleGenerate} disabled={loading || ingredients.length === 0}>
          {loading ? "Thinking..." : "Suggest recipes"}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        {loading && <p className="loading-line">Asking the AI chef for ideas...</p>}

        {!loading && recipes.length === 0 && !error && (
          <div className="empty-state">
            Add a few ingredients above and hit "Suggest recipes" to get started.
          </div>
        )}

        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.title}
            recipe={recipe}
            onSave={handleSave}
            saved={savedIds.has(recipe.title)}
          />
        ))}
      </div>
    </div>
  );
}
