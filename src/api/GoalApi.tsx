import { ApiConfig } from "./ApiConfig";
import Cookies from "js-cookie";

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

  const checkAuth = () => {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Usuário não autenticado (token ausente).");
    }
  };

  const getGoal = async (): Promise<GoalPayload> => {
    checkAuth();
    const response = await api.get(`/streamer/goal`);
    return response.data;
  };

  const createGoal = async (payload: CreateGoalPayload): Promise<GoalPayload> => {
    checkAuth();
    const response = await api.post(`/streamer/goal`, payload);
    return response.data;
  };

  const updateGoal = async (payload: UpdateGoalPayload): Promise<GoalPayload> => {
    checkAuth();
    const response = await api.put(`/streamer/goal`, payload);
    return response.data;
  };

  const deleteGoal = async (): Promise<any> => {
    checkAuth();
    const response = await api.delete(`/streamer/goal`);
    return response.data;
  };

  return { getGoal, createGoal, updateGoal, deleteGoal };
};