import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import NavBarDashboard from "../../components/navbar/NavBarDashboard";
import { Eye, EyeClosed, Save, Settings, User } from "lucide-react";

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

function StreamerSettings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Streamer");
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [balanceBlurred, setBalanceBlurred] = useState(() => {
    const saved = localStorage.getItem('balanceBlurred');
    return saved ? JSON.parse(saved) : true; // padrão: true (borrado)
  });

  // Função para alternar o blur
  const blurBalance = () => {
    setBalanceBlurred((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('balanceBlurred', JSON.stringify(newState));
      return newState;
    });
  };



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

  // Buscar dados do streamer ao carregar o componente
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getStreamerData(); // sem passar apiKey
        setStreamerData(data);
      } catch (err) {
        console.error("Erro ao buscar streamer:", err);
        navigate("/streamer/dashboard/login"); // se falhar, redireciona pro login
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="dashboardContainer">
      <NavBarDashboard activeItem={active} onSelect={setActive} />
      <div className="gridContainer">
        <div className="card">
          <div className="formGroup">
            <label>Saldo</label>
            <div className='balance-display'>
              <p
                className='balance'
                style={{ filter: balanceBlurred ? "blur(8px)" : "none", transition: "filter 0.3s ease" }}
              >R${streamerData.streamer_balance}</p>
              <div onClick={blurBalance} style={{ cursor: 'pointer' }}>
                {balanceBlurred ? <EyeClosed size={32} /> : <Eye size={32} />}
              </div>
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
