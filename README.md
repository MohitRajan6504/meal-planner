# 🍲 Pantry — AI-Powered Meal Planner

![CI](https://github.com/MohitRajan6504/meal-planner/actions/workflows/ci.yml/badge.svg)

A full-stack MERN app that turns the ingredients you already have into real,
cookable recipes — powered by Google's Gemini API. Snap a photo of your
fridge, plan an entire week of dinners with one consolidated shopping list,
and see nutrition estimates for everything it suggests.

**🔗 Live demo:** [https://meal-planner-sigma-khaki.vercel.app]


---

## ✨ Features

| | |
|---|---|
| 🥘 **Recipe generation** | List ingredients you have, get back real recipes with steps, timing, and what you'd still need to buy |
| 📷 **Photo ingredient scanning** | Upload a photo of your fridge/pantry — Gemini's vision model identifies the ingredients for you |
| 🗓️ **Weekly meal planning** | Generate 7 varied dinners at once, with one deduplicated shopping list across the whole week |
| 🍎 **Nutrition estimates** | Calories, protein, carbs, and fat per serving on every generated recipe |
| 🔍 **Search & filter saved recipes** | Find saved recipes by title/ingredient, or filter by max cook time |
| 🔐 **Auth & preferences** | JWT-based accounts with dietary preferences (vegetarian, gluten-free, etc.) that every AI suggestion respects |

---

## Why this project

Most beginner AI projects call an API once and print the text response. This
one integrates GenAI as an actual product feature: structured JSON-mode
prompting (so output renders as real UI, not a wall of text), multimodal
vision input, a full auth flow, persistent data, and a deployed
frontend/backend split — closer to what a real junior-dev ticket looks like
than a tutorial project.

---

## Architecture

```
React (Vite)  ──▶  Express REST API  ──▶  MongoDB (users, saved recipes)
                          │
                          ▼
                     Gemini API
        structured JSON recipes · vision-based ingredient
        detection · weekly plans · nutrition estimates
```

- **Auth:** JWT-based, passwords hashed with bcrypt
- **AI integration:** `backend/services/aiService.js` prompts Gemini to
  return strict JSON (`responseMimeType: "application/json"`) so every
  response renders as real UI components, never raw AI text
- **Data:** MongoDB stores users, dietary preferences, and saved recipes
  (including nutrition data); preferences set at signup are automatically
  factored into every AI suggestion
- **Deployment:** frontend and backend are deployed and hosted separately
  (Vercel + Render), with environment-based CORS locking the API to the
  live frontend origin

---

## Tech stack

**Frontend:** React, Vite, React Router
**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt
**AI:** Google Gemini API (`gemini-flash-latest`) — text + vision
**Tooling:** ESLint, Node's built-in test runner, GitHub Actions CI

---

## Project structure

```
meal-planner-ai/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Recipe (incl. nutrition subdoc)
│   ├── controllers/               # auth + recipe business logic
│   ├── routes/                    # /api/auth, /api/recipes
│   ├── middleware/auth.js         # JWT verification
│   ├── services/aiService.js      # all Gemini prompts + structured parsing
│   │   ├── generateRecipes()          → recipe suggestions
│   │   ├── detectIngredientsFromImage() → vision-based ingredient detection
│   │   └── generateWeeklyPlan()       → 7-day plan + shopping list
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx / Signup.jsx
        │   ├── Dashboard.jsx          # main ingredient → recipe flow
        │   ├── WeeklyPlan.jsx         # 7-day planner
        │   ├── SavedRecipes.jsx       # search/filter saved recipes
        │   └── RecipeDetail.jsx       # single recipe view
        ├── components/
        │   ├── Navbar.jsx, IngredientInput.jsx, RecipeCard.jsx
        │   ├── PhotoIngredientScanner.jsx
        │   └── PasswordInput.jsx      # show/hide toggle
        ├── context/AuthContext.jsx
        └── api/client.js              # fetch wrapper with auth header
```

---

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier works fine
- A Gemini API key — free at [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev
```
Runs on `http://localhost:5000`.

### 3. Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` calls to the backend in
development (see `vite.config.js`). For production, set `VITE_API_URL` to
your deployed backend's URL.

### 4. Try it
Open `http://localhost:5173`, sign up, set your dietary preferences, then:
- Add ingredients manually, or click **"Scan a photo"** to detect them from an image
- Click **"Suggest recipes"** for one-off suggestions, or head to **Week** for a full 7-day plan
- Save recipes and find them again later under **Saved**, with search/filter

---

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Log in, returns JWT |
| POST | `/api/recipes/generate` | Yes | Generate recipes from ingredients via Gemini |
| POST | `/api/recipes/weekly-plan` | Yes | Generate a 7-day dinner plan + consolidated shopping list |
| POST | `/api/recipes/detect-ingredients` | Yes | Detect ingredients from an uploaded photo via Gemini vision |
| POST | `/api/recipes` | Yes | Save a recipe |
| GET | `/api/recipes` | Yes | List saved recipes — supports `?q=search` and `?maxMinutes=30` |
| GET | `/api/recipes/:id` | Yes | Get a single saved recipe |
| DELETE | `/api/recipes/:id` | Yes | Delete a saved recipe |

---

## Linting, testing & CI

```bash
# Backend
cd backend
npm run lint     # ESLint
npm test         # Node's built-in test runner — unit tests for AI response parsing

# Frontend
cd frontend
npm run lint      # ESLint (React rules)
npm run build     # production build, also catches import/type errors
```

`.github/workflows/ci.yml` runs all of the above automatically on every push
and pull request against `main` — backend and frontend lint/test/build in
parallel jobs.

---

## Deployment notes

- **Frontend:** deployed on Vercel, with `VITE_API_URL` pointing at the live backend
- **Backend:** deployed on Render, with `FRONTEND_URL` set to the live frontend origin for CORS
- **Database:** MongoDB Atlas, with network access opened for Render's dynamic IPs
- `frontend/vercel.json` rewrites all routes to `index.html` so React Router's
  client-side routes (e.g. `/saved`, `/recipes/:id`) don't 404 on refresh

---

## Possible extensions

- Rate limiting on the AI endpoints to prevent abuse
- Integration tests against a real (test) database, not just unit tests
- Dark mode
- Recipe ratings/notes after cooking
