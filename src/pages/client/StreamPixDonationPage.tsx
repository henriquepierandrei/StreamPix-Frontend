import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, UserX, XIcon } from 'lucide-react';
import logo from "../../assets/logo.png";
import logoDark from '../../assets/logo-dark.png';
import { useNavigate, useParams } from 'react-router-dom';
import { createDonationRequest, sendDonation, getStreamerData } from '../../api/DonationRequest';
import Loading from '../../components/Loading';
import Alert from '../../components/alerts/Alert';
import ThemeButton from '../../components/buttons/ThemeButton';
import AudioComponent from '../../components/audio/AudioComponent';
import { TermsPopup } from '../../components/terms/TermsPopup';

// Interfaces: Mantém 'min_amount' como string, de acordo com o retorno da API
interface StreamerSettings {
    min_amount: string;
    max_name_lenght: number;
    max_message_lenght: number;
    // Adicione outros campos que você espera aqui
}

interface DonationResponse {
    transaction_StreamPix_id: string;
    // ... outros campos ...
}

type PaymentStatus = 'pending' | 'success' | 'failed' | 'notfound' | 'error';

// A função formatAmount é mantida como um recurso defensivo geral, mas não é usada no fetch do minAmount,
// pois a API já o retorna como '0,01'.
// Se precisar usá-la em outro lugar, ela deve ser ajustada para primeiro trocar vírgula por ponto.
// Exemplo de ajuste: const num = Number(value.toString().replace(',', '.'));
const formatAmount = (value: number | string, fallback: string = "10,00"): string => {
    // Para funcionar defensivamente com entrada de string/number
    const valueString = value ? value.toString().replace(',', '.') : '0';
    const num = parseFloat(valueString);
    if (isNaN(num)) return fallback;
    return num.toFixed(2).replace('.', ',');
}


