import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CreditCard, Eye, EyeOff, UserSquare } from 'lucide-react';
import ThemeButton from '../../../components/buttons/ThemeButton';
import logoDark from "../../../assets/logo.png"
import { ApiConfig } from '../../../api/ApiConfig';
import Alert from '../../../components/alerts/Alert';


function DashboardRegister() {
    const [, setSessionData] = useState<any | null>(null);
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    // Substitua a função handleSubmit existente por esta nova implementação

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Remover formatação do CPF para enviar apenas números
            const cleanCPF = cpf.replace(/\D/g, '');

            const registerData = {
                email: email.trim(),
                cpf: cleanCPF,
                password: password,
                nickname: nickname.trim(),
                fullName: fullName.trim()
            };

            const api = ApiConfig.getInstance(); // pega a instância do axios

            // Com axios, você passa os dados diretamente como segundo parâmetro
            const response = await api.post('/auth/register', registerData);

            // Com axios, os dados da resposta ficam em response.data
            const data = response.data;

            // Verificar se a resposta contém os campos esperados
            if (!data.sessionToken) {
                setError("Resposta inválida do servidor. Tente novamente.");
                return;
            }

            // Salvar sessionToken no localStorage para usar na verificação
            localStorage.setItem('verificationToken', data.sessionToken);
            localStorage.setItem('userEmail', email);

            // Redirecionar para página de verificação de código
            navigate('/streamer/dashboard/verify/email');

        } catch (err: any) {
            console.error("Erro na requisição:", err);

            // Com axios, os erros de resposta ficam em err.response
            if (err.response) {
                // Tratamento de diferentes códigos de erro
                switch (err.response.status) {
                    case 400:
                        const errorData = err.response.data;
                        setError({
                            timestamp: new Date().toISOString(),
                            status: 400,
                            error: "Bad Request",
                            message: errorData.message || "Dados inválidos. Verifique as informações fornecidas.",
                            path: "/streamer/dashboard/register",
                        });
                        break;
                    case 409:
                        setError({
                            timestamp: new Date().toISOString(),
                            status: 409,
                            error: "Conflict",
                            message: errorData.message || "Este e-mail ou CPF já está cadastrado.",
                            path: "/streamer/dashboard/register",
                        });
                        break;
                    case 429:
                        setError({
                            timestamp: new Date().toISOString(),
                            status: 400,
                            error: "Too Many Request",
                            message: errorData.message || "Muitas tentativas. Tente novamente mais tarde.",
                            path: "/streamer/dashboard/register",
                        });
                        break;
                    case 500:
                        setError({
                            timestamp: new Date().toISOString(),
                            status: 500,
                            error: "Too Many Request",
                            message: errorData.message || "Erro interno do servidor. Tente novamente em alguns minutos.",
                            path: "/streamer/dashboard/register",
                        });
                        break;
                    default:
                        setError({
                            timestamp: new Date().toISOString(),
                            status: 500,
                            error: "Too Many Request",
                            message: errorData.message || "Erro inesperado. Tente novamente.",
                            path: "/streamer/dashboard/register",
                        });
                }
            } else if (err.request) {
                // Erro de rede/conexão
                setError("Erro de conexão. Verifique sua internet e tente novamente.");
            } else {
                setError("Erro ao realizar cadastro. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const sessionToken = localStorage.getItem("verificationToken");
                if (!sessionToken) return;

                const api = ApiConfig.getPublicInstance();
                const response = await api.get("/email/auth/session-data", {
                    headers: {
                        "Session-Token": sessionToken,
                    },
                });

                setSessionData(response.data);

                // Se quiser preencher campos automaticamente
                if (response.data.email) setEmail(response.data.email);
                if (response.data.password) setPassword(response.data.password);
            } catch (err) {
                console.error("Erro ao buscar session data:", err);
            }
        };

        fetchSessionData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        if (!nickname.trim()) {
            setError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Nickname é obrigatório",
                path: "/streamer/dashboard/register",
            });

            return;
        }

        
        if (!fullName.trim()) {
            setError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Nome Completo é obrigatório",
                path: "/streamer/dashboard/register",
            });

            return;
        }

        if (!isValidCPF(cpf)) {
            setError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "CPF inválido",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!isValidEmail(email)) {
            setError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "E-mail inválido",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!isValidPassword(password)) {
            setError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Senha deve ter no mínimo 6 caracteres",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        await handleRegister();
    };


    // Função para formatar CPF
    const formatCPF = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length <= 11) {
            return cleanValue
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        return cleanValue.slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    // Função para validar CPF
    const isValidCPF = (cpf: string) => {
        const cleanCPF = cpf.replace(/\D/g, '');

        if (cleanCPF.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF[i]) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 >= 10) digit1 = 0;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF[i]) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 >= 10) digit2 = 0;

        return parseInt(cleanCPF[9]) === digit1 && parseInt(cleanCPF[10]) === digit2;
    };

    // Função para validar email
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Função para validar senha (mínimo 6 caracteres)
    const isValidPassword = (password: string) => {
        return password.length >= 6;
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedCPF = formatCPF(e.target.value);
        setCpf(formattedCPF);
    };

    const inputContainerStyle = {
        position: "relative" as const,
        marginBottom: "16px",
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }} className='donation-container'>
            <ThemeButton />
            <div className="login-container" style={{ maxWidth: "520px", width: "100%", padding: "40px 30px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                {error && <Alert error={error} duration={5} onClose={() => setError(null)} />}

                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <img src={logoDark} alt="" style={{ background: "rgb(17, 18, 19)", padding: "15px", borderRadius: "50%" }} />
                    <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "700" }}>Cadastro</h2>
                    <p style={{ fontSize: "14px", margin: 0 }}>Crie sua conta para acessar o dashboard</p>
                </div>



                <form onSubmit={handleSubmit}>
                    <div style={inputContainerStyle}>
                        <User size={20} className='icon-style' />
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Nickname"
                            style={{
                                borderColor: nickname.trim() ? "#4CAF50" : "#e0e0e0"
                            }}
                            className='input-dashboard-style'
                            required
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <UserSquare size={20} className='icon-style' />
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nome Completo"
                            style={{
                                borderColor: fullName.trim() ? "#4CAF50" : "#e0e0e0"
                            }}
                            className='input-dashboard-style'
                            required
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <CreditCard size={20} className='icon-style' />
                        <input
                            type="text"
                            value={cpf}
                            onChange={handleCPFChange}
                            placeholder="CPF (000.000.000-00)"
                            maxLength={14}
                            className='input-dashboard-style'
                            style={{
                                borderColor: isValidCPF(cpf) ? "#4CAF50" : cpf ? "#f44336" : "#e0e0e0"
                            }}
                            required
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <Mail size={20} className='icon-style' />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            style={{
                                borderColor: isValidEmail(email) ? "#4CAF50" : email ? "#f44336" : "#e0e0e0"
                            }}
                            className='input-dashboard-style'
                            required
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <Lock size={20} className='icon-style' />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha (mín. 6 caracteres)"
                            style={{
                                paddingRight: "48px",
                                borderColor: isValidPassword(password) ? "#4CAF50" : password ? "#f44336" : "#e0e0e0"
                            }}
                            className='input-dashboard-style'
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                            }}
                            className='eye-icon-style'
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className='button'
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                            }
                        }}

                        style={{ border: "none" }}
                    >
                        {isLoading ? "Cadastrando..." : "Criar Conta"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px"}}>
                    Já tem uma conta?{" "}
                    <a href="/streamer/dashboard/login" style={{padding: "2px 10px", borderRadius: "5px", textDecoration: "none", fontWeight: "500" }} className='a-dashboard'>
                        Fazer login
                    </a>
                </div>
            </div>
        </div>
    );
}

export default DashboardRegister;