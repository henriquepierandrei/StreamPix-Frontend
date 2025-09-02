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

  const getGoal = async (key: string, streamerId: number): Promise<GoalPayload> => {
    const response = await api.get(`/streamer/goal?key=${key}&streamer-id=${streamerId}`);
    return response.data;
  };

  const createGoal = async (
    key: string,
    streamerId: number,
    payload: CreateGoalPayload
  ): Promise<GoalPayload> => {
    const response = await api.post(`/streamer/goal?key=${key}&streamer-id=${streamerId}`, payload);
    return response.data;
  };

  const updateGoal = async (
    key: string,
    streamerId: number,
    payload: UpdateGoalPayload
  ): Promise<GoalPayload> => {
    const response = await api.put(`/streamer/goal?key=${key}&streamer-id=${streamerId}`, payload);
    return response.data;
  };

  const deleteGoal = async (key: string, streamerId: number): Promise<any> => {
    const response = await api.delete(`/streamer/goal?key=${key}&streamer-id=${streamerId}`);
    return response.data;
  };

  return { getGoal, createGoal, updateGoal, deleteGoal };
};
