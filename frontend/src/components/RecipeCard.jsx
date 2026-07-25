export default function RecipeCard({ recipe, onSave, onDelete, saved = false }) {
  return (
    <article className="recipe-card">
      <span className="recipe-meta">
        {recipe.estimatedMinutes ? `${recipe.estimatedMinutes} min` : ""}
        {recipe.estimatedMinutes && recipe.servings ? " · " : ""}
        {recipe.servings ? `Serves ${recipe.servings}` : ""}
      </span>
      <h3>{recipe.title}</h3>
      {recipe.description && <p className="desc">{recipe.description}</p>}

      <div className="tag-row">
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
        <ol>
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {(onSave || onDelete) && (
        <div className="card-actions">
          {onSave && !saved && (
            <button className="btn" onClick={() => onSave(recipe)}>
              Save recipe
            </button>
          )}
          {onDelete && (
            <button className="btn btn-secondary" onClick={() => onDelete(recipe)}>
              Remove
            </button>
          )}
        </div>
      )}
    </article>
  );
}
