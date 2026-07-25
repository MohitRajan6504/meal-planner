import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRecipeJSON } from "../aiService.js";

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
