import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getRecipe(id)
      .then((data) => setRecipe(data.recipe))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.deleteRecipe(id);
      navigate("/saved");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <p className="loading-line" style={{ marginTop: 44 }}>
        Loading recipe...
      </p>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-banner" style={{ marginTop: 44 }}>
        {error || "Recipe not found."}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 44, maxWidth: 640 }}>
      <Link to="/saved" className="eyebrow" style={{ display: "inline-block", marginBottom: 16 }}>
        ← Back to saved recipes
      </Link>

      <span className="recipe-meta">
        {recipe.estimatedMinutes ? `${recipe.estimatedMinutes} min` : ""}
        {recipe.estimatedMinutes && recipe.servings ? " · " : ""}
        {recipe.servings ? `Serves ${recipe.servings}` : ""}
      </span>
      <h1>{recipe.title}</h1>
      {recipe.description && <p className="subtitle">{recipe.description}</p>}

      <div className="tag-row" style={{ marginBottom: 24 }}>
        {(recipe.usedIngredients || []).map((item) => (
          <span className="tag" key={`used-${item}`}>
            {item}
          </span>
        ))}
        {(recipe.missingIngredients || []).map((item) => (
          <span className="tag missing" key={`missing-${item}`}>
            + {item}
          </span>
        ))}
      </div>

      {recipe.steps?.length > 0 && (
        <div className="recipe-card">
          <h2 style={{ fontSize: "1.1rem" }}>Steps</h2>
          <ol>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          {recipe.nutrition && (
            <div className="nutrition-row">
              {recipe.nutrition.caloriesPerServing != null && (
                <span className="nutrition-stat">
                  <strong>{recipe.nutrition.caloriesPerServing}</strong> cal
                </span>
              )}
              {recipe.nutrition.proteinGrams != null && (
                <span className="nutrition-stat">
                  <strong>{recipe.nutrition.proteinGrams}g</strong> protein
                </span>
              )}
              {recipe.nutrition.carbsGrams != null && (
                <span className="nutrition-stat">
                  <strong>{recipe.nutrition.carbsGrams}g</strong> carbs
                </span>
              )}
              {recipe.nutrition.fatGrams != null && (
                <span className="nutrition-stat">
                  <strong>{recipe.nutrition.fatGrams}g</strong> fat
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <button className="btn btn-secondary" onClick={handleDelete} style={{ marginTop: 20 }}>
        Remove from saved
      </button>
    </div>
  );
}
