import { useState, useEffect } from "react";
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
  activeItem: string; // <- item ativo vem do pai
  onSelect?: (label: string) => void; // <- callback quando clicar
}

function NavBarDashboard({ activeItem, }: NavBarDashboardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();

  // aplica a classe no body sempre que mudar
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpireAt")
    localStorage.removeItem("refreshTokenExpireAt")
    window.location.reload();
  };

  return (
    <nav className="navbar" style={{ marginBottom: "20px" }}>
      <div className="navbar-container">
        <div className="navbar-content">
          <img src={isDarkMode ? logo : logodark} alt="Logo" width={40} className="logo-dashboard-img" />

          {/* Botão do menu mobile */}
          <div className="navbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menu Desktop */}
          <div className="desktop-nav">
            <button
              onClick={() => navigate("/streamer/dashboard/donations")}
              className={`nav-item ${activeItem === "Doações" ? "nav-item-active" : ""
                }`}
            >
              <MessageSquareHeart size={18} />
              <span>Doações</span>
            </button>

            <button
              onClick={() => navigate("/streamer/dashboard/goals")}
              className={`nav-item ${activeItem === "Metas" ? "nav-item-active" : ""
                }`}
            >
              <Goal size={18} />
              <span>Metas</span>
            </button>

            <button
              onClick={() => navigate("/streamer/dashboard/profile")}
              className={`nav-item ${activeItem === "Streamer" ? "nav-item-active" : ""
                }`}
            >
              <Settings size={18} />
              <span>Streamer</span>
            </button>

            <button
              onClick={() => navigate("/streamer/dashboard/qrcode/settings")}
              className={`nav-item ${activeItem === "QrCode" ? "nav-item-active" : ""
                }`}
            >
              <QrCode size={18} />
              <span>QrCode</span>
            </button>

            <button
              onClick={() => navigate("/streamer/dashboard/messages")}
              className={`nav-item ${activeItem === "Mensagens" ? "nav-item-active" : ""
                }`}
            >
              <MessageSquare size={18} />
              <span>Mensagens</span>
            </button>

            {/* Botão Dark/Light */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
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

        {/* Menu Lateral (mobile) */}
        {isMenuOpen && (
          <aside className="mobile-menu">
            <div className="mobile-nav-items">
              <button
                onClick={() => {
                  navigate("/streamer/dashboard/donations")
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${activeItem === "Doações" ? "mobile-nav-item-active" : ""
                  }`}
              >
                <MessageSquareHeart size={18} />
                <span>Doações</span>
              </button>

              <button
                onClick={() => {
                  navigate("/streamer/dashboard/goals")
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${activeItem === "Metas" ? "mobile-nav-item-active" : ""
                  }`}
              >
                <Goal size={18} />
                <span>Metas</span>
              </button>

              <button
                onClick={() => {
                  navigate("/streamer/dashboard/profile")
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${activeItem === "Streamer" ? "mobile-nav-item-active" : ""
                  }`}
              >
                <Settings size={18} />
                <span>Streamer</span>
              </button>

              <button
                onClick={() => {
                  navigate("/streamer/dashboard/qrcode/settings")
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${activeItem === "QrCode" ? "mobile-nav-item-active" : ""
                  }`}
              >
                <QrCode size={18} />
                <span>QrCode</span>
              </button>

              <button
                onClick={() => {
                  navigate("/streamer/dashboard/messages")
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${activeItem === "Mensagens" ? "mobile-nav-item-active" : ""
                  }`}
              >
                <MessageSquare size={18} />
                <span>Mensagens</span>
              </button>

              {/* Botão Dark/Light no mobile */}
              <button
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  setIsMenuOpen(false);
                }}
                className="mobile-nav-item"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? "Light" : "Dark"}</span>
              </button>

              <button onClick={handleLogout} className="nav-item">
                <DoorOpen size={18} />
                <span>Sair</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </nav>
  );
}

export default NavBarDashboard;
