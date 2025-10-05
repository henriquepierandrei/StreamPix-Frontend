import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from "../../components/navbar/NavBarDashboard";
import { Eye, EyeOff, Save, Settings, User, DollarSign, Loader2, AlertCircle } from "lucide-react";

// Interface padronizada
interface StreamerData {
    nickname: string;
    // Corrigida para manter como number, o tratamento é feito na busca dos dados
    streamer_balance: number; 
    is_auto_play: boolean;
    min_amount: number;
    max_characters_name: number;
    max_characters_message: number;
    qr_code_is_dark_theme: boolean;
    add_messages_bellow: boolean;
    donate_is_dark_theme: boolean;
    http_response: {
        status: string;
        message: string;
    };
}

// Estado inicial padronizado
const initialStreamerData: StreamerData = {
    nickname: "Carregando...",
    streamer_balance: 0,
    is_auto_play: false,
    min_amount: 0,
    max_characters_name: 0,
    max_characters_message: 0,
    qr_code_is_dark_theme: false,
    add_messages_bellow: false,
    donate_is_dark_theme: false,
    http_response: {
        status: "WAIT",
        message: "Carregando dados..."
    }
};

function StreamerSettings() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Streamer");
    const [streamerData, setStreamerData] = useState<StreamerData>(initialStreamerData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false); 
    const [alertMessage, setAlertMessage] = useState("");

    // Estado do blur, lendo do localStorage
    const [balanceBlurred, setBalanceBlurred] = useState(() => {
        const saved = localStorage.getItem('balanceBlurred');
        return saved ? JSON.parse(saved) : true;
    });

    // Função para alternar o blur
    const toggleBalanceBlur = () => {
        setBalanceBlurred((prev: boolean) => {
            const newState = !prev;
            localStorage.setItem('balanceBlurred', JSON.stringify(newState));
            return newState;
        });
    };

    // Função genérica para atualizar campos do formulário
    const updateField = (field: keyof StreamerData, value: any) => {
        setStreamerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Efeito para exibir mensagens de sucesso/erro da API
    useEffect(() => {
        if (streamerData.http_response.status === "SUCCESS") {
            setAlertMessage("Configurações salvas com sucesso! 🎉");
            const timer = setTimeout(() => setAlertMessage(""), 3000);
            return () => clearTimeout(timer);
        } else if (streamerData.http_response.status === "CONFLICT" || streamerData.http_response.status === "ERROR") {
            setAlertMessage(`Erro: ${streamerData.http_response.message || "Falha ao salvar."} 🚨`);
            const timer = setTimeout(() => setAlertMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [streamerData.http_response]);

    // Lógica para salvar os dados
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put<{ http_response: { status: string; message: string } }>(
                `/streamer`,
                streamerData
            );
            
            setStreamerData(prev => ({
                ...prev,
                http_response: response.data.http_response
            }));

        } catch (err) {
            console.error("Erro ao salvar streamer:", err);
            setStreamerData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "Falha na comunicação com o servidor."
                }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    // Buscar dados do streamer ao carregar o componente
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await getStreamerData(); // Recebe os dados, potencialmente com streamer_balance: "0,06"
                
                // --- CORREÇÃO DE TIPO APLICADA AQUI ---
                const rawBalance = (data as any).streamer_balance; 
                const cleanedBalance = String(rawBalance).replace(',', '.');
                
                setStreamerData({
                    ...(data as StreamerData),
                    streamer_balance: parseFloat(cleanedBalance) || 0, // Garante que seja um número (e 0 se falhar)
                } as StreamerData); 
                
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
                // navigate("/streamer/dashboard/login"); 
            } finally {
                setIsLoading(false);
            }
        })();
    }, [navigate]);

    // Componente auxiliar para o botão de salvar
    const SaveButton = () => (
        <button
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:transform-none mt-8"
            onClick={handleSave}
            disabled={isSaving || isLoading}
        >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64">
            <NavBarDashboard activeItem={active} onSelect={setActive} />

            <main className="p-4 sm:p-6 lg:p-8">
                {/* Título Principal */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings size={32} className="text-purple-600" />
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Configurações Gerais da Conta
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerencie seu perfil, saldo e regras de doação.
                    </p>
                </div>

                {/* Grid Principal (Duas Colunas) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUNA 1: Perfil e Saldo/Taxas */}
                    <div className="space-y-8">
                        {/* Card: Saldo e Perfil */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                            
                            {/* Saldo do Streamer */}
                            <div className="mb-8 border-b pb-4 border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Seu Saldo Atual</label>
                                <div className='flex items-center justify-between gap-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
                                    <p
                                        className={`text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 ${balanceBlurred ? "blur-md" : "blur-none"}`}
                                    >
                                        {/* toFixed() é seguro aqui, pois o dado foi convertido no useEffect */}
                                        R${streamerData.streamer_balance.toFixed(2).replace('.', ',')} 
                                    </p>
                                    <button
                                        onClick={toggleBalanceBlur}
                                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition"
                                        title={balanceBlurred ? 'Mostrar Saldo' : 'Ocultar Saldo'}
                                    >
                                        {balanceBlurred ? <EyeOff size={28} /> : <Eye size={28} />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Título: Informações do Streamer */}
                            <div className="flex items-center gap-3 mb-6">
                                <User size={20} className="text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Informações da Conta
                                </h2>
                            </div>

                            {/* Nickname */}
                            <div className="mb-6">
                                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                    Nickname do Streamer
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    value={streamerData.nickname}
                                    className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition'
                                    onChange={(e) => updateField('nickname', e.target.value)}
                                />
                            </div>

                            {/* Auto Play Checkbox */}
                            <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
                                <label htmlFor="autoplay" className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer'>
                                    Ativar Auto Play para Doações (Reprodução Automática)
                                </label>
                                <input
                                    id="autoplay"
                                    type="checkbox"
                                    checked={streamerData.is_auto_play}
                                    onChange={(e) => updateField('is_auto_play', e.target.checked)}
                                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-purple-600"
                                />
                            </div>
                        </div>

                        {/* Card: Política de Taxas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100 dark:border-gray-700">
                                <DollarSign size={20} className="text-green-500" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Política de Taxas
                                </h2>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 mb-6 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">2.9%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Taxa padrão por transação</p>
                            </div>

                            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                <li className="flex justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período de Saque</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">1 a cada 3 dias</span>
                                </li>
                                <li className="flex justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saque Máximo</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">R$2000,00</span>
                                </li>
                                <li className="flex justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taxa Fixa Adicional</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">R$ 0,39</span>
                                </li>
                                <li className="flex justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proteção contra Fraude</span>
                                    <span className="text-sm font-semibold text-green-500">100% segura</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* COLUNA 2: Predefinições */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 h-fit">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100 dark:border-gray-700">
                            <Settings size={20} className="text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Regras de Doação
                            </h2>
                        </div>

                        {/* Valor Mínimo */}
                        <div className="mb-6">
                            <label htmlFor="min_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                Valor Mínimo (R$)
                            </label>
                            <input
                                id="min_amount"
                                type="number"
                                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition'
                                // Usamos Math.max(0, ...) para evitar números negativos
                                value={Math.max(0, streamerData.min_amount)} 
                                onChange={(e) => updateField('min_amount', parseFloat(e.target.value))}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Máximo de Caracteres no Nome */}
                        <div className="mb-6">
                            <label htmlFor="max_characters_name" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                Máximo de Caracteres no Nome do Doador
                            </label>
                            <input
                                id="max_characters_name"
                                type="number"
                                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition'
                                value={Math.max(1, streamerData.max_characters_name)}
                                onChange={(e) => updateField('max_characters_name', parseInt(e.target.value))}
                                min="1"
                            />
                        </div>

                        {/* Máximo de Caracteres na Mensagem */}
                        <div className="mb-6">
                            <label htmlFor="max_characters_message" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                Máximo de Caracteres na Mensagem
                            </label>
                            <input
                                id="max_characters_message"
                                type="number"
                                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition'
                                value={Math.max(1, streamerData.max_characters_message)}
                                onChange={(e) => updateField('max_characters_message', parseInt(e.target.value))}
                                min="1"
                            />
                        </div>

                        <SaveButton />
                    </div>
                </div>
            </main>

            {/* Mensagem de Alerta (Global) */}
            {alertMessage && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl transition-opacity duration-300 z-50 ${
                    alertMessage.includes("sucesso") 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                        {alertMessage.includes("sucesso") ? <Save size={16} /> : <AlertCircle size={16} />}
                        {alertMessage}
                    </p>
                </div>
            )}
        </div >
    )
}

export default StreamerSettings;