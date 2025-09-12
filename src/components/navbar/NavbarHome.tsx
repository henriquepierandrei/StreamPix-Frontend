import { useState, useEffect } from "react";
import logo from '../../assets/logo.png'
import logodark from '../../assets/logo-dark.png'
import {
    Sun,
    Moon,
    User2
} from "lucide-react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";



function NavbarHome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();
    
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );


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


    return (
        <nav className="navbar" style={{position: "fixed"}}>
            <div className="navbar-container">
                
                <div className="navbar-content">
                    
                    <img src={isDarkMode ? logo : logodark} alt="Logo" width={50} className="logo-dashboard-img" style={{ position: "absolute", left: "20px" }} />
                    {/* Menu Desktop */}
                    <div className="desktop-nav" style={{ display: "flex", position: "absolute", right: "20px" }}>
                        {/* Botão Dark/Light */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="nav-item"
                            style={{ fontSize: "1.2rem", fontWeight: "300", width: "max-content", padding: "5px" }}
                        >
                            {isDarkMode ? <Sun size={22} strokeWidth={3} /> : <Moon size={22} strokeWidth={3} />}
                            
                        </button>

                        <button className="nav-item" style={{ fontSize: "1.2rem", fontWeight: "300" }}
                        onClick={() => navigate("/streamer/dashboard/login")}
                        >
                            
                            <User2 size={18} strokeWidth={2} />
                            <span>Entrar</span>
                        </button>
                    </div>
                </div>


            </div>
        </nav>
    )
}
export default NavbarHome

