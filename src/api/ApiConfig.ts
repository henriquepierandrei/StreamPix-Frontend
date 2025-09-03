import axios, { type AxiosInstance } from 'axios';

export class ApiConfig {
    private static instance: AxiosInstance;

    public static getInstance(): AxiosInstance {
        if (!ApiConfig.instance) {
            ApiConfig.instance = axios.create({
                baseURL: this.getBaseBackendURL(),
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            
        }

        return ApiConfig.instance;
    }

    public static getBaseBackendURL(): string {
        return 'http://localhost:8080';
    }
    public static getBaseFrontendURL(): string {
        return 'http://localhost:5173';
    }

     public static async validateKey(key: string): Promise<boolean> {
    try {
      const response = await this.getInstance().post<boolean>(
        "/streamer/key/validation",
        null,
        { params: { key } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao validar chave:", error);
      return false;
    }
  }
}

export const api = ApiConfig.getInstance();