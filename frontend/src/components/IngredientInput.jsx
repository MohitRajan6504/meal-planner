import { useState } from "react";

export default function IngredientInput({ ingredients, onChange }) {
  const [draft, setDraft] = useState("");

  const addIngredient = () => {
    const trimmed = draft.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient();
    } else if (e.key === "Backspace" && draft === "" && ingredients.length > 0) {
      onChange(ingredients.slice(0, -1));
    }
  };

  const removeIngredient = (item) => {
    onChange(ingredients.filter((i) => i !== item));
  };

  return (
    <div className="tag-input-wrap">
      {ingredients.map((item) => (
        <span className="tag" key={item}>
          {item}
          <button type="button" onClick={() => removeIngredient(item)} aria-label={`Remove ${item}`}>
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        placeholder={ingredients.length === 0 ? "e.g. eggs, spinach, rice..." : "Add another..."}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addIngredient}
      />
    </div>
  );
}
