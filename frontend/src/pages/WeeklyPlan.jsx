import { useState } from "react";
import { api } from "../api/client.js";
import IngredientInput from "../components/IngredientInput.jsx";

export default function WeeklyPlan() {
  const [ingredients, setIngredients] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const data = await api.weeklyPlan({ ingredients });
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 44 }}>
      <span className="eyebrow">Plan the whole week</span>
      <h1>7 dinners, one shopping list</h1>
      <p className="subtitle">
        Add what you already have, and we'll plan a week of varied dinners plus a single
        consolidated shopping list for everything else you'll need.
      </p>

      <IngredientInput ingredients={ingredients} onChange={setIngredients} />

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={handleGenerate} disabled={loading || ingredients.length === 0}>
          {loading ? "Planning your week..." : "Plan my week"}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}

      {loading && (
        <p className="loading-line" style={{ marginTop: 32 }}>
          Planning 7 dinners
          <span className="dot" style={{ "--i": 0 }}>.</span>
          <span className="dot" style={{ "--i": 1 }}>.</span>
          <span className="dot" style={{ "--i": 2 }}>.</span>
        </p>
      )}

      {!loading && !plan && !error && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <span className="empty-icon">🗓️</span>
          Add a few ingredients above and hit "Plan my week" to get started.
        </div>
      )}

      {plan && (
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div>
            {plan.days.map((day) => (
              <article className="recipe-card" key={day.day}>
                <span className="recipe-meta">{day.day.toUpperCase()}</span>
                <h3>{day.title}</h3>
                {day.description && <p className="desc">{day.description}</p>}
                <span className="recipe-meta">
                  {day.estimatedMinutes ? `${day.estimatedMinutes} min` : ""}
                  {day.estimatedMinutes && day.servings ? " · " : ""}
                  {day.servings ? `Serves ${day.servings}` : ""}
                </span>
              </article>
            ))}
          </div>

          <div className="recipe-card" style={{ position: "sticky", top: 100, height: "fit-content" }}>
            <span className="recipe-meta">🛒 Shopping list</span>
            <h3>This week's list</h3>
            {plan.shoppingList.length === 0 ? (
              <p className="desc">You already have everything you need!</p>
            ) : (
              <ul style={{ paddingLeft: 20, fontSize: "0.92rem" }}>
                {plan.shoppingList.map((item) => (
                  <li key={item} style={{ marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
