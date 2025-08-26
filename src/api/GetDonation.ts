import { ApiConfig } from "./ApiConfig";
interface DonationResponse {
    qrcode: string;
    amount: string;
    name: string;
    time_remaining_seconds: number;
}

export const getDonation = async (uuid: string): Promise<DonationResponse> => {
    try {
        const api = ApiConfig.getInstance(); // pega a instância do axios
        const response = await api.get(`/donation/${uuid}`);
        return response.data;
    } catch (error) {
        throw error;
        console.error("Error fetching donation:", error);
    }
};