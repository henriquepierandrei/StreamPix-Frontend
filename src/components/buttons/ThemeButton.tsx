import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeButton() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.removeItem("theme");
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: isDarkMode ? "#f5f5f5" : "#222",
        color: isDarkMode ? "#000" : "#fff",
        transition: "all 0.3s ease",
        width: "max-content",
        position: "absolute",
        top: "10px",
      }}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeButton;
