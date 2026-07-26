import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import RecipeCard from "../components/RecipeCard.jsx";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [maxMinutes, setMaxMinutes] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.q = search.trim();
    if (maxMinutes) params.maxMinutes = maxMinutes;

    // Small debounce so we don't fire a request on every keystroke
    const timeout = setTimeout(() => {
      api
        .listSavedRecipes(params)
        .then((data) => setRecipes(data.recipes))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, maxMinutes]);

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

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="field" style={{ flex: "2 1 220px", marginBottom: 0 }}>
          <label htmlFor="search">Search</label>
          <input
            id="search"
            placeholder="Search by title or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: "1 1 140px", marginBottom: 0 }}>
          <label htmlFor="maxMinutes">Max time (min)</label>
          <input
            id="maxMinutes"
            type="number"
            min="1"
            placeholder="Any"
            value={maxMinutes}
            onChange={(e) => setMaxMinutes(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-line">Loading...</p>}

      {!loading && recipes.length === 0 && !error && (
        <div className="empty-state">
          <span className="empty-icon">📖</span>
          {search || maxMinutes ? "No saved recipes match your filters." : "You haven't saved any recipes yet."}
        </div>
      )}

      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} onDelete={handleDelete} />
      ))}
    </div>
  );
}
