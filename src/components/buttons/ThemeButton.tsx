import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeButton() {
  // Inicializa o estado lendo do localStorage. Se for 'dark', é true.
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement; // Usa document.documentElement (padrão Tailwind)

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.removeItem("theme");
    }
    // Nota: O Tailwind por padrão usa a classe 'dark' no elemento raiz (<html>) ou (<body>),
    // mas document.documentElement (<html>) é o mais comum.
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <button
      onClick={toggleTheme}
      // Classes Tailwind para um visual moderno:
      className="
        
        flex items-center space-x-2 
        p-2 pr-3 rounded-full 
        text-sm font-medium 
        shadow-lg transition-all duration-300 
        
        // Estilo Padrão (Light Mode)
        bg-gray-100 text-gray-700 
        hover:bg-gray-200 
        border border-gray-300
        
        // Estilo Dark Mode
        dark:bg-gray-700 dark:text-gray-200 
        dark:hover:bg-gray-600 
        dark:border-gray-600
      "
      aria-label={isDarkMode ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
    >
      {/* Ícone */}
      <div className="flex items-center">
        {isDarkMode 
          ? <Sun size={18} className="text-yellow-400" /> 
          : <Moon size={18} className="text-indigo-600" />
        }
      </div>

      {/* Separador Vertical Sutil */}
      <div 
        className="
          w-px h-5 
          bg-gray-300 dark:bg-gray-500
          transition-colors duration-300
        "
      ></div>
      
      {/* Texto */}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeButton;