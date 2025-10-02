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

  const getGoal = async (): Promise<GoalPayload> => {
    try {
      const response = await api.get<GoalPayload>(`/streamer/goal`);
      return response.data;
    } catch (error: any) {
      console.error("Erro ao buscar meta:", error);
      throw error;
    }
  };

  const createGoal = async (payload: CreateGoalPayload): Promise<GoalPayload> => {
    try {
      const response = await api.post<GoalPayload>(`/streamer/goal`, payload);
      return response.data;
    } catch (error: any) {
      console.error("Erro ao criar meta:", error);
      throw error;
    }
  };

  const updateGoal = async (payload: UpdateGoalPayload): Promise<GoalPayload> => {
    try {
      const response = await api.put<GoalPayload>(`/streamer/goal`, payload);
      return response.data;
    } catch (error: any) {
      console.error("Erro ao atualizar meta:", error);
      throw error;
    }
  };

  const deleteGoal = async (): Promise<any> => {
    try {
      const response = await api.delete(`/streamer/goal`);
      return response.data;
    } catch (error: any) {
      console.error("Erro ao deletar meta:", error);
      throw error;
    }
  };

  return { getGoal, createGoal, updateGoal, deleteGoal };
};
