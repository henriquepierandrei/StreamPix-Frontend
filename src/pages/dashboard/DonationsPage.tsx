import { CalendarArrowDown, Clapperboard, DollarSign, Filter, MessageSquareMore, Settings, SquarePlayIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ApiConfig } from "./../../api/ApiConfig";
import { getStreamerData } from "./../../api/GetStreamerData"; // ajuste o path se necessário
import { Clock, UserStarIcon } from 'lucide-react'
import PlayButtonAudio from '../../components/buttons/PlayButtonAudio'
import ReplayButtonDonation from '../../components/buttons/ReplayButtonDonation'
import NavBarDashboard from '../../components/navbar/NavBarDashboard';
import { useNavigate } from "react-router-dom";

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

function DonationsPage() {
  const navigate = useNavigate();
  const [donates, setDonates] = useState<any[]>([]);
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [, setIsLoading] = useState<boolean>(false);
  const [active, setActive] = useState("Doações");
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



  const updateField = (field: keyof StreamerData, value: any) => {
    setStreamerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (data?: StreamerData) => {
    setIsLoading(true);
    try {
      const api = ApiConfig.getInstance();
      const payload = data ?? streamerData; // se passar algo, usa, senão usa o atual
      const response = await api.put(`/streamer`, payload);

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


  const handleToggleAutoPlay = (checked: boolean) => {
    updateField("is_auto_play", checked); // atualiza state
    handleSave({ ...streamerData, is_auto_play: checked }); // já envia o valor novo
  };




  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDonates = async (token?: string) => {
    try {
      setIsLoading(true);
      const api = ApiConfig.getInstance();
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();

      const params = new URLSearchParams({
        page: "0",
        size: "10",
        sort: "donatedAt,desc",
      });

      if (minAmount !== undefined) params.append("minAmount", minAmount.toString());
      if (maxAmount !== undefined) params.append("maxAmount", maxAmount.toString());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/streamer/log/donations?${params.toString()}`, {
        headers: authHeaders, // corrigido
      });
      setDonates(response.data.content);
    } catch (err) {
      console.error("Erro ao buscar donates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");
      console.log("DonationsPage:" + localStorage.getItem('token')); // deve mostrar o token
      if (token == null) {
        navigate("/streamer/dashboard/login");
        return;
      }

      try {
        setIsLoading(true);

        // Busca dados do streamer
        const data = await getStreamerData(); // não precisa passar token
        setStreamerData(data);

        // Busca donates
        await fetchDonates(); // fetchDonates já pega token do localStorage
      } catch (err: any) {
        console.error("Erro ao inicializar página:", err.message || err);
        // localStorage.removeItem("token");
        navigate("/streamer/dashboard/login");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [navigate]);



  const clearDonates = () => {
    setDonates([]);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };



  return (
    <div className='container'>
      <NavBarDashboard activeItem={active} onSelect={setActive} />
      <div className="card-donations">
        <div className="cardTitle">
          <Settings size={20} color="#667eea" />
          <p>Donates Recebidos</p>
        </div>

        <div className="filters-container">
          {/* Título do Grupo de Valor */}
          <div className="filter-group">
            <p className="filter-group-title">Faixa de Valor</p>
            <div className="input-wrapper">
              <div className="input-with-icon">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={minAmount ?? ""}
                  onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="input-with-icon">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={maxAmount ?? ""}
                  onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Título do Grupo de Data */}
          <div className="filter-group">
            <p className="filter-group-title">Período</p>
            <div className="input-wrapper">
              <div className="input-with-icon">
                <CalendarArrowDown className="custom-icon" />
                <input
                  type="date"
                  value={startDate ?? ""}
                  onChange={(e) => setStartDate(e.target.value || undefined)}
                />
              </div>
              <div className="input-with-icon">
                <CalendarArrowDown className="input-icon" />
                <input
                  type="date"
                  value={endDate ?? ""}
                  onChange={(e) => setEndDate(e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="filter-actions">
            <button className="filter-button primary" onClick={() => fetchDonates()}>
              <Filter />
              Filtrar
            </button>

            <button className="filter-button secondary" onClick={clearDonates}> {/* Adicionar uma função para limpar */}
              <Clapperboard />
              Limpar
            </button>
          </div>
          <button className='button-toggle-play'
                  onClick={() => handleToggleAutoPlay(!streamerData.is_auto_play)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    cursor: "pointer",
                    color: streamerData.is_auto_play ? "#4caf50" : "#ff3d3dff",
                    fontWeight: 600,
                    width: "max-content"
                  }}
                >
                  <SquarePlayIcon strokeWidth={3} />
                  {streamerData.is_auto_play ? "Auto Play Ativado" : "Auto Play Desativado"}
                </button>
        </div>

        {donates.length === 0 ? (
          <p>Nenhum donate encontrado.</p>
        ) : (
          Object.entries(
            donates.reduce((groups: Record<string, typeof donates>, donate) => {
              const dateKey = new Date(donate.donated_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
              if (!groups[dateKey]) groups[dateKey] = [];
              groups[dateKey].push(donate);
              return groups;
            }, {})
          ).map(([date, donations]) => (
            <div key={date} className="donation-group">

              <br /><hr className='hr-dashboard' />
              <h3 className="donation-date">{date}</h3>

              {donations.map((donate) => (
                <div key={donate.uuid} className="donateItem">
                  <p className='balance-donation'>
                    R${donate.amount}
                  </p>
                  <div className='audio-container'>
                    <ReplayButtonDonation uuid={donate.uuid} />
                    {donate.audio_url && (<PlayButtonAudio src={donate.audio_url} />)}
                  </div>

                  <p>
                    <UserStarIcon size={12} strokeWidth={4} /> {donate.name}
                  </p>
                  <p className='message-donation' style={{ fontWeight: "500" }}>
                    <MessageSquareMore size={12} strokeWidth={4} /> {donate.message}
                  </p>

                  <p style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: "5px" }}>
                    <Clock size={12} /> Data: {new Date(donate.donated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


export default DonationsPage
