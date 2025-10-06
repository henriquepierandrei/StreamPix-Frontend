import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBarDashboard from "../../components/navbar/NavBarDashboard";
import { Eye, EyeOff, Clock, User, AlertOctagon } from "lucide-react";
import { getStreamerData } from "../../api/GetStreamerData";

interface HttpResponse {
  status: string;
  message: string;
}

interface InfoStreamerData {
  full_name: string;
  cpf: string;
  profile_image_url: string;
  last_access: string;
  date_of_registration: string;
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
      cpf: "Carregando...",
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

  const [isLoading, setIsLoading] = useState(false);
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

  const blurClass = "filter blur-sm select-none";

  const getBlurredEmail = () => {
    if (streamerData.email === "Carregando...") return streamerData.email;

    if (emailBlurred) {
      const parts = streamerData.email.split('@');
      if (parts.length === 2) {
        return '**********' + '@' + parts[1];
      }
    }
    return streamerData.email;
  };



  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [navigate]);

  const loadingText = isLoading ? "..." : "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:pl-64">
      <NavBarDashboard activeItem={active} />

      <main className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-6">
          Configurações da Conta {loadingText}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: Informações da Conta */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 h-fit">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <User size={24} className="text-blue-500" />
              <p className="text-xl font-semibold text-zinc-900 dark:text-white">Detalhes do Usuário</p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</label>
                <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700">
                  <p className={`text-base text-zinc-800 dark:text-zinc-200 truncate transition-all duration-300 ease-in-out ${emailBlurred ? blurClass : 'blur-none'}`}>
                    {emailBlurred ? getBlurredEmail() : streamerData.email}
                  </p>
                  <button
                    onClick={blurEmail}
                    className="
                      flex items-center justify-center
                      w-10 h-10
                      p-2
                      rounded-full
                      text-zinc-500 dark:text-zinc-400
                      hover:bg-zinc-200 dark:hover:bg-zinc-700
                      transition-colors
                    "
                    aria-label={emailBlurred ? "Mostrar Email" : "Esconder Email"}
                  >
                    {emailBlurred ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>

                </div>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Nome Completo</label>
                <input
                  type="text"
                  value={streamerData.info_streamer.full_name}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-200 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition duration-150 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* CPF */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">CPF (apenas visualização)</label>
                <input
                  type="text"
                  value={streamerData.info_streamer.cpf}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-200 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition duration-150 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Data de Criação */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Data de Criação</label>
                <input
                  type="text"
                  value={streamerData.info_streamer.date_of_registration ? new Date(streamerData.info_streamer.date_of_registration).toLocaleDateString("pt-BR") : "N/A"}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-200 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition duration-150 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Último Login */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Último Login</label>
                <input
                  type="text"
                  value={streamerData.info_streamer.last_access ? new Date(streamerData.info_streamer.last_access).toLocaleString("pt-BR") : "N/A"}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-200 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition duration-150 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Histórico Total e Segurança */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 h-fit flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                <Clock size={24} className="text-blue-500" />
                <p className="text-xl font-semibold text-zinc-900 dark:text-white">Histórico Total</p>
              </div>

              {/* Valor Total Recebido */}
              <div className="space-y-1 mb-4">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Valor Total Recebido em Reais</label>
                <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700">
                  <p className={`text-xl font-bold text-green-600 dark:text-green-400 transition-all duration-300 ease-in-out ${totalReceivedBlurred ? blurClass : 'blur-none'}`}>
                    R$ {streamerData.info_streamer.total_amount_received.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <button onClick={blurTotalReceived} className=" flex items-center justify-center
                      w-10 h-10
                      p-2
                      rounded-full
                      text-zinc-500 dark:text-zinc-400
                      hover:bg-zinc-200 dark:hover:bg-zinc-700
                      transition-colors" aria-label={totalReceivedBlurred ? "Mostrar Valor" : "Esconder Valor"}>
                    {totalReceivedBlurred ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {/* Total de Doações Recebidas */}
              <div className="space-y-1 mb-6">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total de Doações Recebidas</label>
                <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700">
                  <p className={`text-lg font-bold text-zinc-800 dark:text-zinc-200 transition-all duration-300 ease-in-out ${totalDonationsBlurred ? blurClass : 'blur-none'}`}>
                    {streamerData.info_streamer.total_donations_received.toLocaleString("pt-BR")} doações
                  </p>
                  <button onClick={blurTotalDonations} className=" flex items-center justify-center
                      w-10 h-10
                      p-2
                      rounded-full
                      text-zinc-500 dark:text-zinc-400
                      hover:bg-zinc-200 dark:hover:bg-zinc-700
                      transition-colors" aria-label={totalDonationsBlurred ? "Mostrar Doações" : "Esconder Doações"}>
                    {totalDonationsBlurred ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Box de Atualização de Senha */}
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800 rounded-lg space-y-3">
              <p className="text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <AlertOctagon size={16} className="text-yellow-500 flex-shrink-0" />
                Se você deseja atualizar a sua senha, clique no botão logo abaixo e receba um código no email para validação:
              </p>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50" disabled={isLoading}>
                Atualizar Senha
              </button>
            </div>

            {/* Imagem de Segurança */}
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/account-security-illustration-svg-png-download-7382398.png"
              alt="banner-security"
              className="mt-4 object-contain w-full max-h-48"
              style={{ margin: "auto" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


export default AccountSettings;