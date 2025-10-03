import { useEffect, useState } from "react";
import { apiPublic, ApiConfig } from "../../../api/ApiConfig";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/alerts/Alert";
import ThemeButton from "../../../components/buttons/ThemeButton";
import logoDark from "../../../assets/logo.png";
import { Lock, User } from "lucide-react";
import { useAuth } from "../../../routes/AuthContext";

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpireAt: string;
  refreshTokenExpireAt: string;
}

function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any | null>(null);

  const { setAuthenticated } = useAuth(); // pega o setter do contexto
  const navigate = useNavigate();

  const rememberCheck = (): boolean => localStorage.getItem("remember_check") === "true";
  const [remember, setRemember] = useState<boolean>(rememberCheck());

  // Carrega email/senha se "lembrar login" estiver marcado
  useEffect(() => {
    if (remember) {
      const savedEmail = localStorage.getItem("email_remember") || "";
      const savedPassword = localStorage.getItem("password_remember") || "";
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, [remember]);

  // Atualiza o "remember_check" no localStorage
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
      const response = await apiPublic.post<LoginResponse>("/auth/login", { email, password });
      const { token, refreshToken, tokenExpireAt, refreshTokenExpireAt } = response.data;

      // Salva tokens nos cookies
      ApiConfig.saveTokens(token, refreshToken, tokenExpireAt, refreshTokenExpireAt);

      // Atualiza o contexto de autenticação
      setAuthenticated(true);

      // Salva email/senha se "lembrar login"
      if (remember) rememberLogin(email, password);
      else {
        localStorage.removeItem("email_remember");
        localStorage.removeItem("password_remember");
      }

      // Redireciona para dashboard
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

  const inputContainerStyle = { position: "relative" as const, marginBottom: "16px" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }} className="donation-container">
      <ThemeButton />
      <div className="login-container">
        <img
          src={logoDark}
          alt=""
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dvadwwvub/image/upload/v1759321086/wallpaper-4k_on1hrh.png')",
            padding: "12px",
            borderRadius: "50%",
          }}
        />
        <h2>Login do Dashboard</h2>
        {error && <Alert error={error} duration={5} onClose={() => setError(null)} />}

        <div style={inputContainerStyle}>
          <User size={20} className="icon-style" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            className="input-dashboard-style"
          />
        </div>

        <div style={inputContainerStyle}>
          <Lock size={20} className="icon-style" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            className="input-dashboard-style"
          />
        </div>

        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer" }}
        >
          Entrar
        </button>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <p>Lembrar Login</p>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Não tem uma conta?{" "}
          <a
            href="/streamer/dashboard/register"
            style={{ padding: "2px 10px", borderRadius: "5px", textDecoration: "none", fontWeight: "500" }}
            className="a-dashboard"
          >
            Fazer registro
          </a>
        </div>
      </div>
    </div>
  );
}

export default DashboardLogin;
