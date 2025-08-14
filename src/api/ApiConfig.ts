import axios, { type AxiosInstance } from 'axios';

export class ApiConfig {
    private static instance: AxiosInstance;

    public static getInstance(): AxiosInstance {
        if (!ApiConfig.instance) {
            ApiConfig.instance = axios.create({
                baseURL: 'http://localhost:8080/streampix',
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            
        }

        return ApiConfig.instance;
    }
}

export const api = ApiConfig.getInstance();