import axios from "axios";



export class ApiConfig {
  private static instance: any;
  private static publicInstance: any;

  // Client autenticado (com Bearer + refresh)
  public static getInstance(): any {
    if (!ApiConfig.instance) {
      ApiConfig.instance = axios.create({
        baseURL: this.getBaseBackendURL(),
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Interceptor global
      ApiConfig.instance.interceptors.request.use(
        (config: any) => {
          const token = localStorage.getItem("token");
          if (token) {
            if (!config.headers) config.headers = {};
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error: any) => Promise.reject(error)
      );

      ApiConfig.instance.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await ApiConfig.refreshToken();
            if (newToken) {
              if (!originalRequest.headers) originalRequest.headers = {};
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
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
  public static getPublicInstance(): any {
    if (!ApiConfig.publicInstance) {
      ApiConfig.publicInstance = axios.create({
        baseURL: this.getBaseBackendURL(),
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ApiConfig.publicInstance;
  }

  private static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await axios.post(`${this.getBaseBackendURL()}/auth/refresh`, { refreshToken });

      interface RefreshResponse {
        token: string;
        refreshToken?: string;
        tokenExpireAt: string;
        refreshTokenExpireAt?: string;
      }

      const data = response.data as RefreshResponse;
      const { token, refreshToken: newRefresh, tokenExpireAt, refreshTokenExpireAt } = data;

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
    return "https://streampix.fun";
  }

  
  public static getBaseFrontendURL(): string {
    return "https://streampix.vercel.app";
  }
}

export const api = ApiConfig.getInstance();      // usa quando precisa de token
export const apiPublic = ApiConfig.getPublicInstance(); // usa quando não precisa