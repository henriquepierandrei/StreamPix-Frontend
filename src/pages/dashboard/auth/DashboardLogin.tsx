import { useEffect, useState } from "react";
import { apiPublic } from "../../../api/ApiConfig";
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

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpireAt", tokenExpireAt);
      localStorage.setItem("refreshTokenExpireAt", refreshTokenExpireAt);

      // Salva email e senha se "lembrar login" estiver marcado
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
        <img src={logoDark} alt="" style={{ backgroundImage: "url('https://messages-prod.27c852f3500f38c1e7786e2c9ff9e48f.r2.cloudflarestorage.com/bcbbcffd-e6d3-4c09-97ff-35dd10e77370/1759271457417-01999cbe-77bd-7a3b-b020-19dbfd47a644.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=c86e09ae0bc1d897b03dfaa30a8b51f3%2F20250930%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20250930T223058Z&X-Amz-Expires=3600&X-Amz-Signature=9b1038fb13e5b344496677d7180833f3efab08cd49fdf69fc14b352c349f400d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject')", padding: "12px", borderRadius: "50%" }} />
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
