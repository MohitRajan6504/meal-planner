# Pantry — AI-Powered Meal Planner

![CI](https://github.com/MohitRajan6504/meal-planner/actions/workflows/ci.yml/badge.svg)

A full MERN stack app where you list the ingredients you have on hand, and
Google Gemini (via the Gemini API) suggests real, cookable recipes — flagging
which ingredients you already have and which you'd need to buy.

**Live demo:** _add your deployed link here once hosted_

## Why this project

Goes beyond a basic CRUD app by integrating a real GenAI feature end-to-end:
structured prompt design, JSON-mode parsing, and rendering AI output as
proper UI components (not just dumped text) — plus a complete auth flow
and persistent data, which is what most take-home assignments and real
junior-dev tickets actually look like.

## Architecture

```
React (Vite)  →  Express REST API  →  MongoDB (users, saved recipes)
                        │
                        ▼
                Gemini API
          generates structured recipe JSON
          from the user's ingredient list
```

- **Auth:** JWT-based, passwords hashed with bcrypt
- **AI integration:** `backend/services/aiService.js` prompts Gemini to return
  strict JSON (no prose) so recipes render as real cards, not raw AI text
- **Data:** MongoDB stores users and their saved recipes; dietary
  preferences set at signup are automatically factored into every
  AI-generated suggestion

## Tech stack

MongoDB · Express · React · Node.js · Gemini API · JWT · Vite

## Project structure

```
meal-planner-ai/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # User, Recipe schemas
│   ├── controllers/           # auth + recipe business logic
│   ├── routes/                # /api/auth, /api/recipes
│   ├── middleware/auth.js     # JWT verification
│   ├── services/aiService.js  # Gemini prompt + structured parsing
│   └── server.js
└── frontend/
    └── src/
        ├── pages/              # Login, Signup, Dashboard, SavedRecipes
        ├── components/         # Navbar, IngredientInput, RecipeCard
        ├── context/AuthContext.jsx
        └── api/client.js       # fetch wrapper with auth header
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier works fine
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
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
Runs on `http://localhost:5173` and proxies `/api` calls to the backend
(see `vite.config.js`).

### 4. Try it
Open `http://localhost:5173`, sign up, set your dietary preferences, add a
few ingredients, and click "Suggest recipes."

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Log in, returns JWT |
| POST | `/api/recipes/generate` | Yes | Generate recipes from ingredients via Gemini |
| POST | `/api/recipes` | Yes | Save a recipe |
| GET | `/api/recipes` | Yes | List saved recipes |
| DELETE | `/api/recipes/:id` | Yes | Delete a saved recipe |

## Linting, testing & CI

```bash
# Backend
cd backend
npm run lint     # ESLint
npm test         # Node's built-in test runner — unit tests for AI response parsing

# Frontend
cd frontend
npm run lint      # ESLint (React rules)
npm run build     # production build, also catches type/import errors
```

`.github/workflows/ci.yml` runs all of the above automatically on every push
and pull request against `main` — backend and frontend lint/test/build in
parallel jobs.

## Possible extensions

- Parse ingredients from a photo of your fridge (multimodal Gemini input)
- Weekly meal-plan generation instead of one-off suggestions
- Auto-generate a consolidated shopping list across multiple saved recipes
- Nutrition estimates per recipe
- Deploy: frontend on Vercel/Netlify, backend on Render/Railway, DB on
  MongoDB Atlas
