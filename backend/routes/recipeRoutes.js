import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  generate,
  saveRecipe,
  listSavedRecipes,
  deleteRecipe,
} from "../controllers/recipeController.js";

const router = Router();

router.use(requireAuth);

router.post("/generate", generate);       // POST /api/recipes/generate
router.post("/", saveRecipe);             // POST /api/recipes
router.get("/", listSavedRecipes);        // GET  /api/recipes
router.delete("/:id", deleteRecipe);      // DELETE /api/recipes/:id

export default router;
