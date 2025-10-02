import { ApiConfig } from "./ApiConfig";

export interface StreamerData {
  id: string; // <--- adicione isso
  nickname: string;
  streamer_balance: number;
  is_auto_play: boolean;
  min_amount: number;
  max_characters_name: number;
  max_characters_message: number;
  qr_code_is_dark_theme: boolean;
  add_messages_bellow: boolean;
  donate_is_dark_theme: boolean;
  http_response: {
    status: string;
    message: string;
  };
}

export async function getStreamerData(): Promise<StreamerData> {
  const api = ApiConfig.getInstance();
  const response = await api.get<StreamerData>("/streamer");
  return response.data;
}
