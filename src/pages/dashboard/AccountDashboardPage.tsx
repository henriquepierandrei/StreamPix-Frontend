import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBarDashboard from "../../components/navbar/NavBarDashboard";
import { Eye, EyeClosed, Clock, User, AlertOctagon } from "lucide-react";
import { getStreamerData } from "../../api/GetStreamerData";

interface HttpResponse {
  status: string;
  message: string;
}

interface InfoStreamerData {
  full_name: string;
  cpf: string;
  profile_image_url: string;
  last_access: string; // ISO string
  date_of_registration: string; // ISO string
  total_donations_received: number;
  total_amount_received: number;
  receive_notification: boolean;
  http_response: HttpResponse;
}

interface StreamerData {
  nickname: string;
  streamer_balance: number;
  email: string;
  is_auto_play: boolean;
  min_amount: number;
  max_characters_name: number;
  max_characters_message: number;
  qr_code_is_dark_theme: boolean;
  add_messages_bellow: boolean;
  donate_is_dark_theme: boolean;
  http_response: HttpResponse;
  info_streamer: InfoStreamerData;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function AccountSettings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Conta");

  const [streamerData, setStreamerData] = useState<StreamerData>({
    nickname: "Carregando...",
    streamer_balance: 0,
    email: "Carregando...",
    is_auto_play: false,
    min_amount: 0,
    max_characters_name: 0,
    max_characters_message: 0,
    qr_code_is_dark_theme: false,
    add_messages_bellow: false,
    donate_is_dark_theme: false,
    http_response: { status: "WAIT", message: "Carregando dados..." },
    info_streamer: {
      full_name: "Carregando...",
      cpf: "",
      profile_image_url: "",
      last_access: "",
      date_of_registration: "",
      total_donations_received: 0,
      total_amount_received: 0,
      receive_notification: false,
      http_response: { status: "WAIT", message: "Carregando dados..." }
    }
  });

  const [, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [emailBlurred, setEmailBlurred] = useState(() => JSON.parse(localStorage.getItem('emailBlurred') || 'true'));
  const [totalReceivedBlurred, setTotalReceivedBlurred] = useState(() => JSON.parse(localStorage.getItem('totalReceivedBlurred') || 'true'));
  const [totalDonationsBlurred, setTotalDonationsBlurred] = useState(() => JSON.parse(localStorage.getItem('totalDonationsBlurred') || 'true'));

  const blurEmail = () =>
    setEmailBlurred((prev: boolean) => {
      localStorage.setItem('emailBlurred', JSON.stringify(!prev));
      return !prev;
    });
  
  const blurTotalReceived = () =>
    setTotalReceivedBlurred((prev: boolean) => {
      localStorage.setItem('totalReceivedBlurred', JSON.stringify(!prev));
      return !prev;
    });
  
  const blurTotalDonations = () =>
    setTotalDonationsBlurred((prev: boolean) => {
      localStorage.setItem('totalDonationsBlurred', JSON.stringify(!prev));
      return !prev;
    });
  

  

  const updateStreamerField = (field: keyof StreamerData, value: any) => {
    setStreamerData(prev => ({ ...prev, [field]: value }));
  };

  const updateInfoStreamerField = (field: keyof InfoStreamerData, value: any) => {
    setStreamerData(prev => ({
      ...prev,
      info_streamer: { ...prev.info_streamer, [field]: value }
    }));
  };

  const updatePasswordField = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data: StreamerData = await getStreamerData();
        setStreamerData(data);
      } catch (err) {
        console.error("Erro ao buscar streamer:", err);
        navigate("/streamer/dashboard/login");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="dashboardContainer" style={{ display: "flex", gap: "10px" }}>
      <NavBarDashboard activeItem={active} onSelect={setActive} />
      <div className="gridContainer" style={{ width: "100%" }}>
        <div className="card">
          <div className="cardTitle">
            <User size={20} color="#667eea" />
            <p>Informações da Conta</p>
          </div>

          <div className="formGroup">
            <label>Email</label>
            <div className="balance-display">
              <p
                className="balance"
                style={{ filter: emailBlurred ? "blur(8px)" : "none", transition: "filter 0.3s ease", fontSize: "1.3rem" }}
              >
                {streamerData.email} {/* Se tiver email real, substitua aqui */}
              </p>
              <div onClick={blurEmail} style={{ cursor: "pointer" }}>
                {emailBlurred ? <EyeClosed size={32} /> : <Eye size={32} />}
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label>Nome do Streamer</label>
            <input
              type="text"
              value={streamerData.info_streamer.full_name}
              className="input"
              onChange={(e) => updateInfoStreamerField("full_name", e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>CPF do Streamer</label>
            <input
              type="text"
              value={streamerData.info_streamer.cpf}
              className="input"
              onChange={(e) => updateInfoStreamerField("cpf", e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Data de Criação</label>
            <input
              type="text"
              value={new Date(streamerData.info_streamer.date_of_registration).toLocaleDateString("pt-BR")}
              className="input"
              disabled
            />
          </div>

          <div className="formGroup">
            <label>Último Login</label>
            <input
              type="text"
              value={new Date(streamerData.info_streamer.last_access).toLocaleString("pt-BR")}
              className="input"
              disabled
            />
          </div><br />
        </div>

        <div className="card">
          <div className="cardTitle">
            <Clock size={20} color="#667eea" />
            <p>Histórico Total</p>
          </div>

          <div className="formGroup">
            <label>Valor Total Recebido em Reais</label>
            <div className="balance-display">
              <p
                className="value-account-page"
                style={{
                  filter: totalReceivedBlurred ? "blur(8px)" : "none",
                  transition: "filter 0.3s ease",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                R$ {streamerData.info_streamer.total_amount_received.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div onClick={blurTotalReceived} style={{ cursor: "pointer" }}>
                {totalReceivedBlurred ? <EyeClosed size={22} /> : <Eye size={22} />}
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label>Total de Doações Recebidas</label>
            <div className="balance-display">
              <p
                className="value-account-page"
                style={{
                  filter: totalDonationsBlurred ? "blur(8px)" : "none",
                  transition: "filter 0.3s ease",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                {streamerData.info_streamer.total_donations_received.toLocaleString("pt-BR")} doações
              </p>
              <div onClick={blurTotalDonations} style={{ cursor: "pointer" }}>
                {totalDonationsBlurred ? <EyeClosed size={22} /> : <Eye size={22} />}
              </div>
            </div>
            <div className="horizontal-line"></div><br />
            <div className="card">
                <p style={{fontSize: "0.95rem"}}><AlertOctagon size={12}/> Se você deseja atualizar a sua senha, clique no botão logo abaixo e receba um código no email para validação:</p>
                <button className="default-button">
                    Atualizar Senha
                </button>
            </div>
          </div>
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/account-security-illustration-svg-png-download-7382398.png" alt="banner-security" className="img-banner-security" style={{margin: "auto", width: "100%"}}/>

        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
