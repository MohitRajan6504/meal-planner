function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8L10.3 9.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ServingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 2v4.5a2 2 0 0 0 4 0V2M6 2v12M12 2c-1.1 0-2 1.6-2 3.5S10.9 9 12 9m0-7v12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecipeCard({ recipe, onSave, onDelete, saved = false }) {
  return (
    <article className="recipe-card">
      <span className="recipe-meta">
        {recipe.estimatedMinutes && (
          <>
            <ClockIcon />
            {recipe.estimatedMinutes} min
          </>
        )}
        {recipe.estimatedMinutes && recipe.servings ? " · " : ""}
        {recipe.servings && (
          <>
            <ServingsIcon />
            Serves {recipe.servings}
          </>
        )}
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
