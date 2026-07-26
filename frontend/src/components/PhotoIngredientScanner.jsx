import { useRef, useState } from "react";
import { api } from "../api/client.js";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result looks like "data:image/jpeg;base64,AAAA..." — strip the prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoIngredientScanner({ onDetected }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    try {
      const base64Image = await fileToBase64(file);
      const data = await api.detectIngredients({ base64Image, mimeType: file.type });

      if (data.ingredients.length === 0) {
        setError("Couldn't identify any ingredients in that photo — try a clearer shot.");
      } else {
        onDetected(data.ingredients);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? "Scanning photo..." : "📷 Scan a photo of your fridge/pantry"}
      </button>
      {error && (
        <div className="error-banner" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
