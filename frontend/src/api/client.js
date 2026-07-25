// In production, set VITE_API_URL to your deployed backend's full URL
// (e.g. https://your-backend.onrender.com/api).
// Locally, this stays empty and falls back to "/api", which Vite proxies
// to http://localhost:5000 (see vite.config.js) — no env setup needed for dev.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("mealplanner_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  generateRecipes: (payload) => request("/recipes/generate", { method: "POST", body: payload }),
  saveRecipe: (recipe) => request("/recipes", { method: "POST", body: recipe }),
  listSavedRecipes: () => request("/recipes"),
  deleteRecipe: (id) => request(`/recipes/${id}`, { method: "DELETE" }),
};
