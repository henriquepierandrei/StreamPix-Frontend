import { ApiConfig } from "./ApiConfig";


export interface SettingsAIVoice {
    voice_type: string;
    rate: number;
    pitch: number;
    volume: number;
    style: string;
    styledegree: number; // atenção: backend usa "styledegree" tudo minúsculo
}

export interface DonationRequest {
    streamer_name: string;
    name: string;
    message: string;
    amount: string; // no TS mantém string (input do usuário), backend converte p/ Double
    settings_ai_voice: SettingsAIVoice;
}

export const createDonationRequest = (
    streamer_name: string,
    name: string,
    message: string,
    amount: string,
    voiceType: string,
    voiceSettings: SettingsAIVoice
): DonationRequest => ({
    streamer_name,
    name,
    message,
    amount,
    settings_ai_voice: {
        voice_type: voiceType,
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        style: voiceSettings.style,
        styledegree: voiceSettings.styledegree
    }
});

export const sendDonation = async (donation: DonationRequest) => {
    try {
        const api = ApiConfig.getInstance(); // pega a instância do axios
        const response = await api.post('/donation?streamer-name=' + donation.streamer_name, donation); // POST com body
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getStreamerData = async (streamerName: string) => {
    try {
        const api = ApiConfig.getInstance();
        const response = await api.get(`/${streamerName}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
