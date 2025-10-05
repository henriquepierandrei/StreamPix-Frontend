import React, { useEffect, useState } from "react";
import { Save, Replace, Trash, Goal, GoalIcon, Copy, AlertCircle, View, Loader2 } from "lucide-react";
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import type { CreateGoalPayload, UpdateGoalPayload } from "../../api/GoalApi";
import { useGoalApi } from "../../api/GoalApi";
// import '../../styles/dashboard.css' // REMOVA ESTA LINHA
import NavBarDashboard from "../../components/navbar/NavBarDashboard";


// [Interfaces permanecem as mesmas]
interface GoalData {
  uuid?: string;
  balance_to_achieve: number;
  current_balance?: number;
  reason: string;
  end_at_in_days: number;
}
interface StreamerData {
  id: string;
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


const GoalComponent: React.FC = () => {
  // [Lógica e Hooks permanecem inalterados]
  const { getGoal, createGoal, updateGoal, deleteGoal } = useGoalApi();
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [createGoalData, setCreateGoalData] = useState<GoalData>({
    balance_to_achieve: 0,
    reason: "",
    end_at_in_days: 1,
  });
  const [updateGoalData, setUpdateGoalData] = useState<GoalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [active, setActive] = useState("Metas");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [streamerData, setStreamerData] = useState<StreamerData>({
    id: "Carregando...",
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

  // ... (useEffect e Handlers permanecem inalterados) ...
  // [Seus useEffects e Handlers (handleCreate, handleUpdate, etc.) devem ser mantidos]

  // ... (Seus handlers de lógica ficam aqui) ...
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getStreamerData();
        setStreamerData(data);
      } catch (err) {
        console.error("Erro ao buscar streamer:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const existingGoal = await getGoal(); // sem streamerId
        if (existingGoal) {
          setGoal(existingGoal);
          setUpdateGoalData(existingGoal);
        }
      } catch (err) {
        console.error("Erro ao buscar meta:", err);
        setAlertMessage("Nenhuma meta existente.");
      }
    })();
  }, []);

  const handleCreate = async () => {
    if (!createGoalData.reason.trim()) {
      setAlertMessage("Por favor, informe o motivo da meta.");
      return;
    }
    if (createGoalData.balance_to_achieve <= 0) {
      setAlertMessage("O valor a alcançar deve ser maior que zero.");
      return;
    }
    setIsLoading(true);
    try {
      const created = await createGoal(createGoalData as CreateGoalPayload); // sem streamerId
      setGoal(created);
      setUpdateGoalData(created);
      setCreateGoalData({ balance_to_achieve: 0, reason: "", end_at_in_days: 1 });
      setAlertMessage("Meta criada com sucesso!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Erro ao criar meta:", err);
      setAlertMessage("Erro ao criar meta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateGoalData || !updateGoalData.uuid) {
      setAlertMessage("Dados insuficientes para atualizar a meta.");
      return;
    }
    if (!updateGoalData.reason.trim()) {
      setAlertMessage("Por favor, informe o motivo da meta.");
      return;
    }
    setIsLoading(true);
    try {
      const payload: UpdateGoalPayload = {
        uuid: updateGoalData.uuid,
        balance_to_achieve: updateGoalData.balance_to_achieve,
        reason: updateGoalData.reason,
        end_at_in_days: updateGoalData.end_at_in_days,
      };
      const updated = await updateGoal(payload); // sem streamerId
      setGoal(updated);
      setUpdateGoalData(updated);
      setAlertMessage("Meta atualizada com sucesso!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Erro ao atualizar meta:", err);
      setAlertMessage("Erro ao atualizar meta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal || !goal.uuid) {
      setAlertMessage("Nenhuma meta para deletar.");
      return;
    }
    setShowDeleteConfirm(true); // abre a div de confirmação
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false); // fecha o alerta
    setIsLoading(true);
    try {
      await deleteGoal();
      setGoal(null);
      setUpdateGoalData(null);
      setAlertMessage("Meta deletada com sucesso!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Erro ao deletar meta:", err);
      setAlertMessage("Erro ao deletar meta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false); // apenas fecha o alerta
  };



  const handleChange = (field: keyof GoalData, value: any, type: "create" | "update") => {
    if (type === "create") {
      setCreateGoalData(prev => ({ ...prev, [field]: value }));
    } else {
      setUpdateGoalData(prev => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/goal/to-show?streamerId=" + streamerData.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      setAlertMessage("Erro ao copiar URL.");
    }
  };


  const formatCurrency = (value: number | undefined) => {
    return (value ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const progress = Math.min(((goal?.current_balance ?? 0) / (goal?.balance_to_achieve || 1)) * 100, 100);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64">
      <NavBarDashboard activeItem={active} onSelect={setActive} />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Goal size={32} className="text-blue-500" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Gerenciar Metas
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e visualize suas metas de arrecadação para motivar seus espectadores.
          </p>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* COLUNA 1: Criar / Atualizar Meta */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 h-fit">

            {/* Título do Card */}
            <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
              <GoalIcon size={24} className="text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {updateGoalData ? "Atualizar Meta" : "Criar Nova Meta"}
              </h2>
            </div>

            {/* Formulário */}
            <div className="space-y-6">
              {/* Valor para alcançar */}
              <div className="formGroup">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor para alcançar (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    placeholder="Valor a alcançar"
                    min="0.01"
                    step="0.01"
                    value={updateGoalData?.balance_to_achieve ?? createGoalData.balance_to_achieve}
                    onChange={(e) => handleChange("balance_to_achieve", Number(e.target.value), updateGoalData ? "update" : "create")}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  />
                </div>
              </div>

              {/* Motivo para alcançar */}
              <div className="formGroup">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivo para alcançar</label>
                <input
                  type="text"
                  placeholder="Ex: Novo setup, viagem, etc."
                  value={updateGoalData?.reason ?? createGoalData.reason}
                  onChange={(e) => handleChange("reason", e.target.value, updateGoalData ? "update" : "create")}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                />
              </div>

              {/* Dias de duração */}
              <div className="formGroup">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dias de duração</label>
                <input
                  type="number"
                  placeholder="Dias"
                  min="1"
                  value={updateGoalData?.end_at_in_days ?? createGoalData.end_at_in_days}
                  onChange={(e) => handleChange("end_at_in_days", Number(e.target.value), updateGoalData ? "update" : "create")}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8">
              {!updateGoalData ? (
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:transform-none"
                  onClick={handleCreate}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {isLoading ? "Criando..." : "Criar Meta"}
                </button>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:transform-none"
                  onClick={handleUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Replace size={20} />}
                  {isLoading ? "Atualizando..." : "Atualizar Meta"}
                </button>
              )}
            </div>

            {/* Observação */}
            {updateGoalData && (
              <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-4">
                <AlertCircle size={12} className="flex-shrink-0" /> Você pode atualizar somente o motivo e o dia de duração.
              </p>
            )}
          </div>

          {/* COLUNA 2: Visualização da Meta, URL e Especificações OBS */}
          <div className="space-y-8">

            {/* Card: Visualização da Meta */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8">
              <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                <Goal size={24} className="text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Acompanhamento da Meta
                </h2>
              </div>

              {goal ? (
                <>
                  {/* Barra de Progresso Moderna */}
                  <div className="mb-6 space-y-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{goal.reason || "Meta sem descrição"}</p>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-1">
                      **{formatCurrency(goal.current_balance)}** / **{formatCurrency(goal.balance_to_achieve)}** (R$)
                    </p>
                  </div>

                  {/* URL e Botões de Ação */}
                  <div className="flex flex-col gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL para Browser Source (OBS/Streamlabs)</label>

                    <div className="flex gap-2">
                      {/* Campo de Input (Somente Leitura) */}
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/goal/to-show?streamerId=" + streamerData.id}
                          readOnly
                          className="w-full px-4 py-3 pr-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white truncate focus:outline-none"
                        />
                      </div>

                      {/* NOVO BOTÃO 1: VISUALIZAR (Olho) */}
                      <a
                        href={ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/goal/to-show?streamerId=" + streamerData.id}
                        target="_blank" // ABRIR EM NOVA ABA
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl transition duration-150"
                        title="Visualizar Meta (Abre em nova aba)"
                      >
                        <View size={20} />
                      </a>

                      {/* Botão 2: COPIAR */}
                      <button
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition duration-150"
                        onClick={handleCopyURL}
                        title="Copiar URL"
                      >
                        <Copy size={20} />
                      </button>
                    </div>

                    {copied && <span className="text-green-500 text-xs mt-[-10px]">URL copiada com sucesso!</span>}

                    {/* Botão Deletar */}
                    <button
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl shadow-md transition duration-200 ease-in-out mt-2"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash size={20} /> {isLoading ? "Deletando..." : "Deletar Meta"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Goal size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Nenhuma meta criada ainda.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Use o painel ao lado para criar sua primeira meta.</p>
                </div>
              )}
            </div>

            {/* Card: Confirmação de Exclusão (Modal/Alerta) */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tem certeza que deseja deletar?</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Esta ação é irreversível.</p>
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={cancelDelete}
                    >
                      Não
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                      onClick={confirmDelete}
                    >
                      Sim, Deletar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card: Especificações no OBS */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8">
              <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                <View size={24} className="text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Especificações de Fonte no OBS/Streamlabs
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-600 dark:text-gray-400">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-300">
                      <th className="py-2 pr-4">Propriedade</th>
                      <th className="py-2">Valor Recomendado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">Width</td>
                      <td className="py-2.5 font-mono text-sm">520px</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">Height</td>
                      <td className="py-2.5 font-mono text-sm">60px</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">FPS</td>
                      <td className="py-2.5 font-mono text-sm">30</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">CSS Personalizado</td>
                      <td className="py-2.5">Fundo transparente</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">Shutdown source when not visible</td>
                      <td className="py-2.5 text-red-500 font-semibold">Desmarcado (❎)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">Refresh browser when scene becomes active</td>
                      <td className="py-2.5 text-red-500 font-semibold">Desmarcado (❎)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Mensagem de Alerta (Global) */}
        {alertMessage && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl transition-opacity duration-300 z-50 ${alertMessage.includes("sucesso")
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
            }`}>
            <p className="flex items-center gap-2 text-sm font-semibold">
              {alertMessage.includes("sucesso") ? <Save size={16} /> : <AlertCircle size={16} />}
              {alertMessage}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GoalComponent;