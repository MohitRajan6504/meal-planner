import { useState } from "react";

export default function PasswordInput({ id, value, onChange, minLength, required = true }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        style={{ paddingRight: 68 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-herb-dark)",
          padding: "4px 8px",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-tomato)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-herb-dark)")}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
