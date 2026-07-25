import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const DIET_OPTIONS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "low-carb"];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [diets, setDiets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDiet = (diet) => {
    setDiets((prev) => (prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ ...form, dietaryPreferences: diets });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "60px auto 0" }}>
      <span className="eyebrow">Get started</span>
      <h1>Create an account</h1>
      <p className="subtitle">Tell us your preferences once — every recipe respects them after.</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Dietary preferences (optional)</label>
          <div className="tag-row">
            {DIET_OPTIONS.map((diet) => (
              <button
                key={diet}
                type="button"
                className="tag"
                style={{
                  background: diets.includes(diet) ? "var(--color-herb)" : "var(--color-line)",
                  color: diets.includes(diet) ? "#fff" : "var(--color-ink)",
                }}
                onClick={() => toggleDiet(diet)}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="subtitle" style={{ marginTop: 20 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
