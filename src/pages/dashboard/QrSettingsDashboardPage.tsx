import { useEffect, useState } from 'react'
import { QrCode, Copy, Save, RefreshCcw, View } from 'lucide-react'
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from '../../components/navbar/NavBarDashboard';

function AnalyticsPage() {
    const [active, setActive] = useState("QrCode");
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const [streamerData, setStreamerData] = useState<StreamerData>({
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
    });

    const updateField = (field: keyof StreamerData, value: any) => {
        setStreamerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            // tipagem explícita da resposta
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
                    status: "CONFLICT",
                    message: "Falha ao salvar alterações."
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await getStreamerData();
                // garante que o TS saiba que `data` é StreamerData
                setStreamerData(data as StreamerData);
            } catch (err) {
                console.error("Erro ao buscar streamer:", err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <div className="dashboardContainer" style={{ display: "flex", gap: "10px" }}>
            <NavBarDashboard activeItem={active} onSelect={setActive} />
            <div className='gridContainer' style={{ width: "100%" }}>
                <div className='card'>
                    <div className="cardTitle">
                        <QrCode size={20} color="#667eea" />
                        <p>URL QrCode {streamerData.nickname}</p>
                    </div><br />
                    <div className="formGroup">
                        <div className='custom-checkbox-label'>
                            <input
                                type="checkbox"
                                checked={streamerData.qr_code_is_dark_theme}
                                onChange={(e) => updateField('qr_code_is_dark_theme', e.target.checked)}
                            />
                            <p>Tema Escuro</p>
                        </div>
                        <div className='custom-checkbox-label'>
                            <input
                                type="checkbox"
                                checked={streamerData.add_messages_bellow}
                                onChange={(e) => updateField('add_messages_bellow', e.target.checked)}
                            />
                            <p>Mensagens de Incentivo</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={ApiConfig.getBaseFrontendURL() + "/streamer/qrcode/" + streamerData.nickname}
                                readOnly
                                className="input"
                                style={{ flex: 1 }}
                            />
                            <button
                                className="iconButton"
                                style={{ width: '40px', height: '40px', background: 'transparent', color: "#636363ff" }}
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(ApiConfig.getBaseFrontendURL() + "/streamer/qrcode/" + streamerData.nickname);
                                        const feedback = document.getElementById('copyFeedback');
                                        if (feedback) {
                                            feedback.style.opacity = '1';
                                            setTimeout(() => {
                                                feedback.style.opacity = '0';
                                            }, 2000);
                                        }
                                    } catch (err) {
                                        console.error('Failed to copy:', err);
                                    }
                                }}
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                        <span
                            id="copyFeedback"
                            style={{
                                color: '#9398a1ff',
                                fontSize: '0.8rem',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                marginTop: '-5px'
                            }}
                        >
                            URL copiada com sucesso!
                        </span>
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
                    </button><br />
                    <br />
                    <button className='reload-page-button'><RefreshCcw size={18} onClick={() => window.location.reload()} /></button>
                    <iframe src={ApiConfig.getBaseFrontendURL() + "/streamer/qrcode/" + streamerData.nickname} className='iframe-qrcode' ></iframe>
                </div>

                <div className='card'>
                    <div className='card'>
                        <div className='cardTitle'>
                            <View size={20} color="#667eea" />
                            <p>Especificações no OBS</p>
                        </div>

                        <table className='specsTable'>
                            <thead>
                                <tr>
                                    <th>Propriedade</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Width</strong></td>
                                    <td>350px</td>
                                </tr>
                                <tr>
                                    <td><strong>Height</strong></td>
                                    <td>350px</td>
                                </tr>
                                <tr>
                                    <td><strong>FPS</strong></td>
                                    <td>60</td>
                                </tr>
                                <tr>
                                    <td><strong>CSS</strong></td>
                                    <td>Fundo transparente</td>
                                </tr>
                                <tr>
                                    <td><strong>Shutdown source when not visible</strong></td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td><strong>Refresh browser when scene becomes active</strong></td>
                                    <td>✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AnalyticsPage
