import React, { useState, useEffect } from 'react';
import { Key, DoorOpen } from 'lucide-react';
import { getStreamerData } from "./../api/GetStreamerData"; // ajuste o path se necessário
import logo from '../assets/logo.png';
import './style/dashboard.css';
import GoalComponent from '../components/goal/GoalComponent';
import DonationsPage from './dashboard/DonationsPage';
import StreamerSettings from './dashboard/StreamerSettings';
import AnalyticsPage from './dashboard/AnalyticsPage';

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

const StreamerDashboard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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

  const [tempKey, setTempKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Carregar automaticamente se já existir chave salva
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



  const handleLogin = async () => {
    if (tempKey.trim()) {
      localStorage.setItem('streamer_api_key', tempKey);
      setApiKey(tempKey);
      setIsAuthenticated(true);
      setTempKey('');

      try {
        setIsLoading(true);
        const data = await getStreamerData(tempKey); // chama API
        setStreamerData(data);
      } catch (err) {
        console.error("Erro ao buscar streamer:", err);
        setIsAuthenticated(false);
        localStorage.removeItem('streamer_api_key');
        alert("Chave inválida ou erro na API!");
      } finally {
        setIsLoading(false);
      }
    }
  };



  if (!isAuthenticated) {
    return (
      <div className="container" style={{ overflowY: 'auto' }}>
        <div className="loginContainer">
          <div className="loginCard">
            <div className="iconContainer">
              <Key size={30} />
            </div>
            <h1 className="title">Acesso ao Dashboard</h1>
            <p className="subtitle">Insira sua chave de API para continuar</p>

            <div className="inputGroup">
              <label>Chave da API</label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Digite sua chave de API"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button onClick={handleLogin} style={{ marginTop: '10px' }} className="loginButton">
              Acessar Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <DonationsPage />
      <StreamerSettings />
      {/* Componente de Meta */}
      {apiKey && <GoalComponent apiKey={apiKey} />}
      <AnalyticsPage />


    </div>
  );
};

export default StreamerDashboard;