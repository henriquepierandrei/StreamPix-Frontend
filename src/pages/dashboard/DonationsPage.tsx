import { Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ApiConfig } from "./../../api/ApiConfig";
import { getStreamerData } from "./../../api/GetStreamerData"; // ajuste o path se necessário
import { Clock, UserStarIcon } from 'lucide-react'
import PlayButtonAudio from '../../components/buttons/PlayButtonAudio'
import ReplayButtonDonation from '../../components/buttons/ReplayButtonDonation'
import NavBarDashboard from '../../components/navbar/NavBarDashboard';

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
  const [donates, setDonates] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
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
    <div className='container'>
      <NavBarDashboard activeItem={active} onSelect={setActive} />
      <div className="card-donations">
        <div className="cardTitle">
          <Settings size={20} color="#667eea" />
          <p>Donates Recebidos</p>
        </div>
        {donates.length === 0 ? (
          <p>Nenhum donate encontrado.</p>
        ) : (
          Object.entries(
            donates.reduce((groups: Record<string, typeof donates>, donate) => {
              // Formata só a data (sem horas)
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
              <br /><hr className='hr-dashboard'/>
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
                    <strong><UserStarIcon size={12} /> Nome:</strong> {donate.name}
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

  )
}

export default DonationsPage
