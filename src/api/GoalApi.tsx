import { ApiConfig } from "./ApiConfig";

// Tipos para metas
export interface GoalPayload {
  uuid: string;
  current_balance: number;
  balance_to_achieve: number;
  reason: string;
  end_at_in_days: number;
}

export interface CreateGoalPayload {
  balance_to_achieve: number;
  reason: string;
  end_at_in_days: number;
}

export interface UpdateGoalPayload {
  uuid: string;
  balance_to_achieve?: number;
  reason?: string;
  end_at_in_days?: number;
}

export const useGoalApi = () => {
  const api = ApiConfig.getInstance();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não autenticado (token ausente).");
    return { Authorization: `Bearer ${token}` };
  };

  const getGoal = async (): Promise<GoalPayload> => {
    const response = await api.get(`/streamer/goal`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  const createGoal = async (payload: CreateGoalPayload): Promise<GoalPayload> => {
    const response = await api.post(`/streamer/goal`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  const updateGoal = async (payload: UpdateGoalPayload): Promise<GoalPayload> => {
    const response = await api.put(`/streamer/goal`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  const deleteGoal = async (): Promise<any> => {
    const response = await api.delete(`/streamer/goal`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  return { getGoal, createGoal, updateGoal, deleteGoal };
};
