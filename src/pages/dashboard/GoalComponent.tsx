import React, { useEffect, useState } from "react";
import { Save, Replace, Trash, Goal, GoalIcon, Copy, AlertCircle } from "lucide-react";
import { ApiConfig } from "../../api/ApiConfig";
import { getStreamerData } from "../../api/GetStreamerData";
import type { CreateGoalPayload, UpdateGoalPayload } from "../../api/GoalApi";
import { useGoalApi } from "../../api/GoalApi";
import '../../pages/style/dashboard.css'
import NavBarDashboard from "../../components/navbar/NavBarDashboard";


interface GoalData {
  uuid?: string;
  balance_to_achieve: number;
  current_balance?: number;
  reason: string;
  end_at_in_days: number;
}

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

const GoalComponent: React.FC = () => {
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

  // Buscar dados do streamer
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

  // Buscar meta existente
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
      await navigator.clipboard.writeText(ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/goal/to-show/" + streamerData.streamer_name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      setAlertMessage("Erro ao copiar URL.");
    }
  };

  return (
    <div>

      <NavBarDashboard activeItem={active} onSelect={setActive} />
      <div className="dashboardContainer">
        <div className="gridContainer">

          {/* Criar / Atualizar Meta */}
          <div className="card">
            <div className="cardTitle">
              <GoalIcon size={20} color="#667eea" />
              <p>{updateGoalData ? "Atualizar Meta" : "Criar Meta"}</p>
            </div>
            <br />
            <div className="formGroup">
              <label>Valor para alcançar</label>
              <input
                type="number"
                placeholder="Valor a alcançar"
                min="0.01"
                step="0.01"
                value={updateGoalData?.balance_to_achieve ?? createGoalData.balance_to_achieve}
                onChange={(e) => handleChange("balance_to_achieve", Number(e.target.value), updateGoalData ? "update" : "create")}
              />
            </div>
            <div className="formGroup">
              <label>Motivo para alcançar</label>
              <input
                type="text"
                placeholder="Ex: Novo setup, viagem, etc."
                value={updateGoalData?.reason ?? createGoalData.reason}
                onChange={(e) => handleChange("reason", e.target.value, updateGoalData ? "update" : "create")}
              />
            </div>
            <div className="formGroup">
              <label>Dias de duração</label>
              <input
                type="number"
                placeholder="Dias"
                min="1"
                value={updateGoalData?.end_at_in_days ?? createGoalData.end_at_in_days}
                onChange={(e) => handleChange("end_at_in_days", Number(e.target.value), updateGoalData ? "update" : "create")}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              {!updateGoalData ? (
                <button
                  className="saveButton"
                  onClick={handleCreate}
                  disabled={isLoading}
                >
                  <Save size={20} /> {isLoading ? "Criando..." : "Criar Meta"}
                </button>
              ) : (
                <button
                  className="updateButton"
                  onClick={handleUpdate}
                  disabled={isLoading}
                >
                  <Replace size={20} /> {isLoading ? "Atualizando..." : "Atualizar Meta"}
                </button>
              )}
            </div>

            {updateGoalData && (
              <p style={{ color: "#b1aeae", fontSize: "0.8rem", display: "flex", gap: 5, alignItems: "center", marginTop: 10 }}>
                <AlertCircle size={12} /> Você pode atualizar somente o motivo e o dia de duração.
              </p>
            )}
          </div>

          {/* Visualização da Meta */}
          <div className="card">
            <div className="cardTitle">
              <Goal size={20} color="#667eea" />
              <p>Visualização da Meta</p>
            </div>
            <br />

            {goal ? (
              <>
                <div className="formGroup">
                  <div className="progress-bar-goal">
                    <p>{goal.reason || "Meta sem descrição"}</p>
                    <div className="bar-goal"
                      style={{
                        width: `${Math.min(((goal.current_balance ?? 0) / (goal.balance_to_achieve || 1)) * 100, 100)}%`,
                      }}
                    />
                    <p>
                      R$ {goal.current_balance ?? 0} / R$ {goal.balance_to_achieve ?? 0}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexDirection: "column", marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="text"
                      value={ApiConfig.getBaseFrontendURL() + "/streamer/dashboard/goal/to-show/" + streamerData.streamer_name}
                      readOnly
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button className="iconButton" style={{ width: 40, height: 40 }} onClick={handleCopyURL}>
                      <Copy size={20} />
                    </button>
                  </div>
                  {copied && <span style={{ color: "#9398a1", fontSize: "0.8rem", marginTop: -5 }}>URL copiada com sucesso!</span>}
                  {showDeleteConfirm && (
                    <div className="delete-alert">
                      <p>Tem certeza que deseja deletar?</p>
                      <div className="buttons">
                        <button className="confirm" onClick={confirmDelete}>Sim</button>
                        <button className="cancel" onClick={cancelDelete}>Não</button>
                      </div>
                    </div>
                  )}


                  <button
                    className="logoutButton"
                    onClick={handleDelete}
                    disabled={isLoading}
                    style={{ width: "100%", marginTop: 10 }}
                  >
                    <Trash size={20} /> {isLoading ? "Deletando..." : "Deletar Meta"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                <p>Nenhuma meta criada ainda.</p>
                <p style={{ fontSize: "0.8rem" }}>Crie uma meta para começar a acompanhar seu progresso!</p>
              </div>
            )}

            {alertMessage && (
              <p style={{
                color: alertMessage.includes("Erro") ? "red" : "green",
                fontSize: "0.8rem",
                marginTop: 10,
                padding: "8px",
                borderRadius: "4px",
              }}
                className="alert-message">
                {alertMessage}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoalComponent;