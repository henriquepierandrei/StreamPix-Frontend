import { useState, useEffect } from "react";
import { Sun, Moon, User2, Menu, X } from "lucide-react";
import { useTheme } from "../../hooks/ThemeContextType";
import logo from "../../assets/logo.png"
// ------------------------------------------------------------------
// 1. IMPORTAR O HOOK DE NAVEGAÇÃO
import { useNavigate } from "react-router-dom"; 
// ------------------------------------------------------------------

function NavbarHome() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ------------------------------------------------------------------
  // 2. INICIALIZAR O HOOK
  const navigate = useNavigate(); 
  // ------------------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ------------------------------------------------------------------
  // 3. ALTERAR A FUNÇÃO handleNavigate PARA USAR navigate()
  const handleNavigate = (path: string) => {
    navigate(path); // Esta linha faz a navegação real!
    setIsMobileMenuOpen(false); // Fecha o menu móvel após navegar
  };
  // ------------------------------------------------------------------

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => handleNavigate("/")}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img src={logo} alt="" width={30}/>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                StreamPix
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {/* Mantido como <a> para navegação por âncora (#) dentro da mesma página */}
              {["Contato", "Linkedin"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Alternar tema"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                // Agora usa a navegação real
                onClick={() => handleNavigate("/streamer/dashboard/login")}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <User2 size={16} />
                Entrar
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 right-4 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-40 lg:hidden overflow-hidden">
            <div className="p-4 space-y-1">
              {/* Estes links continuam sendo âncoras para rolagem, não navegação */}
              {["Recursos", "Preços", "Suporte"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                >
                  {item}
                </a>
              ))}

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
              >
                {isDarkMode ? (
                  <>
                    <Sun size={18} /> Modo Claro
                  </>
                ) : (
                  <>
                    <Moon size={18} /> Modo Escuro
                  </>
                )}
              </button>

              <button
                // Agora usa a navegação real
                onClick={() => handleNavigate("/streamer/dashboard/login")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg transition-all duration-200"
              >
                <User2 size={16} /> Fazer Login
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default NavbarHome;