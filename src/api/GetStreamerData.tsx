import { ApiConfig } from "./ApiConfig";

export const getStreamerData = async () => {
  try {
    const api = ApiConfig.getInstance();
    const token = localStorage.getItem("token");

    if (token == null) {
      throw new Error("Usuário não autenticado (token ausente).");
    }

    const response = await api.get("/streamer", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do streamer:" + error);
    throw error;
  }
};
