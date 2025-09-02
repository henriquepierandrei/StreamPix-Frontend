import React, { useEffect, useState } from 'react'
import { ApiConfig } from "./../../api/ApiConfig";
import { getStreamerData } from "./../../api/GetStreamerData"; // ajuste o path se necessário
import { User, Settings, Save } from 'lucide-react'
import '../style/dashboard.css';


function StreamerSettings() {
    const [apiKey, setApiKey] = React.useState<string>('');

    const [isAuthenicated, setIsAuthenticated] = React.useState<boolean>(false);
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
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put(`/streamer?key=${apiKey}`, streamerData);
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
    

    useEffect(() => {
        const savedKey = localStorage.getItem('streamer_api_key');
        if (savedKey) {
            setApiKey(savedKey);
            setIsAuthenticated(true);

            (async () => {
                try {
                    setIsLoading(true);
                    const data = await getStreamerData(savedKey);
                    setStreamerData(data);
                } catch (err) {
                    console.error("Erro ao buscar streamer:", err);
                    setIsAuthenticated(false);
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, []);

    return (
        <div className="dashboardContainer">
            <div className="gridContainer">
                <div className="card">
                    <div className="formGroup">
                        <label>Saldo</label>
                        <div className='balance-display'>
                            <p className='balance'>R${streamerData.streamer_balance}</p>
                        </div>
                    </div>
                    <div className="cardTitle">
                        <User size={20} color="#667eea" />
                        <p>Informações do Streamer</p>
                    </div>

                    <div className="formGroup">
                        <label>Nome do Streamer</label>
                        <input
                            type="text"
                            value={streamerData.streamer_name}
                            className='input'
                            onChange={(e) => updateField('streamer_name', e.target.value)}
                        />
                    </div>

                    <div className="formGroup">
                        <div className='custom-checkbox-label'>
                            <input
                                type="checkbox"
                                checked={streamerData.is_auto_play}
                                onChange={(e) => updateField('is_auto_play', e.target.checked)}
                            />
                            <p>Auto Play Ativado</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="cardTitle">
                        <Settings size={20} color="#667eea" />
                        <p>Predefinições</p>
                    </div>

                    <div className="formGroup">
                        <label>Valor Mínimo</label>
                        <input
                            type="number"
                            className='input'
                            value={streamerData.min_amount}
                            onChange={(e) => updateField('min_amount', parseFloat(e.target.value))}
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <div className="formGroup">
                        <label>Máximo de Caracteres no Nome</label>
                        <input
                            type="number"
                            className='input'
                            value={streamerData.max_characters_name}
                            onChange={(e) => updateField('max_characters_name', parseInt(e.target.value))}
                            min="1"
                        />
                    </div>

                    <div className="formGroup">
                        <label>Máximo de Caracteres na Mensagem</label>
                        <input
                            className='input'
                            type="number"
                            value={streamerData.max_characters_message}
                            onChange={(e) => updateField('max_characters_message', parseInt(e.target.value))}
                            min="1"
                        />
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
        </div>
    )
}

export default StreamerSettings
