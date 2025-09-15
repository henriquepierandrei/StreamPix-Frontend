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
      className="button-toggle-theme-principal"
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      <div className="vertical-line"></div>
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeButton;
