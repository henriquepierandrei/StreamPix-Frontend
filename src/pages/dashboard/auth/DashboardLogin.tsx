import { useEffect, useState } from "react";
// Importar apiPublic e ApiConfig para buscar token e fazer a requisição de validação
import { apiPublic, ApiConfig } from "../../../api/ApiConfig";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/alerts/Alert";
import logoDark from "../../../assets/logo.png";
import { Lock, User, Moon, Sun } from "lucide-react";
import { useAuth } from "../../../routes/AuthContext";
import { useTheme } from "../../../hooks/ThemeContextType";

// --- Novas Interfaces ---
interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpireAt: string;
  refreshTokenExpireAt: string;
}

interface ValidationResponse {
  username: string;
  valid: boolean;
}
// --- Fim das Novas Interfaces ---

function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any | null>(null);
  // Adiciona um estado para indicar se o componente está carregando (validando o token)
  const [isLoading, setIsLoading] = useState(true); 

  const { setAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const rememberCheck = (): boolean =>
    localStorage.getItem("remember_check") === "true";
  const [remember, setRemember] = useState<boolean>(rememberCheck());

  // ====================================================================
  // 🚀 Lógica de Validação do Token na Montagem do Componente (Auto-Login) 
  // ====================================================================
  useEffect(() => {
    const validateAndRedirect = async () => {
      // 1. Obter o Token
      // Assumindo que 'ApiConfig.getToken()' busca o token do armazenamento
      const token = ApiConfig.getToken(); 

      if (token) {
        try {
          // 2. Chamar o Endpoint de Validação
          const response = await apiPublic.get<ValidationResponse>(
            "/auth/validate",
            {
              // O token deve ser enviado no header 'Authorization'
              headers: {
                Authorization: `Bearer ${token}`, // Formato padrão para JWT
              },
            }
          );

          // 3. Redirecionamento se for Válido
          if (response.data.valid) {
            // Se o token for válido, define o estado de autenticação e redireciona
            setAuthenticated(true);
            navigate("/streamer/dashboard/donations", { replace: true });
            return; // Interrompe a execução para evitar renderização da tela de login
          }
          // Se for inválido, o código continua para a tela de login
        } catch (err: any) {
          // Em caso de erro na requisição (ex: token expirado/inválido),
          // o usuário é mantido na tela de login.
          console.error("Erro na validação do token:", err);
          // O token e refresh token podem ser removidos aqui se o erro for 401/403
          // ApiConfig.clearTokens(); 
        }
      }
      
      // Finaliza o estado de carregamento, permitindo a exibição do formulário de login
      setIsLoading(false); 
    };

    validateAndRedirect();
  }, [navigate, setAuthenticated]); // Dependências do useEffect
  // ====================================================================
  
  // Efeitos colaterais e funções existentes...
  
  useEffect(() => {
    if (remember) {
      const savedEmail = localStorage.getItem("email_remember") || "";
      const savedPassword = localStorage.getItem("password_remember") || "";
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, [remember]);

  useEffect(() => {
    localStorage.setItem("remember_check", remember ? "true" : "false");
  }, [remember]);

  const rememberLogin = (email: string, password: string) => {
    localStorage.setItem("email_remember", email);
    localStorage.setItem("password_remember", password);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "E-mail e senha são obrigatórios.",
        path: "/login",
      });
      return;
    }

    try {
      const response = await apiPublic.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { token, refreshToken, tokenExpireAt, refreshTokenExpireAt } =
        response.data;

      ApiConfig.saveTokens(
        token,
        refreshToken,
        tokenExpireAt,
        refreshTokenExpireAt
      );
      setAuthenticated(true);

      if (remember) rememberLogin(email, password);
      else {
        localStorage.removeItem("email_remember");
        localStorage.removeItem("password_remember");
      }

      navigate("/streamer/dashboard/donations");
    } catch (err: any) {
      setError({
        timestamp: new Date().toISOString(),
        status: err.response?.status || 500,
        error: err.response?.data?.error || "Internal Server Error",
        message: err.response?.data?.message || "Erro ao autenticar",
        path: "/login",
      });
    }
  };

  // Se estiver carregando (validando o token), mostre uma tela de carregamento ou null
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-zinc-900">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600"></div>
          <div className="w-4 h-4 rounded-full animate-pulse bg-purple-600 delay-75"></div>
          <div className="w-4 h-4 rounded-full animate-pulse bg-pink-500 delay-150"></div>
          <p className="text-zinc-600 dark:text-zinc-400 ml-3">Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Se a validação falhar ou não houver token, exibe a tela de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Alternar tema"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Alert Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        {error && (
          <Alert error={error} duration={5} onClose={() => setError(null)} />
        )}
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={logoDark}
                alt="Logo"
                className="w-20 h-20 rounded-full p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Login do Dashboard
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <User
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
              >
                Lembrar Login
              </label>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Não tem uma conta?{" "}
              <a
                href="/streamer/dashboard/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Fazer registro
              </a>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-600 mt-6">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de
          Privacidade
        </p>
      </div>
    </div>
  );
}

export default DashboardLogin;