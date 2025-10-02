import axios from "axios";
import Cookies from "js-cookie";

// Tipos
type AxiosInstance = ReturnType<typeof axios.create>;
interface RefreshResponse {
  token: string;
  refreshToken?: string;
  tokenExpireAt: string;
  refreshTokenExpireAt?: string;
}

export class ApiConfig {
  private static instance: AxiosInstance;
  private static publicInstance: AxiosInstance;
  private static isRefreshing = false;
  private static failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  private static processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  private static isTokenExpired(expireAt: string | undefined): boolean {
    if (!expireAt) return true;
    const expirationTime = Number(expireAt);
    const currentTime = Date.now();
    // Considera expirado se faltar menos de 30 segundos
    return expirationTime - currentTime < 30000;
  }

  public static getInstance(): AxiosInstance {
    if (!ApiConfig.instance) {
      ApiConfig.instance = axios.create({
        baseURL: this.getBaseBackendURL(),
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request Interceptor
      ApiConfig.instance.interceptors.request.use(
        (config) => {
          const token = Cookies.get("token");
          
          if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error: unknown) => Promise.reject(error)
      );

      // Response Interceptor
      ApiConfig.instance.interceptors.response.use(
        (response) => response,
        async (error: any) => {
          const originalRequest = error.config;

          // Se não é erro 401/403 ou já tentou retry, rejeita
          const status = error.response?.status;
          if ((status !== 401 && status !== 403) || originalRequest._retry) {
            return Promise.reject(error);
          }

          // Se já está fazendo refresh, enfileira a requisição
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return ApiConfig.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              this.processQueue(null, newToken);
              return ApiConfig.instance(originalRequest);
            } else {
              this.processQueue(new Error('Refresh failed'), null);
              this.logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
      );
    }

    return ApiConfig.instance;
  }

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

  public static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = Cookies.get("refreshToken");
      const refreshTokenExpireAt = Cookies.get("refreshTokenExpireAt");

      if (!refreshToken) {
        console.log("Refresh token não encontrado");
        return null;
      }

      // Verifica se o refresh token está expirado
      if (this.isTokenExpired(refreshTokenExpireAt)) {
        console.log("Refresh token expirado");
        return null;
      }

      console.log("Tentando refresh do token...");
      
      const response = await axios.post<RefreshResponse>(
        `${this.getBaseBackendURL()}/auth/refresh`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const { 
        token, 
        refreshToken: newRefresh, 
        tokenExpireAt, 
        refreshTokenExpireAt: newRefreshExpireAt 
      } = response.data;

      this.saveTokens(
        token, 
        newRefresh || refreshToken, 
        tokenExpireAt, 
        newRefreshExpireAt || refreshTokenExpireAt!
      );

      console.log("Token refreshed com sucesso");
      return token;
    } catch (error) {
      console.error("Erro ao fazer refresh do token:", error);
      return null;
    }
  }

  public static logout() {
    console.log("Fazendo logout...");
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("tokenExpireAt");
    Cookies.remove("refreshTokenExpireAt");
    window.location.href = "/login";
  }

  public static saveTokens(
    token: string, 
    refreshToken: string, 
    tokenExpireAt: string, 
    refreshTokenExpireAt: string
  ) {
    console.log("=== SALVANDO TOKENS ===");
    console.log("Token:", token?.substring(0, 20) + "...");
    console.log("tokenExpireAt:", tokenExpireAt);
    console.log("refreshTokenExpireAt:", refreshTokenExpireAt);

    const tokenExpires = new Date(Number(tokenExpireAt));
    const refreshExpires = new Date(Number(refreshTokenExpireAt));

    console.log("Token expira em:", tokenExpires);
    console.log("Refresh expira em:", refreshExpires);

    const cookieOptions = {
      secure: window.location.protocol === 'https:',
      sameSite: 'strict' as const,
      path: '/',
    };

    Cookies.set("token", token, { ...cookieOptions, expires: tokenExpires });
    Cookies.set("tokenExpireAt", tokenExpireAt, { ...cookieOptions, expires: tokenExpires });
    Cookies.set("refreshToken", refreshToken, { ...cookieOptions, expires: refreshExpires });
    Cookies.set("refreshTokenExpireAt", refreshTokenExpireAt, { ...cookieOptions, expires: refreshExpires });

    // Verifica se salvou
    console.log("Token salvo?", Cookies.get("token") ? "SIM" : "NÃO");
    console.log("RefreshToken salvo?", Cookies.get("refreshToken") ? "SIM" : "NÃO");
  }

  public static getBaseBackendURL(): string {
    return "http://localhost:8080";
  }

  public static getBaseFrontendURL(): string {
    return "http://localhost:5173";
  }
}

export const api = ApiConfig.getInstance();
export const apiPublic = ApiConfig.getPublicInstance();