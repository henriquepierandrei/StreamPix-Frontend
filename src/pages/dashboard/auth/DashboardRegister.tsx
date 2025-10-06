import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CreditCard, Eye, EyeOff, UserSquare, Moon, Sun } from 'lucide-react';
import logoDark from "../../../assets/logo.png";
import { ApiConfig } from '../../../api/ApiConfig';
import Alert from '../../../components/alerts/Alert';
import { useTheme } from '../../../hooks/ThemeContextType';
import SuccessAlert from '../../../components/alerts/SuccessAlert';

// Interface de resposta de registro atualizada (removido sessionToken)
interface RegisterResponse {
    email?: string;
    password?: string;
    message?: string;
}

// SessionDataResponse não é mais usada, mas mantida por clareza se for usada em outro lugar
interface SessionDataResponse {
    email?: string;
    password?: string;
}

interface ErrorResponse {
    message?: string;
}

// Interface de erro mais limpa para o state
interface AppError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

function DashboardRegister() {
    // setSessionData removido, pois não é mais usado
    const { isDarkMode, toggleTheme } = useTheme();

    // --- LÓGICA DE ESTADO DO ALERTA CORRIGIDA ---
    const [alertState, setAlertState] = useState<any>(null); // State para Sucesso
    const [error, setError] = useState<AppError | null>(null); // State para Erro

    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // --- FUNÇÕES DE ALERTA E REDIRECIONAMENTO ---

    /**
     * Limpa o erro e exibe a mensagem de sucesso, forçando o timestamp para reiniciar a animação.
     */
    const showSuccess = (message: string, path?: string) => {
        // CRUCIAL: Limpa o estado de erro antes de mostrar o sucesso.
        setError(null);
        setAlertState({
            message: message,
            path: path,
            timestamp: Date.now().toString(),
        });
    };

    /**
     * Limpa o sucesso e exibe o erro.
     */
    const handleError = (errorDetails: any) => {
        // CRUCIAL: Limpa o estado de sucesso antes de mostrar o erro.
        setAlertState(null);
        setError(errorDetails);
    };

    /**
     * Função para fechar o alerta de sucesso (chamada pelo SuccessAlert).
     */
    const hideAlert = () => {
        setAlertState(null);
    };

    /**
     * Função de redirecionamento (usa o hook useNavigate).
     */
    const handleRedirect = (path: string) => {
        navigate(path);
    };

    // --- LÓGICA DE REGISTRO E CHAMADA DE API ---

    const handleRegister = async () => {
        setIsLoading(true);

        try {
            const cleanCPF = cpf.replace(/\D/g, '');

            const registerData = {
                email: email.trim(),
                cpf: cleanCPF,
                password: password,
                nickname: nickname.trim(),
                fullName: fullName.trim()
            };

            const apiInstance = ApiConfig.getInstance();
            // A API é chamada e, se for bem-sucedida (status 2xx), continua
            await apiInstance.post<RegisterResponse>('/auth/register', registerData);

            // Se o await acima não lançou erro, a requisição foi bem-sucedida.
            // O successAlert será exibido e o redirecionamento será iniciado.
            showSuccess("Verifique seu email! Redirecionando para o login.", "/streamer/dashboard/login")

        } catch (err: any) {
            console.error("Erro na requisição:", err);

            if (err.response) {
                const errorData = err.response.data as ErrorResponse;
                let errorMessage: string = "Ocorreu um erro desconhecido.";
                let errorStatus: number = err.response.status;
                let errorTitle: string = "Erro";

                switch (err.response.status) {
                    case 400:
                        errorTitle = "Bad Request";
                        errorMessage = errorData.message || "Dados inválidos. Verifique as informações fornecidas.";
                        break;
                    case 409:
                        errorTitle = "Conflict";
                        errorMessage = errorData.message || "Este e-mail ou CPF já está cadastrado.";
                        break;
                    default:
                        errorTitle = "Server Error";
                        errorMessage = errorData.message || "Erro no servidor. Tente novamente mais tarde.";
                        break;
                }

                handleError({
                    timestamp: new Date().toISOString(),
                    status: errorStatus,
                    error: errorTitle,
                    message: errorMessage,
                    path: "/streamer/dashboard/register",
                });
            } else if (err.request) {
                handleError({
                    timestamp: new Date().toISOString(),
                    status: 0,
                    error: "Network Error",
                    message: "Erro de conexão. Verifique sua internet e tente novamente.",
                    path: "/streamer/dashboard/register",
                });
            } else {
                // Simplificação para erros de setup do request
                handleError({
                    timestamp: new Date().toISOString(),
                    status: 500,
                    error: "Internal Error",
                    message: "Erro ao realizar cadastro. Tente novamente.",
                    path: "/streamer/dashboard/register",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- CÓDIGO RESTANTE (mantido) ---

    // useEffect vazio removido, pois não há mais fetchSessionData

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS E FORMATO (Agora usando handleError)

        if (!nickname.trim()) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Nickname é obrigatório",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!fullName.trim()) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Nome Completo é obrigatório",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!isValidCPF(cpf)) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "CPF inválido",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!isValidEmail(email)) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "E-mail inválido",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        if (!isValidPassword(password)) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "Senha deve ter no mínimo 6 caracteres",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        // VALIDAÇÃO: CONFIRMAÇÃO DE SENHA
        if (password !== confirmPassword) {
            handleError({
                timestamp: new Date().toISOString(),
                status: 400,
                error: "Bad Request",
                message: "As senhas não coincidem. Por favor, verifique a confirmação.",
                path: "/streamer/dashboard/register",
            });
            return;
        }

        await handleRegister();
    };


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

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPassword = (password: string) => {
        return password.length >= 6;
    };

    // Variável auxiliar para estilização da confirmação
    const isConfirmMatch = password === confirmPassword && !!confirmPassword;

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedCPF = formatCPF(e.target.value);
        setCpf(formattedCPF);
    };

    const getInputBorderColor = (isValid: boolean, hasValue: boolean) => {
        if (!hasValue) return 'border-zinc-200 dark:border-zinc-700';
        return isValid ? 'border-green-500 dark:border-green-600' : 'border-red-500 dark:border-red-600';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300 py-12 px-4">

            {/* 1. SuccessAlert Fica no canto inferior direito (padrão) */}
            <SuccessAlert
                success={alertState}
                onClose={hideAlert}        // Passa a função para remover o alerta do estado
                onRedirect={handleRedirect}/>
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Alternar tema"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* 2. Error Alert Container Fica no topo central */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                {error && <Alert error={error} duration={5} onClose={() => setError(null)} />}
            </div>

            {/* Register Card */}
            <div className="w-full max-w-lg">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <img
                                src={logoDark}
                                alt="Logo"
                                className="w-20 h-20 rounded-full p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/1e40af/ffffff?text=Logo'; }} // Fallback
                            />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                            Cadastro
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Crie sua conta para acessar o dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nickname */}
                        <div className="relative">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Nickname"
                                className={`w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(!!nickname.trim(), !!nickname)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                        </div>

                        {/* Full Name */}
                        <div className="relative">
                            <UserSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nome Completo"
                                className={`w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(!!fullName.trim(), !!fullName)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                        </div>

                        {/* CPF */}
                        <div className="relative">
                            <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type="text"
                                value={cpf}
                                onChange={handleCPFChange}
                                placeholder="CPF (000.000.000-00)"
                                maxLength={14}
                                className={`w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(isValidCPF(cpf), !!cpf)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className={`w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(isValidEmail(email), !!email)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha (mín. 6 caracteres)"
                                className={`w-full pl-12 pr-12 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(isValidPassword(password), !!password)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                            {/* Toggle para a Senha Normal */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center"
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password - AGORA COM SEU PRÓPRIO TOGGLE */}
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type={showConfirmPassword ? "text" : "password"} // Usa o novo estado
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirme a Senha"
                                className={`w-full pl-12 pr-12 py-3 bg-zinc-50 dark:bg-zinc-800 border ${getInputBorderColor(isConfirmMatch, !!confirmPassword)} rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200`}
                                required
                            />
                            {/* Toggle para a Confirmação de Senha */}
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggla o novo estado
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center"
                                aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-400 disabled:to-zinc-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                        >
                            {isLoading ? "Cadastrando..." : "Criar Conta"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Já tem uma conta?{" "}
                            <a
                                href="/streamer/dashboard/login"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Fazer login
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-600 mt-6">
                    Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
                </p>
            </div>
        </div>
    );
}

export default DashboardRegister;
