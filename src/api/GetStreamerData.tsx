import { ApiConfig } from "./ApiConfig";

export interface InfoStreamerData {
  full_name: string;
  cpf: string;
  profile_image_url: string;
  last_access: string;
  date_of_registration: string;
  total_donations_received: number;
  total_amount_received: number;
  receive_notification: boolean;
  http_response: { status: string; message: string };
}

export interface StreamerData {
  id: string;
  nickname: string;
  streamer_balance: number;
  email: string;
  is_auto_play: boolean;
  min_amount: number;
  max_characters_name: number;
  max_characters_message: number;
  qr_code_is_dark_theme: boolean;
  add_messages_bellow: boolean;
  donate_is_dark_theme: boolean;
  http_response: { status: string; message: string };
  info_streamer: InfoStreamerData;
}

export async function getStreamerData(): Promise<StreamerData> {
  const api = ApiConfig.getInstance();
  const response = await api.get<StreamerData>("/streamer"); // ✅ tipagem explícita aqui
  const raw: StreamerData = response.data; // ✅ agora o TS sabe que é StreamerData

  return {
    id: raw.id,
    nickname: raw.nickname ?? "Carregando...",
    streamer_balance: raw.streamer_balance ?? 0,
    email: raw.email ?? "Carregando...",
    is_auto_play: raw.is_auto_play ?? false,
    min_amount: raw.min_amount ?? 0,
    max_characters_name: raw.max_characters_name ?? 0,
    max_characters_message: raw.max_characters_message ?? 0,
    qr_code_is_dark_theme: raw.qr_code_is_dark_theme ?? false,
    add_messages_bellow: raw.add_messages_bellow ?? false,
    donate_is_dark_theme: raw.donate_is_dark_theme ?? false,
    http_response: raw.http_response ?? { status: "WAIT", message: "" },
    info_streamer: raw.info_streamer ?? {
      full_name: "Carregando...",
      cpf: "",
      profile_image_url: "",
      last_access: "",
      date_of_registration: "",
      total_donations_received: 0,
      total_amount_received: 0,
      receive_notification: false,
      http_response: { status: "WAIT", message: "" },
    },
  };
}
