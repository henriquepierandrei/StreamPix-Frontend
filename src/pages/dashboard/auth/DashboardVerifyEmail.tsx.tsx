import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Clock, AlertTriangle } from 'lucide-react';
import ThemeButton from '../../../components/buttons/ThemeButton';
import logoDark from "../../../assets/logo.png";
import { ApiConfig } from '../../../api/ApiConfig';
import SuccessAlert from '../../../components/SuccessAlert';

// Interfaces
interface ErrorMessage {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

interface SuccessMessage {
    message: string;
    timestamp: string;
}

function DashboardVerifyEmail() {
    const navigate = useNavigate();

    // Estados principais
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [, setError] = useState<ErrorMessage | null>(null);
    const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

    // Estados dos dados da API
    const [emailTo, setEmailTo] = useState("");
    const [attemptsNumber, setAttemptsNumber] = useState(0);
    
    // Estados dos timers
    const [resendTimer, setResendTimer] = useState(0);
    const [codeExpireTimer, setCodeExpireTimer] = useState(0);
    const [displayCodeExpire, setDisplayCodeExpire] = useState("00:00");
    const [displayResend, setDisplayResend] = useState("00:00");

    // Funções auxiliares
    const createError = (status: number, error: string, message: string): ErrorMessage => ({
        timestamp: new Date().toISOString(),
        status,
        error,
        message,
        path: "/streamer/dashboard/verify/email",
    });

    const createSuccess = (message: string): SuccessMessage => ({
        message,
        timestamp: new Date().toISOString()
    });

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Buscar dados da API
    const fetchVerificationData = async () => {
        setIsLoadingData(true);
        try {
            const sessionToken = localStorage.getItem("verificationToken");
            if (!sessionToken) {
                setError(createError(404, "Not Found", "Token de sessão não encontrado. Faça o cadastro novamente."));
                navigate('/streamer/dashboard/register');
                return;
            }

            const api = ApiConfig.getPublicInstance();
            const response = await api.get("/email/auth/session-data", {
                headers: { "Session-Token": sessionToken },
            });

            const data = response.data;

            setResendTimer(data.timeRemainingInSeconds || 0);
            setCodeExpireTimer(data.codeExpireAtInSeconds || 0);
            setAttemptsNumber(data.attemptsNumber || 0);
            setEmailTo(data.email || "Nenhum email encontrado!");

            if (data.codeExpireAtInSeconds <= 0) {
                setError(createError(409, "Conflict", "Código expirado. Solicite um novo código."));
            }
        } catch (err: any) {
            console.error("Erro ao buscar dados de verificação:", err);
            
            if (err.response?.status === 401) {
                setError(createError(401, "Unauthorized", "Sessão expirada. Faça o cadastro novamente."));
                localStorage.removeItem("verificationToken");
                navigate('/streamer/dashboard/register');
            } else {
                setError(createError(500, "Internal Server Error", "Erro ao carregar dados. Tente novamente."));
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    // Verificar código
    const handleVerifyCode = async () => {
        // Validações
        if (!code.trim()) {
            setError(createError(400, "Bad Request", "Digite o código de verificação."));
            return;
        }
        if (code.length !== 6) {
            setError(createError(400, "Bad Request", "O código deve ter 6 dígitos."));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const sessionToken = localStorage.getItem("verificationToken");
            if (!sessionToken) {
                setError(createError(404, "Not Found", "Token de sessão não encontrado."));
                return;
            }

            const api = ApiConfig.getInstance();
            const response = await api.post('/email/auth/validate?code=' + code, {}, {
                headers: { "Session-Token": sessionToken }
            });

            if (response.data === true) {
                setSuccessMessage(createSuccess("E-mail verificado com sucesso!"));
                localStorage.removeItem("verificationToken");
                // Para obrigar a fazer o login novamente ou logar pela primeira vez em uma nova conta
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                setTimeout(() => navigate('/streamer/dashboard/login'), 2000);
            }
        } catch (err: any) {
            console.error("Erro na verificação:", err);
            
            if (err.response?.data?.attemptsNumber !== undefined) {
                setAttemptsNumber(err.response.data.attemptsNumber);
            }

            if (err.response) {
                const { status, data } = err.response;
                const errorMessages: { [key: number]: string } = {
                    400: data?.message || "Código inválido.",
                    429: "Muitas tentativas. Aguarde para tentar novamente.",
                    410: "Código expirado. Solicite um novo código.",
                };

                const message = errorMessages[status] || "Erro na verificação. Tente novamente.";
                setError(createError(status, data?.error || "Error", message));
            } else {
                setError(createError(503, "Service Unavailable", "Erro de conexão. Verifique sua internet."));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reenviar código
    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const oldSessionToken = localStorage.getItem("verificationToken");
            if (!oldSessionToken) {
                setError(createError(404, "Not Found", "Token de sessão não encontrado."));
                return;
            }

            const api = ApiConfig.getInstance();
            const response = await api.post('/email/auth/resend', null, {
                headers: { "Session-Token": oldSessionToken }
            });

            const data = response.data;
            setResendTimer(data.resendAvailableInSeconds || 300);
            setCodeExpireTimer(data.codeExpireAtInSeconds || 900);
            setAttemptsNumber(0);
            
            setSuccessMessage(createSuccess("Novo código enviado para seu e-mail!"));
            setCode("");

            if (data.sessionToken) {
                localStorage.setItem("verificationToken", data.sessionToken);
            }

        } catch (err: any) {
            console.error("Erro ao reenviar código:", err);
            setError(createError(
                err.response?.status || 500,
                err.response?.data?.error || "Internal Server Error",
                err.response?.data?.message || "Erro ao reenviar código."
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleVerifyCode();
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 6);
        setCode(value);
    };

    // Effects
    useEffect(() => {
        fetchVerificationData();
    }, []);

    // Timer countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setCodeExpireTimer(prev => Math.max(prev - 1, 0));
            setResendTimer(prev => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Update display timers
    useEffect(() => {
        setDisplayCodeExpire(formatTime(codeExpireTimer));
        setDisplayResend(formatTime(resendTimer));
    }, [codeExpireTimer, resendTimer]);

    // Computed values
    const isCodeExpiringSoon = codeExpireTimer <= 60 && codeExpireTimer > 0;
    const isLastAttempt = attemptsNumber >= 4;
    const isCodeExpired = codeExpireTimer <= 0;
    const isMaxAttemptsReached = attemptsNumber >= 5;
    const isSubmitDisabled = isLoading || isCodeExpired || isMaxAttemptsReached || code.length !== 6;
    const isResendDisabled = isLoading || resendTimer > 0;

    // Styles
    const containerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh"
    };

    const cardStyle = {
        maxWidth: "520px",
        width: "100%",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
    };

    const inputStyle = {
        textAlign: "center" as const,
        letterSpacing: "8px",
        fontSize: "18px",
        fontWeight: "600"
    };

    // Loading state
    if (isLoadingData) {
        return (
            <div style={containerStyle} className='donation-container'>
                <ThemeButton />
                <div className="login-container" style={{ ...cardStyle, textAlign: "center" }}>
                    <img src={logoDark} alt="" style={{ background: "rgb(17, 18, 19)", padding: "12px", borderRadius: "50%" }} />
                    <h2 style={{ margin: "0 0 20px 0", fontSize: "28px", fontWeight: "700" }}>Carregando...</h2>
                    <div style={{ fontSize: "14px", color: "#666" }}>Verificando status da verificação...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle} className='donation-container'>
            <ThemeButton />
            <div className="login-container" style={cardStyle}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <SuccessAlert
                        success={successMessage}
                        duration={4}
                        onClose={() => setSuccessMessage(null)}
                    />
                    
                    <img 
                        src={logoDark} 
                        alt="" 
                        style={{ background: "rgb(17, 18, 19)", padding: "15px", borderRadius: "50%" }} 
                    />
                    
                    <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "700" }}>
                        Verificar E-mail
                    </h2>
                    
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px 0" }}>
                        Digite o código de 6 dígitos enviado para:<br />
                        <strong>{emailTo}</strong>
                    </p>

                    {/* Status Info */}
                    <div className='container-attempts-time'>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}>
                            <span className={`expire-timer ${codeExpireTimer > 60 ? "safe" : "danger"}`}>
                                <Clock size={16} />
                                {displayCodeExpire}
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <AlertTriangle 
                                    size={16} 
                                    style={{ color: attemptsNumber >= 3 ? "#f44336" : "#666" }} 
                                />
                                <span style={{ 
                                    fontSize: "14px", 
                                    color: attemptsNumber >= 3 ? "#f44336" : "#666" 
                                }}>
                                    {attemptsNumber}/3 tentativas
                                </span>
                            </div>
                        </div>

                        {/* Warnings */}
                        {isCodeExpiringSoon && (
                            <div style={{ fontSize: "12px", color: "#f44336", textAlign: "center" }}>
                                ⚠️ Código expira em menos de 1 minuto!
                            </div>
                        )}

                        {isLastAttempt && (
                            <div style={{ fontSize: "12px", color: "#f44336", textAlign: "center" }}>
                                ⚠️ Última tentativa disponível!
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ position: "relative", marginBottom: "16px" }}>
                        <Lock size={20} className='icon-style' />
                        <input
                            type="text"
                            value={code}
                            onChange={handleCodeChange}
                            placeholder="000000"
                            maxLength={6}
                            style={inputStyle}
                            className='input-dashboard-style'
                            required
                            disabled={isCodeExpired || isMaxAttemptsReached}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className='button-email-validation'
                        style={{
                            opacity: isSubmitDisabled ? 0.6 : 1,
                            marginBottom: "15px"
                        }}
                    >
                        {isLoading ? "Verificando..." : "Verificar Código"}
                    </button>
                </form>

                {/* Resend Button */}
                <div style={{ textAlign: "center" }}>
                    <button
                        onClick={handleResendCode}
                        disabled={isResendDisabled}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "white",
                            textDecoration: "underline",
                            cursor: isResendDisabled ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            opacity: isResendDisabled ? 0.6 : 1
                        }}
                    >
                        Não recebeu o código? Reenviar
                        {resendTimer > 0 && (
                            <span style={{ fontSize: "12px", display: "block", color: "white" }}>
                                (disponível em {displayResend})
                            </span>
                        )}
                    </button>
                </div>

                {/* Help Link */}
                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "white" }}>
                    Problemas com a verificação?{" "}
                    <a 
                        href="/streamer/dashboard/register" 
                        style={{ 
                            color: "white", 
                            background: "rgb(16, 16, 17)", 
                            padding: "2px 5px", 
                            borderRadius: "5px", 
                            textDecoration: "none", 
                            fontWeight: "500" 
                        }}
                    >
                        Fazer novo cadastro
                    </a>
                </div>
            </div>
        </div>
    );
}

export default DashboardVerifyEmail;