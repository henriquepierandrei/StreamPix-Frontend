import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight, RefreshCw } from 'lucide-react';
import ThemeButton from '../../../components/buttons/ThemeButton';
import { ApiConfig } from '../../../api/ApiConfig';
import './VerifyEmail.css';

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

    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [error, setError] = useState<ErrorMessage | null>(null);
    const [successData, setSuccessData] = useState<SuccessResponse | null>(null);
    const [countdown, setCountdown] = useState(5);

    // Refs para evitar múltiplas execuções e memory leaks
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

        // Validação de parâmetros
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

            const response = await api.get(
                `/email-auth/confirm-email?streamerId=${streamerId}&token=${token}`
            );

            // Verificar se a resposta indica sucesso
            if (response.data?.success === true) {
                setSuccessData(response.data);
                setStatus('success');
                startCountdown();
            } else {
                // Se não tiver success: true, tratar como erro
                throw new Error(response.data?.message || 'Erro desconhecido na verificação');
            }
        } catch (err: any) {
            console.error("Erro na verificação:", err);
            setStatus('error');

            // Extrair mensagem de erro da API
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
                    <div className="verify-email-wrapper">
                        <Loader size={64} className="verify-email-spinner" strokeWidth={2.5} />
                        <h2 className="verify-email-title">Verificando seu email</h2>
                        <p className="verify-email-description">
                            Aguarde um momento enquanto validamos suas informações de forma segura.
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="verify-email-wrapper">
                        <CheckCircle size={72} className="verify-email-icon-success" strokeWidth={2} />
                        <h2 className="verify-email-title-success">Email Verificado!</h2>
                        <p className="verify-email-description">
                            {successData?.message || "Parabéns! Sua conta foi ativada com sucesso e você já pode fazer login."}
                        </p>
                        
                        {successData?.email && (
                            <div style={{ 
                                fontSize: '14px', 
                                color: '#64748b', 
                                marginTop: '-12px',
                                fontWeight: '500'
                            }}>
                                {successData.email}
                            </div>
                        )}

                        <div className="verify-email-info-box verify-email-success-box">
                            <p>
                                Redirecionando automaticamente em <strong>{countdown}</strong>s
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/streamer/dashboard/login')}
                            className="verify-email-btn-primary"
                        >
                            Ir para Login
                            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="verify-email-wrapper">
                        <XCircle size={72} className="verify-email-icon-error" strokeWidth={2} />
                        <h2 className="verify-email-title-error">Verificação Falhou</h2>
                        <p className="verify-email-description">{error?.message}</p>

                        <div className="verify-email-info-box verify-email-error-box">
                            <p>{getErrorHelpText()}</p>
                        </div>

                        <div className="verify-email-button-group">
                            {shouldShowResendButton() ? (
                                <button
                                    onClick={() => navigate('/streamer/dashboard/register')}
                                    className="verify-email-btn-primary"
                                >
                                    <RefreshCw size={18} style={{ marginRight: '8px' }} />
                                    Solicitar Novo Link
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/streamer/dashboard/register')}
                                    className="verify-email-btn-primary"
                                >
                                    <RefreshCw size={18} style={{ marginRight: '8px' }} />
                                    Fazer Novo Cadastro
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/streamer/dashboard/login')}
                                className="verify-email-btn-primary"
                            >
                                Ir para Login
                                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className='donation-container'>
            <ThemeButton />
            <div className="login-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default DashboardVerifyEmail;