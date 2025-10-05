import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight, RefreshCw, Moon, Sun } from 'lucide-react';
import { ApiConfig } from '../../../api/ApiConfig';
import { useTheme } from '../../../hooks/ThemeContextType';

// ========================================
// INTERFACES
// ========================================
interface ErrorMessage {
    type: 'streamer_not_found' | 'invalid_token' | 'expired_token' | 'missing_params' | 'unknown';
    message: string;
}

interface SuccessResponse {
    success: boolean;
    message: string;
    token: string;
    streamerId: string;
    email: string;
}

type VerificationStatus = 'verifying' | 'success' | 'error';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
function DashboardVerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isDarkMode, toggleTheme } = useTheme();

    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [error, setError] = useState<ErrorMessage | null>(null);
    const [successData, setSuccessData] = useState<SuccessResponse | null>(null);
    const [countdown, setCountdown] = useState(5);

    const hasVerified = useRef(false);
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);

    // ========================================
    // CLEANUP DO INTERVALO
    // ========================================
    useEffect(() => {
        return () => {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, []);

    // ========================================
    // CONTAGEM REGRESSIVA
    // ========================================
    const startCountdown = () => {
        countdownInterval.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownInterval.current) {
                        clearInterval(countdownInterval.current);
                    }
                    navigate('/streamer/dashboard/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ========================================
    // CLASSIFICAR TIPO DE ERRO PELA MENSAGEM
    // ========================================
    const classifyError = (message: string): ErrorMessage['type'] => {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('streamer não encontrado')) {
            return 'streamer_not_found';
        }
        if (lowerMessage.includes('token inválido') || lowerMessage.includes('token invalido')) {
            return 'invalid_token';
        }
        if (lowerMessage.includes('token expirado') || lowerMessage.includes('expirado')) {
            return 'expired_token';
        }
        
        return 'unknown';
    };

    // ========================================
    // VERIFICAÇÃO DO EMAIL
    // ========================================
    const verifyEmailToken = async () => {
        const streamerId = searchParams.get('streamerId');
        const token = searchParams.get('token');

        if (!streamerId || !token) {
            setStatus('error');
            setError({
                type: 'missing_params',
                message: "Link de verificação inválido. Parâmetros obrigatórios não encontrados."
            });
            return;
        }

        try {
            const api = ApiConfig.getInstance();

            const response = await api.get<SuccessResponse>(
                `/email-auth/confirm-email?streamerId=${streamerId}&token=${token}`
            );
            
            if (response.data.success === true) {
                setSuccessData(response.data);
                setStatus('success');
                startCountdown();
            } else {
                throw new Error(response.data.message || 'Erro desconhecido na verificação');
            }
        } catch (err: any) {
            console.error("Erro na verificação:", err);
            setStatus('error');

            const apiMessage = err.response?.data?.message || 
                              err.response?.data || 
                              err.message || 
                              "Erro ao verificar email. Tente novamente mais tarde.";

            const errorType = classifyError(apiMessage);

            setError({
                type: errorType,
                message: apiMessage
            });
        }
    };

    // ========================================
    // EXECUTAR VERIFICAÇÃO (APENAS UMA VEZ)
    // ========================================
    useEffect(() => {
        if (!hasVerified.current) {
            hasVerified.current = true;
            verifyEmailToken();
        }
    }, []);

    // ========================================
    // OBTER MENSAGENS DE AJUDA BASEADAS NO ERRO
    // ========================================
    const getErrorHelpText = (): string => {
        switch (error?.type) {
            case 'streamer_not_found':
                return "A conta associada a este link não foi encontrada. Verifique se o link está correto.";
            case 'invalid_token':
                return "O token de verificação é inválido. Certifique-se de usar o link completo enviado por email.";
            case 'expired_token':
                return "O link de verificação expirou. Solicite um novo link de verificação.";
            case 'missing_params':
                return "O link está incompleto. Verifique se copiou o link completo do email.";
            default:
                return "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.";
        }
    };

    // ========================================
    // VERIFICAR SE DEVE MOSTRAR BOTÃO DE REENVIO
    // ========================================
    const shouldShowResendButton = (): boolean => {
        return error?.type === 'expired_token' || error?.type === 'missing_params';
    };

    // ========================================
    // RENDERIZAÇÃO
    // ========================================
    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="flex flex-col items-center justify-center space-y-6 py-12">
                        <Loader size={64} className="text-blue-600 dark:text-blue-400 animate-spin" strokeWidth={2.5} />
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Verificando seu email
                        </h2>
                        <p className="text-center text-zinc-600 dark:text-zinc-400 max-w-md">
                            Aguarde um momento enquanto validamos suas informações de forma segura.
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        <CheckCircle size={72} className="text-green-500 dark:text-green-400" strokeWidth={2} />
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                            Email Verificado!
                        </h2>
                        <p className="text-center text-zinc-600 dark:text-zinc-400 max-w-md">
                            {successData?.message || "Parabéns! Sua conta foi ativada com sucesso e você já pode fazer login."}
                        </p>
                        
                        {successData?.email && (
                            <div className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">
                                {successData.email}
                            </div>
                        )}

                        <div className="w-full p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                            <p className="text-center text-sm text-green-700 dark:text-green-400">
                                Redirecionando automaticamente em <strong>{countdown}</strong>s
                            </p>
                        </div>
                        
                        <button
                            onClick={() => navigate('/streamer/dashboard/login')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            Ir para Login
                            <ArrowRight size={20} />
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        <XCircle size={72} className="text-red-500 dark:text-red-400" strokeWidth={2} />
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                            Verificação Falhou
                        </h2>
                        <p className="text-center text-zinc-600 dark:text-zinc-400 max-w-md">
                            {error?.message}
                        </p>

                        <div className="w-full p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-center text-sm text-red-700 dark:text-red-400">
                                {getErrorHelpText()}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            {shouldShowResendButton() ? (
                                <button
                                    onClick={() => navigate('/streamer/dashboard/register')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                    <RefreshCw size={18} />
                                    Solicitar Novo Link
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/streamer/dashboard/register')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                    <RefreshCw size={18} />
                                    Fazer Novo Cadastro
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/streamer/dashboard/login')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
                            >
                                Ir para Login
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                );
        }
    };

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

            {/* Verification Card */}
            <div className="w-full max-w-2xl px-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default DashboardVerifyEmail;