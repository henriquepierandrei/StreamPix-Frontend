import React, { useState, useEffect } from 'react';
import { Save, Key, Settings, User, DoorOpen, MessageCircle, Clock, Pointer, UserStarIcon } from 'lucide-react';
import { ApiConfig } from "./../api/ApiConfig";
import { getStreamerData } from "./../api/GetStreamerData"; // ajuste o path se necessário
import logo from '../assets/logo.png';
import './style/dashboard.css';
import PlayButtonAudio from '../components/PlayButtonAudio';

interface StreamerData {
  streamer_name: string;
  streamer_balance: number;
  is_auto_play: boolean;
  min_amount: number;
  max_characters_name: number;
  max_characters_message: number;
  http_response: {
    status: string;
    message: string;
  };
}



const StreamerDashboard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [donates, setDonates] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<StreamerData>({
    streamer_name: "Carregando...",
    streamer_balance: 0,
    is_auto_play: false,
    min_amount: 0,
    max_characters_name: 0,
    max_characters_message: 0,
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

  useEffect(() => {
    if (isAuthenticated) {
      const fetchDonates = async () => {
        try {
          setIsLoading(true);
          const api = ApiConfig.getInstance();
          const response = await api.get(`/log/donations?key=${apiKey}&&page=0&size=10&sort=donatedAt,desc`);
          setDonates(response.data.content); // conforme JSON que você enviou
        } catch (err) {
          console.error("Erro ao buscar donates:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDonates();
    }
  }, [isAuthenticated, apiKey]);


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

  const handleLogout = () => {
    localStorage.removeItem('streamer_api_key');
    setApiKey('');
    setIsAuthenticated(false);
  };

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
      <div className="header">
        <div className="headerLeft">
          <div className="headerIcon">
            <img src={logo} alt="" width={"30px"} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h1 className="title">Dashboard do Streamer</h1>
          </div>
        </div>
        <button className="logoutButton" onClick={handleLogout}>
          <DoorOpen /> Sair
        </button>
      </div>
      <div className="card-donations">
        <div className="cardTitle">
          <Settings size={20} color="#667eea" />
          <p>Donates Recebidos</p>
        </div>
        {donates.length === 0 ? (
          <p>Nenhum donate encontrado.</p>
        ) : (
          donates.map((donate) => (
            <div key={donate.uuid} className="donateItem">
              <p className='balance-donation'>
                R${donate.amount}
              </p>
              <div className='audio-container'>{donate.audio_url && (<PlayButtonAudio src={donate.audio_url} />)}
              </div>

              <p><strong><UserStarIcon size={12} /> Nome:</strong> {donate.name}</p>

              <p style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: "5px" }}>
                <Clock size={12} /> Data: {new Date(donate.donated_at).toLocaleString()} </p>
            </div>
          ))
        )}
      </div>
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
              <p>Configurações</p>
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
      </div><br />
    </div>
  );
};

export default StreamerDashboard;
