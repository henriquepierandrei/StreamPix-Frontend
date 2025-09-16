import { useState, useEffect } from "react";
import logo from '../../assets/logo.png'
import logodark from '../../assets/logo-dark.png'
import { Sun, Moon, User2 } from "lucide-react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

function NavbarHome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    return (
        <nav className="navbar-home-root">
            <div className="navbar-home-wrapper">
                <div className="navbar-home-inner">
                    
                    {/* Logo */}
                    <img
                        src={isDarkMode ? logo : logodark}
                        alt="Logo"
                        className="navbar-home-logo"
                    />

                    {/* Links / Botões */}
                    <div className="navbar-home-actions">
                        {/* Botão Dark/Light */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="navbar-home-btn"
                        >
                            {isDarkMode ? (
                                <Sun size={22} strokeWidth={2} />
                            ) : (
                                <Moon size={22} strokeWidth={2} />
                            )}
                        </button>

                        {/* Entrar */}
                        <button
                            className="navbar-home-btn"
                            onClick={() => navigate("/streamer/dashboard/login")}
                        >
                            <User2 size={18} strokeWidth={2} />
                            <span>Entrar</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
export default NavbarHome;
