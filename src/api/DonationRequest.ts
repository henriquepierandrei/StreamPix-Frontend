import { ApiConfig } from "./ApiConfig";


export interface DonationRequest {
    name: string;
    message: string;
    amount: number;
    voice_type: string;
}

export const createDonationRequest = (
    name: string,
    message: string,
    amount: number,
    voiceType: string
): DonationRequest => ({
    name,
    message,
    amount,
    voice_type: voiceType
});

export const sendDonation = async (donation: DonationRequest) => {
    try {
        const api = ApiConfig.getInstance(); // pega a instância do axios
        const response = await api.post('/donation', donation); // POST com body
        return response.data;
    } catch (error) {
        throw error;
    }
};
