import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import RecipeCard from "../components/RecipeCard.jsx";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listSavedRecipes()
      .then((data) => setRecipes(data.recipes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (recipe) => {
    try {
      await api.deleteRecipe(recipe._id);
      setRecipes((prev) => prev.filter((r) => r._id !== recipe._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ paddingTop: 44 }}>
      <span className="eyebrow">Your recipe box</span>
      <h1>Saved recipes</h1>
      <p className="subtitle">Everything you've kept for later, in one place.</p>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-line">Loading...</p>}

      {!loading && recipes.length === 0 && !error && (
        <div className="empty-state">You haven't saved any recipes yet.</div>
      )}

      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} onDelete={handleDelete} />
      ))}
    </div>
  );
}
