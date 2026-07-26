import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRecipeJSON, parseIngredientsJSON, parseWeeklyPlanJSON } from "../aiService.js";

test("parses clean JSON with a recipes array", () => {
  const raw = JSON.stringify({
    recipes: [{ title: "Fried Rice", usedIngredients: ["rice", "egg"] }],
  });
  const result = parseRecipeJSON(raw);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Fried Rice");
});

test("strips markdown code fences before parsing", () => {
  const raw = "```json\n" + JSON.stringify({ recipes: [{ title: "Omelette" }] }) + "\n```";
  const result = parseRecipeJSON(raw);
  assert.equal(result[0].title, "Omelette");
});

test("throws a clear error when the JSON is malformed", () => {
  assert.throws(() => parseRecipeJSON("not json at all"), /not valid JSON/);
});

test("throws a clear error when 'recipes' is missing or not an array", () => {
  assert.throws(() => parseRecipeJSON(JSON.stringify({ foo: "bar" })), /recipes.*array/);
});

test("handles multiple recipes in the response", () => {
  const raw = JSON.stringify({
    recipes: [{ title: "A" }, { title: "B" }, { title: "C" }],
  });
  const result = parseRecipeJSON(raw);
  assert.equal(result.length, 3);
});

test("parseIngredientsJSON: parses a clean ingredients array", () => {
  const raw = JSON.stringify({ ingredients: ["Eggs", "Spinach", "Milk"] });
  const result = parseIngredientsJSON(raw);
  assert.deepEqual(result, ["eggs", "spinach", "milk"]);
});

test("parseIngredientsJSON: dedupes and normalizes casing/whitespace", () => {
  const raw = JSON.stringify({ ingredients: [" Eggs", "eggs", "EGGS ", "Milk"] });
  const result = parseIngredientsJSON(raw);
  assert.deepEqual(result, ["eggs", "milk"]);
});

test("parseIngredientsJSON: handles an empty ingredients array", () => {
  const raw = JSON.stringify({ ingredients: [] });
  const result = parseIngredientsJSON(raw);
  assert.deepEqual(result, []);
});

test("parseIngredientsJSON: throws when 'ingredients' is missing", () => {
  assert.throws(() => parseIngredientsJSON(JSON.stringify({ foo: "bar" })), /ingredients.*array/);
});

test("parseWeeklyPlanJSON: parses days and shoppingList", () => {
  const raw = JSON.stringify({
    days: [{ day: "Monday", title: "Stir Fry" }],
    shoppingList: ["soy sauce", "rice"],
  });
  const result = parseWeeklyPlanJSON(raw);
  assert.equal(result.days.length, 1);
  assert.equal(result.days[0].title, "Stir Fry");
  assert.deepEqual(result.shoppingList, ["soy sauce", "rice"]);
});

test("parseWeeklyPlanJSON: throws when 'days' is missing", () => {
  assert.throws(
    () => parseWeeklyPlanJSON(JSON.stringify({ shoppingList: [] })),
    /days.*array/
  );
});

test("parseWeeklyPlanJSON: throws when 'shoppingList' is missing", () => {
  assert.throws(
    () => parseWeeklyPlanJSON(JSON.stringify({ days: [] })),
    /shoppingList.*array/
  );
});
