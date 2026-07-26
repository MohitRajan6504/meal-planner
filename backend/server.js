import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();

// FRONTEND_URL can be a comma-separated list, e.g.
// "http://localhost:5173,https://your-app.vercel.app"
// If unset, CORS is left open — fine for local dev, but set this in production.
const allowedOrigins = process.env.FRONTEND_URL?.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins || true,
  })
);
app.use(express.json({ limit: "10mb" })); // raised from Express's 100kb default to allow base64 image uploads

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

// Fallback error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
