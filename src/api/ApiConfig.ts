import axios from "axios";
import Cookies from "js-cookie";

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
          const token = Cookies.get("token");
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
      const refreshToken = Cookies.get("refreshToken");
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

      // Calcula expires baseado no tokenExpireAt
      const tokenExpires = new Date(tokenExpireAt);
      Cookies.set("token", token, { 
        expires: tokenExpires,
        secure: true,
        sameSite: 'strict'
      });
      Cookies.set("tokenExpireAt", tokenExpireAt, { 
        expires: tokenExpires,
        secure: true,
        sameSite: 'strict'
      });

      if (newRefresh) {
        const refreshExpires = refreshTokenExpireAt ? new Date(refreshTokenExpireAt) : 30; // 30 dias default
        Cookies.set("refreshToken", newRefresh, { 
          expires: refreshExpires,
          secure: true,
          sameSite: 'strict'
        });
      }

      if (refreshTokenExpireAt) {
        const refreshExpires = new Date(refreshTokenExpireAt);
        Cookies.set("refreshTokenExpireAt", refreshTokenExpireAt, { 
          expires: refreshExpires,
          secure: true,
          sameSite: 'strict'
        });
      }

      return token;
    } catch {
      return null;
    }
  }

  public static logout() {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("tokenExpireAt");
    Cookies.remove("refreshTokenExpireAt");
    window.location.href = "/login";
  }

  // Helper para salvar tokens (use após login)
  public static saveTokens(
    token: string, 
    refreshToken: string, 
    tokenExpireAt: string, 
    refreshTokenExpireAt: string
  ) {
    const tokenExpires = new Date(tokenExpireAt);
    const refreshExpires = new Date(refreshTokenExpireAt);

    Cookies.set("token", token, { 
      expires: tokenExpires,
      secure: true,
      sameSite: 'strict'
    });
    Cookies.set("tokenExpireAt", tokenExpireAt, { 
      expires: tokenExpires,
      secure: true,
      sameSite: 'strict'
    });
    Cookies.set("refreshToken", refreshToken, { 
      expires: refreshExpires,
      secure: true,
      sameSite: 'strict'
    });
    Cookies.set("refreshTokenExpireAt", refreshTokenExpireAt, { 
      expires: refreshExpires,
      secure: true,
      sameSite: 'strict'
    });
  }

  public static getBaseBackendURL(): string {
    return "http://localhost:8080";
    // return "https://streampix.fun";
  }

  public static getBaseFrontendURL(): string {
    return "http://localhost:5173";
    // return "https://streampix.vercel.app";
  }
}

export const api = ApiConfig.getInstance();
export const apiPublic = ApiConfig.getPublicInstance();