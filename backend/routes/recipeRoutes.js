import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  generate,
  weeklyPlan,
  detectIngredients,
  saveRecipe,
  listSavedRecipes,
  getRecipe,
  deleteRecipe,
} from "../controllers/recipeController.js";

const router = Router();

router.use(requireAuth);

router.post("/generate", generate);                   // POST /api/recipes/generate
router.post("/weekly-plan", weeklyPlan);               // POST /api/recipes/weekly-plan
router.post("/detect-ingredients", detectIngredients); // POST /api/recipes/detect-ingredients
router.post("/", saveRecipe);                          // POST /api/recipes
router.get("/", listSavedRecipes);                     // GET  /api/recipes?q=&maxMinutes=
router.get("/:id", getRecipe);                         // GET  /api/recipes/:id
router.delete("/:id", deleteRecipe);                   // DELETE /api/recipes/:id

export default router;
