import { ApiConfig } from "./ApiConfig";

interface DonationResponse {
  qrcode: string;
  amount: string;
  name: string;
  time_remaining_seconds: number;
  already_paid: boolean;
}

export const getDonation = async (uuid: string): Promise<DonationResponse> => {
  try {
    const api = ApiConfig.getInstance();
    const response = await api.get<DonationResponse>(`/donation/${uuid}`);
    return response.data;
  } catch (error: any) {
    // Se o status for 409, você pode tratar como expirado
    if (error.response?.status === 409) {
      throw { expired: true };
    }
    console.error("Erro ao buscar doação:", error);
    throw error;
  }
};
