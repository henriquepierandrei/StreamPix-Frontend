import React, { useState, useEffect } from 'react';
import { Save, Key, Settings, User } from 'lucide-react';
import './dashboard.css';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<StreamerData>({
    streamer_name: "Joaoo",
    streamer_balance: 150.5,
    is_auto_play: true,
    min_amount: 1.0,
    max_characters_name: 11,
    max_characters_message: 250,
    http_response: {
      status: "OK",
      message: "Streamer atualizado com sucesso!"
    }
  });
  const [tempKey, setTempKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('streamer_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (tempKey.trim()) {
      localStorage.setItem('streamer_api_key', tempKey);
      setApiKey(tempKey);
      setIsAuthenticated(true);
      setTempKey('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('streamer_api_key');
    setApiKey('');
    setIsAuthenticated(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setStreamerData(prev => ({
        ...prev,
        http_response: {
          status: "OK",
          message: "Dados atualizados com sucesso!"
        }
      }));
      setIsLoading(false);
    }, 1000);
  };

  const updateField = (field: keyof StreamerData, value: any) => {
    setStreamerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
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
            <button
              onClick={handleLogin}
            >
              Acessar Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboardContainer">
        <div className="header">
          <div className="headerLeft">
            <div className="headerIcon">
              <Settings size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <h1 className="title">Dashboard do Streamer</h1>

            </div>
          </div>
          <button className="logoutButton" onClick={handleLogout}>
            Sair
          </button>
        </div>

        {streamerData.http_response && (
          <div className="statusCard">
            <div className="statusIndicator">
              <div 
                className="statusDot"
                style={{ backgroundColor: streamerData.http_response.status === 'OK' ? '#2ed573' : '#ff4757' }}
              />
              <span style={{ fontWeight: 'bold' }}>
                Status: {streamerData.http_response.status}
              </span>
            </div>
            <p style={{ margin: '5px 0 0', color: '#666' }}>
              {streamerData.http_response.message}
            </p>
          </div>
        )}

        <div className="gridContainer">
          <div className="card">
            <div className="cardTitle">
              <User size={20} color="#667eea" />
              Informações do Streamer
            </div>
            
            <div className="formGroup">
              <label>Nome do Streamer</label>
              <input
                type="text"
                value={streamerData.streamer_name}
                onChange={(e) => updateField('streamer_name', e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>Saldo</label>
              <input
                type="number"
                value={streamerData.streamer_balance}
                onChange={(e) => updateField('streamer_balance', parseFloat(e.target.value))}
                step="0.01"
              />
            </div>

            <div className="formGroup">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={streamerData.is_auto_play}
                  onChange={(e) => updateField('is_auto_play', e.target.checked)}
                  className="checkbox"
                />
                Auto Play Ativado
              </label>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">
              <Settings size={20} color="#667eea" />
              Configurações
            </div>
            
            <div className="formGroup">
              <label>Valor Mínimo</label>
              <input
                type="number"
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
                value={streamerData.max_characters_name}
                onChange={(e) => updateField('max_characters_name', parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div className="formGroup">
              <label>Máximo de Caracteres na Mensagem</label>
              <input
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
    </div>
  );
};

export default StreamerDashboard;
