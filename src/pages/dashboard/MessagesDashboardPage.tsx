import { Link2, Save, Copy, View, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
// Assumindo que ApiConfig, getStreamerData, NavBarDashboard e useNavigate estão corretos
import { ApiConfig } from "../../api/ApiConfig"; 
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from '../../components/navbar/NavBarDashboard';
import { useNavigate } from "react-router-dom";
// import '../../styles/messageStyle.css'; // REMOVA ESTA LINHA

// [Interfaces e Lógica permanecem as mesmas]
interface StreamerData {
    id: string;
    nickname: string;
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
    id: "Carregando...",
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

function MessagesPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Mensagens");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState("");
    // REMOVIDA: setIsDarkMessageMode, pois era redundante
    const [copied, setCopied] = useState(false);

    const [streamerData, setStreamerData] = useState<StreamerData>(initialStreamerData);

    // Efeito para carregar dados do streamer
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await getStreamerData();
                setStreamerData(data);
                // REMOVIDA: a lógica de setIsDarkMessageMode(true);
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
                // Melhor UX: Redireciona em caso de falha de autenticação/carga inicial
                setAlertMessage("Sessão expirada ou erro ao carregar dados. Faça login.");
                navigate("/streamer/dashboard/login");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [navigate]);
    
    // Efeito para exibir mensagens de sucesso/erro da API
    useEffect(() => {
        if (streamerData.http_response.status === "SUCCESS") {
            setAlertMessage("Alterações salvas com sucesso! 🎉");
            const timer = setTimeout(() => {
                setAlertMessage("");
                // Resetar o status para evitar que o alert reapareça
                setStreamerData(prev => ({ ...prev, http_response: { status: "WAIT", message: "" } }));
            }, 3000);
            return () => clearTimeout(timer);
        } else if (streamerData.http_response.status === "ERROR") {
            setAlertMessage(`Erro: ${streamerData.http_response.message || "Falha ao salvar."} 🚨`);
            const timer = setTimeout(() => {
                setAlertMessage("");
                // Resetar o status para evitar que o alert reapareça
                setStreamerData(prev => ({ ...prev, http_response: { status: "WAIT", message: "" } }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [streamerData.http_response]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const api = ApiConfig.getInstance();
            // Enviamos o streamerData atualizado localmente
            const response = await api.put<StreamerData>(`/streamer`, streamerData);
            
            // ATUALIZAÇÃO REFINADA: 
            // Se o backend retornar o objeto StreamerData completo atualizado:
            // setStreamerData(response.data);
            
            // Se o backend retornar apenas o status de resposta (como no código original):
            setStreamerData(prev => ({
                ...prev,
                http_response: response.data.http_response 
                // A prop 'http_response' na interface StreamerData deve ser a mesma na resposta do PUT
            }));

        } catch (err) {
            console.error("Erro ao salvar streamer:", err);
            setStreamerData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "Falha na comunicação com o servidor." // Mensagem mais específica
                }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof StreamerData, value: any) => {
        setStreamerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCopyURL = async () => {
        try {
            // Garante que o ID não seja "Carregando..." antes de tentar copiar
            if (streamerData.id === initialStreamerData.id) return; 

            await navigator.clipboard.writeText(
                ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/messages/to-show/" + streamerData.id
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erro ao copiar URL:", err);
            // Poderia adicionar um setAlertMessage aqui para erro de cópia
        }
    };

    const messagesUrl = ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/messages/to-show/" + streamerData.id;

    // Se estiver carregando, exibe apenas a barra de navegação e um loader centralizado.
    if (isLoading && streamerData.id === initialStreamerData.id) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 flex flex-col">
                <NavBarDashboard activeItem={active} onSelect={setActive} />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-blue-500" />
                    <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">Carregando dados...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64">
            <NavBarDashboard activeItem={active} onSelect={setActive} />

            <main className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Link2 size={32} className="text-blue-500" />
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Configurações de Mensagens
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerencie as configurações de exibição das mensagens de doação em sua live.
                    </p>
                </div>
                
                {/* --- */}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* COLUNA 1: URL e Configurações */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 h-fit space-y-8">
                        
                        {/* URL do Browser Source */}
                        <div>
                            <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                                <Link2 size={24} className="text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    URL de Exibição das Mensagens
                                </h2>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adicione esta URL como "Browser Source" no OBS/Streamlabs</label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={messagesUrl}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white truncate focus:outline-none"
                                    />
                                </div>

                                {/* Botão 1: VISUALIZAR (Olho) */}
                                <a 
                                    href={messagesUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl transition duration-150"
                                    title="Visualizar Mensagens (Abre em nova aba)"
                                >
                                    <View size={20} />
                                </a>

                                {/* Botão 2: COPIAR */}
                                <button 
                                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition duration-150"
                                    onClick={handleCopyURL}
                                    title="Copiar URL"
                                    // Desabilita se estiver no estado inicial de carregamento
                                    disabled={streamerData.id === initialStreamerData.id}
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                            {copied && (
                                <span className="text-green-500 text-xs mt-1 block">
                                    URL copiada com sucesso!
                                </span>
                            )}
                        </div>

                        {/* Opções de Configuração */}
                        <div>
                            <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                                <Save size={24} className="text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Opções de Aparência
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Checkbox: Tema Escuro */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <label htmlFor="darkTheme" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Tema Escuro para as Mensagens
                                    </label>
                                    <input
                                        id="darkTheme"
                                        type="checkbox"
                                        checked={streamerData.donate_is_dark_theme}
                                        onChange={(e) => updateField('donate_is_dark_theme', e.target.checked)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-blue-600"
                                    />
                                </div>

                                {/* Checkbox: Adicionar Mensagens Abaixo */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <label htmlFor="addMessagesBellow" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Exibir mensagens de doação **abaixo** de mensagens anteriores
                                    </label>
                                    <input
                                        id="addMessagesBellow"
                                        type="checkbox"
                                        checked={streamerData.add_messages_bellow}
                                        onChange={(e) => updateField('add_messages_bellow', e.target.checked)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Botão Salvar */}
                        <div className="pt-4">
                            <button
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:transform-none"
                                onClick={handleSave}
                                // Corrigido para desabilitar apenas com isSaving (se a lógica de isLoading na renderização já o fizer)
                                disabled={isSaving || isLoading} 
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? "Salvando..." : "Salvar Configurações"}
                            </button>
                        </div>

                    </div>
                    
                    {/* --- */}

                    {/* COLUNA 2: Especificações OBS */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8">
                            <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                                <View size={24} className="text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Especificações de Fonte no OBS/Streamlabs
                                </h2>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-300">
                                            <th className="py-2 pr-4">Propriedade</th>
                                            <th className="py-2">Valor Recomendado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">Width</td>
                                            <td className="py-2.5 font-mono text-sm">580px</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">Height</td>
                                            <td className="py-2.5 font-mono text-sm">150px</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">FPS</td>
                                            <td className="py-2.5 font-mono text-sm">60</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">CSS Personalizado</td>
                                            <td className="py-2.5">Fundo transparente</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">Shutdown source when not visible</td>
                                            <td className="py-2.5 text-red-500 font-semibold">Desmarcado (❎)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-medium text-gray-900 dark:text-white">Refresh browser when scene becomes active</td>
                                            <td className="py-2.5 text-red-500 font-semibold">Desmarcado (❎)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- */}

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
            </main>
        </div>
    )
}

export default MessagesPage;