import { useEffect, useState } from "react";
import { apiPublic } from "../../api/ApiConfig";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import ThemeButton from "../../components/buttons/ThemeButton";
import logoDark from "../../assets/logo.png"
import logoLight from "../../assets/logo-dark.png"


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


  function Logo() {
    const [logo, setLogo] = useState(
      document.body.classList.contains("dark") ? logoDark : logoLight
    );

    useEffect(() => {
      const body = document.body;

      // observa mudanças nos atributos do body
      const observer = new MutationObserver(() => {
        setLogo(body.classList.contains("dark") ? logoDark : logoLight);
      });

      observer.observe(body, { attributes: true, attributeFilter: ["class"] });

      return () => observer.disconnect(); // limpa o observer quando o componente desmonta
    }, []);

    return <img src={logo} alt="Logo" />;
  }


  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <ThemeButton />
      <div className="login-container">
        <Logo />
        <h2>Login do Dashboard</h2>
        {error && <Alert error={error} duration={5} onClose={() => setError(null)} />}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
          style={{ width: "100%", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          style={{ width: "100%", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
        />

        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Entrar
        </button>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <p>Lembrar Login</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardLogin;
