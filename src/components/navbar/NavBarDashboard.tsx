import { useState, useEffect, useRef } from "react";
import logo from '../../assets/logo.png'
import logodark from '../../assets/logo-dark.png'
import { useNavigate } from "react-router-dom";
import {
  MessageSquareHeart,
  Menu,
  X,
  Goal,
  MessageSquare,
  Settings,
  QrCode,
  DoorOpen,
  Sun,
  Moon,
} from "lucide-react";
import "./Navbar.css";

interface NavBarDashboardProps {
  activeItem: string;
  onSelect?: (label: string) => void;
}

function NavBarDashboard({ activeItem, onSelect }: NavBarDashboardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Aplica a classe dark no body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevenir scroll do body quando menu mobile estiver aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Fechar menu ao redimensionar a tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpireAt");
    localStorage.removeItem("refreshTokenExpireAt");
    window.location.reload();
  };

  const handleNavigation = (path: string, label?: string) => {
    navigate(path);
    setIsMenuOpen(false);
    if (onSelect && label) {
      onSelect(label);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      {/* Botão do menu mobile */}
      <button
        ref={buttonRef}
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navbar Desktop */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <img 
              src={isDarkMode ? logo : logodark} 
              alt="Logo" 
              className="logo-dashboard-img" 
            />

            {/* Menu Desktop */}
            <div className="desktop-nav">
              <button
                onClick={() => handleNavigation("/streamer/dashboard/donations", "Doações")}
                className={`nav-item ${activeItem === "Doações" ? "nav-item-active" : ""}`}
              >
                <MessageSquareHeart size={18} />
                <span>Doações</span>
              </button>

              <button
                onClick={() => handleNavigation("/streamer/dashboard/goals", "Metas")}
                className={`nav-item ${activeItem === "Metas" ? "nav-item-active" : ""}`}
              >
                <Goal size={18} />
                <span>Metas</span>
              </button>

              <button
                onClick={() => handleNavigation("/streamer/dashboard/profile", "Streamer")}
                className={`nav-item ${activeItem === "Streamer" ? "nav-item-active" : ""}`}
              >
                <Settings size={18} />
                <span>Streamer</span>
              </button>

              <button
                onClick={() => handleNavigation("/streamer/dashboard/qrcode/settings", "QrCode")}
                className={`nav-item ${activeItem === "QrCode" ? "nav-item-active" : ""}`}
              >
                <QrCode size={18} />
                <span>QrCode</span>
              </button>

              <button
                onClick={() => handleNavigation("/streamer/dashboard/messages", "Mensagens")}
                className={`nav-item ${activeItem === "Mensagens" ? "nav-item-active" : ""}`}
              >
                <MessageSquare size={18} />
                <span>Mensagens</span>
              </button>

              <div className="nav-separator" />

              {/* Botão Dark/Light */}
              <button
                onClick={toggleTheme}
                className="nav-item"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>

              <button onClick={handleLogout} className="nav-item">
                <DoorOpen size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <aside ref={menuRef} className="mobile-menu">
          <div className="mobile-menu-header">
            <img 
              src={isDarkMode ? logo : logodark} 
              alt="Logo" 
              className="logo-dashboard-img" 
            />
            <button
              className="mobile-menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mobile-nav-items">
            <button
              onClick={() => handleNavigation("/streamer/dashboard/donations", "Doações")}
              className={`mobile-nav-item ${activeItem === "Doações" ? "mobile-nav-item-active" : ""}`}
            >
              <MessageSquareHeart size={18} />
              <span>Doações</span>
            </button>

            <button
              onClick={() => handleNavigation("/streamer/dashboard/goals", "Metas")}
              className={`mobile-nav-item ${activeItem === "Metas" ? "mobile-nav-item-active" : ""}`}
            >
              <Goal size={18} />
              <span>Metas</span>
            </button>

            <button
              onClick={() => handleNavigation("/streamer/dashboard/profile", "Streamer")}
              className={`mobile-nav-item ${activeItem === "Streamer" ? "mobile-nav-item-active" : ""}`}
            >
              <Settings size={18} />
              <span>Streamer</span>
            </button>

            <button
              onClick={() => handleNavigation("/streamer/dashboard/qrcode/settings", "QrCode")}
              className={`mobile-nav-item ${activeItem === "QrCode" ? "mobile-nav-item-active" : ""}`}
            >
              <QrCode size={18} />
              <span>QrCode</span>
            </button>

            <button
              onClick={() => handleNavigation("/streamer/dashboard/messages", "Mensagens")}
              className={`mobile-nav-item ${activeItem === "Mensagens" ? "mobile-nav-item-active" : ""}`}
            >
              <MessageSquare size={18} />
              <span>Mensagens</span>
            </button>

            <div className="nav-separator" />

            {/* Botão Dark/Light no mobile */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="mobile-nav-item"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? "Light" : "Dark"}</span>
            </button>

            <button onClick={handleLogout} className="mobile-nav-item">
              <DoorOpen size={18} />
              <span>Sair</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

export default NavBarDashboard;