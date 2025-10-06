import { CalendarArrowDown, Clapperboard, DollarSign, Filter, MessageSquareMore, Settings, SquarePlayIcon, Clock, UserStarIcon, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import PlayButtonAudio from '../../components/buttons/PlayButtonAudio';
import ReplayButtonDonation from '../../components/buttons/ReplayButtonDonation';
import NavBarDashboard from '../../components/navbar/NavBarDashboard';
import { useNavigate } from "react-router-dom";

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

interface DonationResponse {
  uuid: string;
  name: string;
  amount: number;
  message: string;
  donated_at: string;
  audio_url?: string;
}

interface PaginatedDonations {
  content: DonationResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

function DonationsPage() {
  const navigate = useNavigate();
  const [donates, setDonates] = useState<DonationResponse[]>([]);
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [active, setActive] = useState("Doações");
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

  const handleSave = async (data?: StreamerData) => {
    setIsLoading(true);
    try {
      const api = ApiConfig.getInstance();
      const payload = data ?? streamerData;

      const response = await api.put<StreamerData>(`/streamer`, payload);
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

  const handleToggleAutoPlay = (checked: boolean) => {
    updateField("is_auto_play", checked);
    handleSave({ ...streamerData, is_auto_play: checked });
  };

  const refreshDonations = () => {
    window.location.reload();
  }

  const fetchDonates = async () => {
    try {
      setIsLoading(true);
      const api = ApiConfig.getInstance();

      // [Seu código para 'params' permanece aqui]
      const params = new URLSearchParams({
        page: "0",
        size: "10",
        sort: "donatedAt,desc",
      });

      if (minAmount !== undefined) params.append("minAmount", minAmount.toString());
      if (maxAmount !== undefined) params.append("maxAmount", maxAmount.toString());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // Chamada à API
      const response = await api.get<PaginatedDonations>(`/streamer/log/donations?${params.toString()}`);

      // CORREÇÃO: Mapeia e converte o valor.
      const normalizedDonations = response.data.content.map(donation => {

        // Troca a vírgula por ponto (ex: "0,01" -> "0.01")
        const normalizedAmountString = String(donation.amount).replace(',', '.');

        // Converte para Number (ex: "0.01" -> 0.01)
        const amountNumber = Number(normalizedAmountString);

        return {
          ...donation,
          amount: amountNumber
        };
      });

      setDonates(normalizedDonations);

    } catch (err) {
      console.error("Erro ao buscar donates:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const data = await getStreamerData();
        setStreamerData(data);
        await fetchDonates();
      } catch (err: any) {
        console.error("Erro ao inicializar página:", err.message || err);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:pl-64">
      <NavBarDashboard activeItem={active} />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={28} className="text-blue-500" />
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Doações Recebidas
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gerencie e visualize todas as doações recebidas
          </p>
        </div>

        {/* Filters Card */}
        {/* Filters Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Filtros de Busca
          </h2>

          {/* Grid de Filtros - Responsivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">

            {/* Faixa de Valor */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Faixa de Valor
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={minAmount ?? ""}
                    onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={maxAmount ?? ""}
                    onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Período
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CalendarArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                  <input
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) => setStartDate(e.target.value || undefined)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="relative">
                  <CalendarArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                  <input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value || undefined)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Botão Filtrar */}
            <button
              onClick={fetchDonates}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out hover:scale-[1.02]"
            >
              <Filter
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
              />
              Filtrar
            </button>

            {/* Botão Reload */}
            <button
              onClick={refreshDonations}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 px-6 py-2.5 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold rounded-xl shadow-sm transition duration-200 ease-in-out"
            >
              <RefreshCcw
                size={18}
                className="transition-transform duration-500 ease-in-out group-hover:rotate-180"
              />
              Reload
            </button>

            {/* Botão Limpar */}
            <button
              onClick={clearDonates}
              className="group flex items-center justify-center gap-2 px-6 py-2.5 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold rounded-xl shadow-sm transition-all duration-300 ease-in-out overflow-hidden"
            >
              <Clapperboard
                size={18}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12"
              />
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                Limpar
              </span>
            </button>

            {/* Botão Auto Play */}
            <button
              onClick={() => handleToggleAutoPlay(!streamerData.is_auto_play)}
              disabled={isLoading}
              className={`group flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-xl shadow-sm transition-all duration-300 ease-in-out disabled:opacity-50 transform hover:scale-[1.02] ${streamerData.is_auto_play
                  ? 'bg-white text-green-600 border border-green-600 dark:bg-zinc-800 dark:text-green-400 dark:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/50'
                  : 'bg-white text-red-600 border border-red-600 dark:bg-zinc-800 dark:text-red-400 dark:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/50'
                }`}
            >
              <SquarePlayIcon
                size={18}
                className={`transition-all duration-300 ${streamerData.is_auto_play
                    ? 'group-hover:scale-125 group-hover:animate-pulse'
                    : 'group-hover:-translate-x-[2px] group-hover:translate-y-[1px]'
                  }`}
              />
              <span className="hidden sm:inline">
                {streamerData.is_auto_play ? 'Auto Play Ativado' : 'Auto Play Desativado'}
              </span>
              <span className="sm:hidden">
                {streamerData.is_auto_play ? 'Auto Play' : 'Auto Play'}
              </span>
            </button>

          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && donates.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-12 text-center">
            <MessageSquareMore size={64} className="mx-auto text-zinc-400 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              Nenhuma doação encontrada
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Ajuste os filtros ou aguarde novas doações
            </p>
          </div>
        )}

        {/* Donations List (Table-like) */}
        {!isLoading && donates.length > 0 && (
          <div className="space-y-6">
            {Object.entries(
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
              <div key={date} className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
                {/* Date Header (Manteve gradiente azul para destaque) */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">
                    {date}
                  </h3>
                </div>

                {/* Table Header (visible only on larger screens) */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <div className="col-span-2">Valor</div>
                  <div className="col-span-2">Doador</div>
                  <div className="col-span-4">Mensagem</div>
                  <div className="col-span-2">Data/Hora</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>

                {/* Donations Rows */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {donations.map((donate) => (
                    <div
                      key={donate.uuid}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150"
                    >
                      {/* Valor */}
                      <div className="col-span-1 md:col-span-2 flex items-center">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            R$ {donate.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Doador */}
                      <div className="col-span-1 md:col-span-2 flex items-center">
                        <div className="flex items-center gap-2">
                          <UserStarIcon size={16} className="text-blue-500 flex-shrink-0" />
                          <p className="font-semibold text-zinc-900 dark:text-white truncate">
                            {donate.name}
                          </p>
                        </div>
                      </div>

                      {/* Mensagem */}
                      <div className="col-span-1 md:col-span-4 flex items-center">
                        <div className="flex items-start gap-2 w-full">
                          <MessageSquareMore size={16} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                            {donate.message}
                          </p>
                        </div>
                      </div>

                      {/* Data/Hora */}
                      <div className="col-span-1 md:col-span-2 flex items-center">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <Clock size={14} className="flex-shrink-0" />
                          <span className="truncate">
                            {new Date(donate.donated_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end gap-2">
                        <ReplayButtonDonation uuid={donate.uuid} />
                        {donate.audio_url && <PlayButtonAudio src={donate.audio_url} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DonationsPage;