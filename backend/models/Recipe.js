import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    usedIngredients: { type: [String], default: [] },   // ingredients the user already had
    missingIngredients: { type: [String], default: [] }, // shopping list items
    steps: { type: [String], default: [] },
    estimatedMinutes: { type: Number, default: null },
    servings: { type: Number, default: null },
    nutrition: {
      caloriesPerServing: { type: Number, default: null },
      proteinGrams: { type: Number, default: null },
      carbsGrams: { type: Number, default: null },
      fatGrams: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
