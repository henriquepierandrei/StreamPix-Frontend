import { Link2, Save, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from '../../components/navbar/NavBarDashboard';
import { useNavigate } from "react-router-dom";

import '../style/messageStyle.css';

function MessagesPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Mensagens");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDarkMessageMode, setIsDarkMessageMode] = useState<boolean>(false);
    const [copied, setCopied] = useState(false);

    interface StreamerData {
        id: number;
        streamer_name: string;
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

    const [streamerData, setStreamerData] = useState<StreamerData>({
        id: 0,
        streamer_name: "Carregando...",
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
    });

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await getStreamerData();
                setStreamerData(data);
                if (data.donate_is_dark_theme) {
                    setIsDarkMessageMode(true);
                }
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
                navigate("/streamer/dashboard/login");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [navigate]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put(`/streamer`, streamerData);
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
                    message: "Falha ao salvar alterações."
                }
            }));
        } finally {
            setIsLoading(false);
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
            await navigator.clipboard.writeText(
                ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/messages/to-show/" + streamerData.id
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erro ao copiar URL:", err);
        }
    };

    return (
        <div style={{display: "flex", gap: "10px"}}>
            <NavBarDashboard activeItem={active} onSelect={setActive} />
            <div className='card' style={{ width: "100%", borderRadius: "10px" }}>
                <div className="cardTitle">
                    <Link2 size={20} />
                    <p>URL Mensagens {streamerData.streamer_name}</p>
                </div>
                <br />

                {/* Campo de URL com botão copiar */}
                <div style={{ display: "flex", gap: 10, flexDirection: "column", marginTop: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                            type="text"
                            value={ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/messages/to-show/" + streamerData.id}
                            readOnly
                            className="input"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="iconButton"
                            style={{ width: 40, height: 40 }}
                            onClick={handleCopyURL}
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                    {copied && (
                        <span style={{ color: "#9398a1", fontSize: "0.8rem", marginTop: -5 }}>
                            URL copiada com sucesso!
                        </span>
                    )}
                </div>

                <div className="formGroup" style={{ marginTop: 20 }}>
                    <div className='custom-checkbox-label'>
                        <input
                            type="checkbox"
                            checked={streamerData.donate_is_dark_theme}
                            onChange={(e) => updateField('donate_is_dark_theme', e.target.checked)}
                        />
                        <p>Tema Escuro</p>
                    </div>
                </div>

                <button
                    className="saveButton"
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Save size={20} />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>

                
            </div>
        </div>
    )
}

export default MessagesPage;
