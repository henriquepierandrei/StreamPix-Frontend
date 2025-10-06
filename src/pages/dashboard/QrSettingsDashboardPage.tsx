import { useEffect, useState } from 'react'
import { QrCode, Copy, Save, RefreshCcw, View, Loader2, AlertCircle } from 'lucide-react'
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from '../../components/navbar/NavBarDashboard';

// Interface padronizada (mantida)
interface StreamerData {
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

function QrCodePage() { // Renomeei para QrCodePage, já que AnalyticsPage não faz sentido aqui
    const [active, setActive] = useState("QrCode");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false); // Novo estado para diferenciar loading de saving
    const [copied, setCopied] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const [streamerData, setStreamerData] = useState<StreamerData>(initialStreamerData);

    // Efeito para carregar dados
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await getStreamerData();
                setStreamerData(data as StreamerData);
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
                setAlertMessage("Erro ao carregar dados. Tente recarregar a página.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

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

    const updateField = (field: keyof StreamerData, value: any) => {
        setStreamerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put<{ http_response: { status: string; message: string } }>(
                `/streamer`,
                streamerData
            );

            // Atualiza apenas a resposta, mantendo os dados de configuração localmente
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

    const handleCopyURL = async () => {
        try {
            const url = ApiConfig.getBaseFrontendURL() + "/streamer/qrcode/" + streamerData.nickname;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const qrcodeUrl = ApiConfig.getBaseFrontendURL() + "/streamer/qrcode/" + streamerData.nickname;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:pl-64">
            <NavBarDashboard activeItem={active} onSelect={setActive} />

            <main className="p-4 sm:p-6 lg:p-8">
                {/* Título Principal */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Alterado para text-purple-600 */}
                        <QrCode size={32} className="text-purple-600" />
                        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                            Configurações de QR Code
                        </h1>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Gerencie a aparência e o link do seu QR Code para doações.
                    </p>
                </div>

                {/* Grid Principal */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

                    {/* COLUNA 1: Configurações e Preview do QR Code */}
                    {/* Alterado para dark:bg-zinc-900 */}
                    <div className='bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 md:p-8 space-y-8'>

                        {/* Header do Card */}
                        <div className="flex items-center gap-3 border-b pb-4 mb-2 border-zinc-100 dark:border-zinc-800">
                            <QrCode size={24} className="text-purple-600" />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Opções de Aparência
                            </h2>
                        </div>

                        {/* Opções de Checkbox */}
                        <div className='space-y-4'>
                            {/* Checkbox: Tema Escuro */}
                            {/* Alterado para zinc-50 / dark:bg-zinc-800 e bordas zinc */}
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <label htmlFor="darkTheme" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                    Tema Escuro para o QR Code
                                </label>
                                <input
                                    id="darkTheme"
                                    type="checkbox"
                                    checked={streamerData.qr_code_is_dark_theme}
                                    onChange={(e) => updateField('qr_code_is_dark_theme', e.target.checked)}
                                    
                                    className="h-5 w-5 text-purple-600 border-zinc-300 rounded focus:ring-purple-500 dark:bg-zinc-700 dark:border-zinc-600 dark:checked:bg-purple-600"
                                />
                            </div>

                            {/* Checkbox: Mensagens de Incentivo */}
                            {/* Alterado para zinc-50 / dark:bg-zinc-800 e bordas zinc */}
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <label htmlFor="addMessagesBellow" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                    Exibir mensagens de incentivo
                                </label>
                                <input
                                    id="addMessagesBellow"
                                    type="checkbox"
                                    checked={streamerData.add_messages_bellow}
                                    onChange={(e) => updateField('add_messages_bellow', e.target.checked)}
                                    className="h-5 w-5 text-purple-600 border-zinc-300 rounded focus:ring-purple-500 dark:bg-zinc-700 dark:border-zinc-600 dark:checked:bg-purple-600"
                                />
                            </div>
                        </div>

                        {/* URL e Botão de Cópia */}
                        <div className='pt-4'>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">URL do QR Code</label>
                            <div className='flex gap-2'>
                                <input
                                    type="text"
                                    value={qrcodeUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white truncate focus:outline-none"
                                />
                                <button
                                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl transition duration-150"
                                    onClick={handleCopyURL}
                                    title="Copiar URL"
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

                        {/* Botão Salvar */}
                        <div className="pt-4">
                            <button
                                // Alterado para bg-purple-600, hover:bg-purple-700, disabled:bg-purple-400
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:transform-none"
                                onClick={handleSave}
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? "Salvando..." : "Salvar Configurações"}
                            </button>
                        </div>

                        {/* Preview do QR Code (Iframe) */}
                        <div className='pt-4 flex flex-col items-center border-t border-zinc-100 dark:border-zinc-800'>
                            <div className='flex items-center justify-between w-full mb-3'>
                                <h3 className='text-lg font-semibold text-zinc-900 dark:text-white'>Preview</h3>
                                <button
                                    // Alterado para bg-zinc-100 / dark:bg-zinc-700 e hover:bg-zinc-200 / dark:hover:bg-zinc-600
                                    className='p-2 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition'
                                    onClick={() => window.location.reload()}
                                    title="Recarregar Preview"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                            {/* Alterado para border-zinc-300 / dark:border-zinc-600 */}
                            <div className='w-full max-w-sm h-72 border border-zinc-300 dark:border-zinc-600 rounded-xl overflow-hidden shadow-lg'>
                                <iframe
                                    src={qrcodeUrl}
                                    title="QR Code Preview"
                                    className='w-full h-full border-none'
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA 2: Especificações OBS */}
                    {/* Alterado para dark:bg-zinc-900 */}
                    <div className='bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 md:p-8 h-fit'>
                        <div className="flex items-center gap-3 border-b pb-4 mb-6 border-zinc-100 dark:border-zinc-800">
                            <View size={24} className="text-purple-600" />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Especificações de Fonte no OBS/Streamlabs
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            {/* Alterado para text-zinc-600 dark:text-zinc-400 */}
                            <table className="w-full text-left text-zinc-600 dark:text-zinc-400 border-collapse">
                                <thead>
                                    {/* Alterado para border-zinc-200 dark:border-zinc-700 e text-zinc-800 dark:text-zinc-300 */}
                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                                        <th className="py-2 pr-4">Propriedade</th>
                                        <th className="py-2">Valor Recomendado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Alterado para border-zinc-100 dark:border-zinc-700/50 e text-zinc-900 dark:text-white */}
                                    <tr className="border-b border-zinc-100 dark:border-zinc-700/50">
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">Width</td>
                                        <td className="py-2.5 font-mono text-sm">320px</td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-700/50">
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">Height</td>
                                        <td className="py-2.5 font-mono text-sm">320px</td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-700/50">
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">FPS</td>
                                        <td className="py-2.5 font-mono text-sm">60</td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-700/50">
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">CSS Personalizado</td>
                                        <td className="py-2.5">Fundo transparente</td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-700/50">
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">Shutdown source when not visible</td>
                                        <td className="py-2.5 text-green-500 font-semibold">Marcado (✅)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 font-medium text-zinc-900 dark:text-white">Refresh browser when scene becomes active</td>
                                        <td className="py-2.5 text-green-500 font-semibold">Marcado (✅)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Mensagem de Alerta (Global) */}
                {alertMessage && (
                    <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl transition-opacity duration-300 z-50 ${alertMessage.includes("sucesso")
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
        </div >
    )
}

export default QrCodePage;