const StreamPixDonation: React.FC = () => {
    const navigate = useNavigate();
    const { streamerName } = useParams() as { streamerName?: string };
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
    const [currency] = useState('BRL');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
    const [voiceType, setVoiceType] = useState<string>('');
    const [voiceSettings, setVoiceSettings] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(false);

    // minAmount armazena o valor MÍNIMO como STRING formatada ("10,00" ou "0,01")
    const [minAmount, setMinAmount] = useState<string>("10,00");
    const [maxNameLength, setMaxNameLength] = useState(20);
    const [maxMessageLength, setMaxMessageLength] = useState(162);

    const isDark = localStorage.getItem("theme") === "dark";
    const currentLogo = isDark ? logoDark : logo;

    const quickAmounts = useMemo(() => [5, 10, 25, 50, 100], []);

    // ------------------- Lógica de Fetch -------------------

    useEffect(() => {
        if (!streamerName) return;

        const fetchStreamer = async () => {
            try {
                setLoading(true);
                // Asserção de tipo para resolver o erro 'data is of type unknown'
                const data = await getStreamerData(streamerName) as StreamerSettings;

                // CORREÇÃO: Usa diretamente o valor da API, que já vem formatado como string
                // Se 'data.min_amount' for vazio/nulo, usa '0,01' como fallback.
                setMinAmount(data.min_amount || "0,01");

                setMaxNameLength(data.max_name_lenght || 20);
                setMaxMessageLength(data.max_message_lenght || 162);
            } catch (err) {
                console.error("Erro ao carregar streamer:", err);
                setPaymentStatus('notfound');
            } finally {
                setLoading(false);
            }
        };

        fetchStreamer();
    }, [streamerName]);

    // ------------------- Handlers -------------------

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString());
        setSelectedQuickAmount(value);
    };

    const handleSubmit = async () => {
        // Converte o minAmount (string com vírgula) para float numérico para comparação
        const numericMinAmount = parseFloat(minAmount.replace(',', '.'));

        // Converte o amount (string com vírgula ou ponto) para float numérico
        const numericAmount = parseFloat(amount.replace(',', '.'));

        if (!voiceType) {
            setError({ message: "Selecione uma voz para sua mensagem!" });
            return;
        }

        // Validação: Checa se o valor é válido e se é maior ou igual ao mínimo
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount < numericMinAmount) {
            setError({ message: `O valor mínimo é R$ ${minAmount}` });
            return;
        }

        setLoading(true);
        setError(false);

        const donation = createDonationRequest(
            streamerName!,
            username,
            message,
            // Certifique-se de que 'amount' é enviado no formato que o backend espera (geralmente ponto ou apenas número)
            amount.replace(',', '.'), // Enviando com ponto decimal, que é o padrão da maioria das APIs
            voiceType,
            voiceSettings
        );

        try {
            // Asserção de tipo para resolver o erro 'response is of type unknown'
            const response = await sendDonation(donation) as DonationResponse;
            const transactionId = response.transaction_StreamPix_id;
            navigate(`/donation/${transactionId}`);
        } catch (error: any) {
            const apiError = error.response?.data;
            setError(apiError || { message: "Erro desconhecido ao processar a doação." });
            console.error('Erro ao enviar doação:', error);
        } finally {
            setLoading(false);
        }
    };

    // ------------------- Renderização de Status de Erro -------------------

    const ErrorScreen = ({ status, title, description, icon: Icon }: { status: PaymentStatus, title: string, description: string, icon: React.FC<any> }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute top-8 left-8">
                <button
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft size={24} />
                </button>
            </div>
            <img src={currentLogo} alt="Logo" className="absolute top-8 w-10 h-10" style={{ left: '50%', transform: 'translateX(-50%)' }} />

            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl text-center w-full max-w-sm transition-transform duration-300 transform scale-100 hover:scale-105">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg ${status === 'notfound' ? 'bg-indigo-500' : 'bg-red-500'}`}>
                    <Icon size={32} color="white" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );

    if (loading) return <Loading />;

    if (paymentStatus === 'notfound') {
        return (
            <ErrorScreen
                status="notfound"
                title="Streamer Não Encontrado"
                description="Não foi possível localizar o streamer. Verifique o nome e tente novamente."
                icon={UserX}
            />
        );
    }

    if (paymentStatus === 'error') {
        return (
            <ErrorScreen
                status="error"
                title="Erro ao Processar Doação"
                description="Houve um problema ao enviar sua doação. Por favor, tente novamente mais tarde."
                icon={XIcon}
            />
        );
    }

    // ------------------- Renderização Principal do Formulário -------------------

    return (
        // Container: Fundo dinâmico e centralização
        <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300'>

            {/* Botão de Tema no canto */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeButton />
            </div>

            {/* Alert de Erro (Fixo no topo) */}
            {error && (
                <div className="fixed top-0 left-0 right-0 z-50 p-4">
                    <Alert error={error} />
                </div>
            )}

            {/* Card Principal do Formulário */}
            <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">

                {/* Header do Card */}
                <div className='flex items-center gap-4 mb-8 border-b pb-4 border-gray-100 dark:border-gray-700'>
                    <img src={currentLogo} alt="Logo" className="w-10 h-10 p-2 rounded-lg bg-indigo-600 shadow-lg" />
                    <h1 className='text-2xl font-extrabold text-gray-900 dark:text-white'>
                        Doar para <span className='text-indigo-600'>{streamerName}</span>
                    </h1>
                </div>

                {/* Seção de Nome */}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Seu nome de usuário
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Anônimo (opcional)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={maxNameLength}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-300 shadow-sm"
                    />
                    <p className="text-xs text-right text-gray-400 dark:text-gray-500 mt-1">
                        Máx. {maxNameLength} caracteres
                    </p>
                </div>

                {/* Seção de Valores Rápidos */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valores Rápidos:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleQuickAmount(value)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-md ${selectedQuickAmount === value
                                    ? 'bg-indigo-600 text-white shadow-indigo-500/50 scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-indigo-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-indigo-700 dark:hover:text-white'
                                    }`}
                            >
                                R$ {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seção de Mensagem */}
                <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mensagem de Apoio (Opcional)
                    </label>
                    <div className="relative">
                        <textarea
                            id="message"
                            placeholder="Sua mensagem de apoio..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={maxMessageLength}
                            rows={4}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-300 shadow-sm resize-none"
                        />
                        <div className="absolute bottom-2 right-3 text-xs text-gray-400 dark:text-gray-500">
                            {message.length}/{maxMessageLength}
                        </div>
                    </div>
                </div>

                {/* Componente de Áudio (Assumindo que ele tem suas próprias classes Tailwind) */}
                <div className="mb-6">
                    <AudioComponent
                        onVoiceChange={(voiceId, settings) => {
                            setVoiceType(voiceId);
                            setVoiceSettings(settings);
                        }}
                    />
                </div>

                {/* Seção de Valor da Doação */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor da Doação
                    </label>
                    {/* CORREÇÃO: Removido 'gap-2' para unir os campos */}
                    <div className="flex">
                        <select
                            value={currency}
                            // Alterado: Removido rounded-l-lg e adicionado rounded-l-xl (melhor estética) e sem border-r
                            className="p-3 border border-gray-300 dark:border-gray-600 rounded-l-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-colors duration-300 border-r-0 focus:outline-none"
                            disabled
                        >
                            <option value="BRL">BRL</option>
                        </select>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                                // Garantir que a alteração do valor não resulte em um valor negativo no estado
                                const value = e.target.value;
                                if (parseFloat(value) >= 0 || value === '') {
                                    setAmount(value);
                                    setSelectedQuickAmount(null); // Desseleciona valor rápido
                                }
                            }}
                            // Adicionado: min="0" para validação nativa do navegador
                            min="0"
                            step={0.01}
                            className="
        flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-r-xl 
        focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 
        text-gray-900 dark:text-white transition-shadow duration-300 shadow-sm z-10 min-w-0
        
        // Classes Tailwind para remover as setas nativas (scroll)
        [appearance:textfield] 
        [&::-webkit-inner-spin-button]:m-0 
        [&::-webkit-outer-spin-button]:m-0
    "
                        />
                    </div>
                    {/* Exibe o valor mínimo como string formatada */}
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        Valor mínimo: R$ {minAmount}
                    </p>
                </div>

                {/* Botão de Envio */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full py-3 bg-indigo-600 text-white font-extrabold rounded-lg shadow-xl shadow-indigo-500/50 hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-400"
                    disabled={loading}
                >
                    {loading ? 'PROCESSANDO...' : 'CONTINUAR'}
                </button>

                {/* Popup de Termos e Condições */}
                <TermsPopup />

            </div>

            {/* Footer com Branding */}
            <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <img src={currentLogo} alt="Logo" className="w-6 h-6 p-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className='text-sm font-semibold'>
                        <span className='text-indigo-600 font-extrabold'>StreamPix</span> - Doações Simplificadas
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StreamPixDonation;