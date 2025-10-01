import { ApiConfig } from "./ApiConfig";
import Cookies from "js-cookie";

export const getStreamerData = async () => {
  try {
    const api = ApiConfig.getInstance();
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Usuário não autenticado (token ausente).");
    }

    // O interceptor do ApiConfig já adiciona o Bearer automaticamente
    // Não precisa passar o header manualmente
    const response = await api.get("/streamer");

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do streamer:", error);
    throw error;
  }
};