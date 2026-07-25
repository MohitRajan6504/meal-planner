const BASE_URL = "/api";

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
