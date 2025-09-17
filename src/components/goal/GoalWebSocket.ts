// useGoalWebSocket.ts
import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { ApiConfig } from "../../api/ApiConfig";


export interface Goal {
  reason?: string;
  current_balance: number;
  balance_to_achieve: number;
  end_at_in_days?: number;
}

export function useGoalWebSocket(id: string) {
  const [goal, setGoal] = useState<Goal>({
    reason: "---",
    current_balance: 0,
    balance_to_achieve: 0,
    end_at_in_days: undefined,
  });

  useEffect(() => {
    let stompClient: Client | null = null;
    let mounted = true;

    // 1️⃣ Carregar meta inicial
    async function loadInitialGoal(id: string) {
      try {
        const res = await fetch(
          ApiConfig.getBaseBackendURL() + `/streamer/goal/to-show?id=` + id 
        );
        if (!res.ok) throw new Error("Erro ao carregar meta inicial");
        const data: Goal = await res.json();
        if (mounted) setGoal(data);
      } catch (err) {
        console.error("Erro ao carregar meta inicial:", err);
      }
    }

    loadInitialGoal(id);

    // 2️⃣ Conectar WebSocket
    import("sockjs-client").then((SockJS) => {
      if (!mounted) return;

      const socket = new SockJS.default(ApiConfig.getBaseBackendURL() + "/streampix-websocket");

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log("STOMP:", str),
      });

      stompClient.onConnect = () => {
        console.log("✅ Conectado via STOMP");
        if (stompClient) {
          stompClient.subscribe("/topics/goal/" + id, (message) => {
            try {
              const data: Goal = JSON.parse(message.body);
              setGoal(data);
            } catch (err) {
              console.error("Erro ao processar meta WS:", err);
            }
          });
        }
      };

      stompClient.activate();
    });

    return () => {
      mounted = false;
      if (stompClient) stompClient.deactivate();
    };
  }, [id]);

  return goal;
}
