import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
    User, 
    MessageSquareHeart, Menu, X, Goal, MessageSquare, Settings, QrCode, DoorOpen, Sun, Moon,
} from "lucide-react";

// Importe seus assets reais - ajuste os caminhos conforme sua estrutura de pastas
import logodark from "../../assets/logo.png";
import logo from "../../assets/logo-dark.png";

// =================================================================
// NAVBAR COMPONENT
// =================================================================

interface NavBarDashboardProps {
    activeItem: string;
    onSelect?: (label: string) => void;
}

const navItems = [
    { path: "/streamer/dashboard/donations", label: "Doações", Icon: MessageSquareHeart },
    { path: "/streamer/dashboard/goals", label: "Metas", Icon: Goal },
    { path: "/streamer/dashboard/profile", label: "Streamer", Icon: Settings },
    { path: "/streamer/dashboard/qrcode/settings", label: "QrCode", Icon: QrCode },
    { path: "/streamer/dashboard/messages", label: "Mensagens", Icon: MessageSquare },
    { path: "/streamer/dashboard/account", label: "Conta", Icon: User },
];

function NavBarDashboard({ activeItem, onSelect }: NavBarDashboardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(
        Cookies.get("theme") === "dark"
    );
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Aplica a classe 'dark' ao elemento raiz (<html>) para o tema
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            Cookies.set("theme", "dark", { expires: 365 });
        } else {
            document.documentElement.classList.remove("dark");
            Cookies.set("theme", "light", { expires: 365 });
        }
    }, [isDarkMode]);

    // Lógica de fechar menu ao clicar fora
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
        const cookieOptions = { secure: true, sameSite: "Strict" as const, path: "/" };
        Cookies.remove("token", cookieOptions);
        Cookies.remove("refreshToken", cookieOptions);
        Cookies.remove("tokenExpireAt", cookieOptions);
        Cookies.remove("refreshTokenExpireAt", cookieOptions);
        window.location.href = "/streamer/dashboard/login";
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

    const baseNavItemClasses = `
        flex items-center gap-3 py-2 px-3 rounded-lg 
        text-gray-600 dark:text-gray-300 
        hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-colors duration-150
        w-full
    `;

    const activeDesktopItemClasses = `
        bg-blue-50 dark:bg-gray-800 
        text-blue-600 dark:text-blue-400 
        font-semibold 
        border-r-4 border-blue-500 dark:border-blue-400
    `;

    const activeMobileItemClasses = `
        bg-blue-50 dark:bg-gray-800 
        text-blue-600 dark:text-blue-400 
        font-semibold
    `;

    const NavItem = ({ item, isMobile = false }: { item: typeof navItems[0], isMobile?: boolean }) => {
        const isActive = activeItem === item.label;
        const activeClasses = isActive
            ? (isMobile ? activeMobileItemClasses : activeDesktopItemClasses)
            : '';
        const desktopSpecificClasses = isMobile ? '' : 'justify-start';

        return (
            <button
                onClick={() => handleNavigation(item.path, item.label)}
                className={`${baseNavItemClasses} ${activeClasses} ${desktopSpecificClasses}`}
                aria-current={isActive ? 'page' : undefined}
            >
                <item.Icon size={18} />
                <span className="truncate text-left">{item.label}</span>
            </button>
        );
    };

    return (
        <>
            <nav
                className="
                    fixed top-0 left-0 w-full z-40
                    bg-white dark:bg-gray-900
                    shadow-md dark:shadow-lg dark:shadow-gray-900/50
                    lg:w-64 lg:h-screen lg:flex lg:flex-col lg:shadow-xl
                "
            >
                <div className="
                    w-full h-16 flex items-center justify-between px-4
                    lg:h-full lg:flex-col lg:p-4 lg:pt-6 lg:items-start lg:gap-6
                ">
                    <div className="flex-shrink-0">
                        <img
                            src={isDarkMode ? logodark : logo}
                            alt="Logo"
                            className="h-8 lg:h-10 cursor-pointer object-contain"
                            onClick={() => navigate("/streamer/dashboard")}
                        />
                    </div>

                    <button
                        ref={buttonRef}
                        className="
                            lg:hidden
                            p-2 rounded-full
                            text-gray-800 dark:text-gray-200
                            hover:bg-gray-100 dark:hover:bg-gray-800
                            transition-colors
                            flex w-10 h-10 items-center justify-center
                        "
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="
                        hidden lg:flex lg:flex-col lg:gap-1 lg:w-full
                        lg:mt-4 lg:flex-grow lg:overflow-y-auto lg:pb-4
                    ">
                        {navItems.map(item => (
                            <NavItem key={item.label} item={item} />
                        ))}

                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-2" />

                        <button
                            onClick={toggleTheme}
                            className={baseNavItemClasses}
                        >
                            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
                            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className={`${baseNavItemClasses} text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300`}
                        >
                            <DoorOpen size={18} />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="
                        fixed inset-0 z-30
                        bg-black/50 dark:bg-black/70
                        lg:hidden
                    "
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                ref={menuRef}
                className={`
                    fixed top-0 left-0 h-full w-64 z-50
                    bg-white dark:bg-gray-800
                    shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    lg:hidden
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <img
                            src={isDarkMode ? logodark : logo}
                            alt="Logo"
                            className="h-8 cursor-pointer object-contain"
                            onClick={() => {
                                navigate("/streamer/dashboard");
                                setIsMenuOpen(false);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto flex-grow">
                        {navItems.map(item => (
                            <NavItem key={item.label} item={item} isMobile={true} />
                        ))}

                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-2" />

                        <button
                            onClick={() => {
                                toggleTheme();
                                setIsMenuOpen(false);
                            }}
                            className={baseNavItemClasses}
                        >
                            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
                            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                        </button>

                        <button onClick={handleLogout} className={`${baseNavItemClasses} text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300`}>
                            <DoorOpen size={18} />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="block lg:hidden h-16 w-full flex-shrink-0" />
            <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />
        </>
    );
}

export default NavBarDashboard;