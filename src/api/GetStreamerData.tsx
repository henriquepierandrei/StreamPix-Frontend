import { ApiConfig } from "./ApiConfig";

interface StreamerData {
  streamer_name: string;
  streamer_balance: number;
  is_auto_play: boolean;
  min_amount: number;
  max_characters_name: number;
  max_characters_message: number;
  http_response: {
    status: string;
    message: string;
  };
}

export const getStreamerData = async (key: string) => {
    try {
        const api = ApiConfig.getInstance(); // pega a instância do axios
        const response = await api.get('/streamer?key=' + key); // POST com body
        return response.data;
    } catch (error) {
        throw error;
    }
};