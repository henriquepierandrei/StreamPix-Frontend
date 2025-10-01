import { useEffect, useState } from "react";
import { apiPublic, ApiConfig } from "../../../api/ApiConfig";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/alerts/Alert";
import ThemeButton from "../../../components/buttons/ThemeButton";
import logoDark from "../../../assets/logo.png"
import { Lock, User } from "lucide-react";

function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any | null>(null);

  // Função para verificar se o usuário marcou "lembrar login"
  const rememberCheck = (): boolean => {
    return localStorage.getItem("remember_check") === "true";
  };

  // useState inicializa com o valor do localStorage
  const [remember, setRemember] = useState<boolean>(rememberCheck());

  const navigate = useNavigate();

  // Carregar email e senha lembrados ao montar se remember for true
  useEffect(() => {
    if (remember) {
      const savedEmail = localStorage.getItem("email_remember") || "";
      const savedPassword = localStorage.getItem("password_remember") || "";
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, [remember]);

  // Atualiza o "remember_check" no localStorage quando checkbox muda
  useEffect(() => {
    localStorage.setItem("remember_check", remember ? "true" : "false");
  }, [remember]);

  // Função para salvar email e senha no localStorage
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
      const response = await apiPublic.post("/auth/login", { email, password });
      const { token, refreshToken, tokenExpireAt, refreshTokenExpireAt } = response.data;

      // Usa o método do ApiConfig para salvar tokens nos cookies
      ApiConfig.saveTokens(token, refreshToken, tokenExpireAt, refreshTokenExpireAt);

      // Salva email e senha no localStorage se "lembrar login" estiver marcado
      if (remember) {
        rememberLogin(email, password);
      } else {
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

  const inputContainerStyle = {
    position: "relative" as const,
    marginBottom: "16px",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }} className="donation-container">
      <ThemeButton />
      <div className="login-container">
        <img src={logoDark} alt="" style={{ backgroundImage: "url('https://res.cloudinary.com/dvadwwvub/image/upload/v1759321086/wallpaper-4k_on1hrh.png')", padding: "12px", borderRadius: "50%" }} />
        <h2>Login do Dashboard</h2>
        {error && <Alert error={error} duration={5} onClose={() => setError(null)} />}

        <div style={inputContainerStyle}>
          <User size={20} className='icon-style' />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            className='input-dashboard-style'
          />
        </div>

        <div style={inputContainerStyle}>
        <Lock size={20} className='icon-style' />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            className='input-dashboard-style'
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
          <a href="/streamer/dashboard/register" style={{padding: "2px 10px", borderRadius: "5px", textDecoration: "none", fontWeight: "500" }} className="a-dashboard">
            Fazer registro
          </a>
        </div>
      </div>

    </div>
  );
}

export default DashboardLogin;
