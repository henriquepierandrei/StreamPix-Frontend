import { ApiConfig } from "./ApiConfig";

export const getStreamerData = async (key: string) => {
    try {
        const api = ApiConfig.getInstance(); // pega a instância do axios
        const response = await api.get('/streamer?key=' + key); // POST com body
        return response.data;
    } catch (error) {
        throw error;
    }
};