import { Link2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from '../../components/navbar/NavBarDashboard';
import logo from '../../assets/logo.png';
import { useNavigate } from "react-router-dom";

import '../style/messageStyle.css';

function MessagesPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Mensagens");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDarkMessageMode, setIsDarkMessageMode] = useState<boolean>(false);

    interface StreamerData {
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
                const data = await getStreamerData(); // remove a key
                setStreamerData(data);
                if (data.donate_is_dark_theme) {
                    setIsDarkMessageMode(true);
                }
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
                navigate("/streamer/dashboard/login"); // redireciona se erro
            } finally {
                setIsLoading(false);
            }
        })();
    }, [navigate]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put(`/streamer`, streamerData); // sem query key
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




    return (
        <div>
            <NavBarDashboard activeItem={active} onSelect={setActive} />
            <div className='card' style={{ maxWidth: "720px", margin: "auto", borderRadius: "10px" }}>
                <div className="cardTitle" >
                    <Link2 size={20} />
                    <p>URL Mensagens {streamerData.streamer_name}</p>
                </div><br />
                <div className="formGroup">
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


                <div className={`toast show ${isDarkMessageMode ? "dark" : ""}`}>
                    <img src={logo} className="toast-logo" alt="logo" />
                    <div className="toast-content">
                        <div>
                            <span className="toast-name">Teste</span> enviou
                            <strong>R$ 999</strong>
                        </div>
                        "Eu gosto muito da sua live"
                    </div>
                </div>

            </div>
        </div>


    )
}

export default MessagesPage
