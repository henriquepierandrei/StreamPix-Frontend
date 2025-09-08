import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from "axios";

export class ApiConfig {
  private static instance: AxiosInstance;
  private static publicInstance: AxiosInstance;

  // Client autenticado (com Bearer + refresh)
  public static getInstance(): AxiosInstance {
    if (!ApiConfig.instance) {
      ApiConfig.instance = axios.create({
        baseURL: 'http://localhost:8080',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Interceptor global
      ApiConfig.instance.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem("token");
          if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      ApiConfig.instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as any;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await ApiConfig.refreshToken();
            if (newToken) {
              originalRequest.headers!['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              ApiConfig.logout();
            }
          }

          return Promise.reject(error);
        }
      );

    }

    return ApiConfig.instance;
  }

  // Client público (sem Bearer)
  public static getPublicInstance(): AxiosInstance {
    if (!ApiConfig.publicInstance) {
      ApiConfig.publicInstance = axios.create({
        baseURL: this.getBaseBackendURL(),
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ApiConfig.publicInstance;
  }

  // ... refreshToken, logout etc. ficam iguais
  private static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await axios.post(`${this.getBaseBackendURL()}/auth/refresh`, { refreshToken });

      const { token, refreshToken: newRefresh, tokenExpireAt, refreshTokenExpireAt } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpireAt", tokenExpireAt);

      if (newRefresh) {
        localStorage.setItem("refreshToken", newRefresh);
      }

      if (refreshTokenExpireAt) {
        localStorage.setItem("refreshTokenExpireAt", refreshTokenExpireAt);
      }

      return token;
    } catch {
      return null;
    }
  }


  public static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }

  public static getBaseBackendURL(): string {
    return "http://localhost:8080";
  }

  public static getBaseFrontendURL(): string {
    return "http://localhost:5173";
  }
}

export const api = ApiConfig.getInstance();      // usa quando precisa de token
export const apiPublic = ApiConfig.getPublicInstance(); // usa quando não precisa
