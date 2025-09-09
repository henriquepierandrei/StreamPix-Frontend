import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { ApiConfig } from "./ApiConfig";

interface PaymentUpdate {
  isDonated?: boolean;
  timeRemainingSeconds?: number;
}

export function usePaymentWebSocket(transactionId: string | null) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState<boolean>(false);

  useEffect(() => {
    if (!transactionId) return;
  
    let stompClient: Client | null = null;
    let mounted = true;

    import("sockjs-client").then((SockJS) => {
      if (!mounted) return;

      const socket = new SockJS.default(ApiConfig.getBaseBackendURL() + "/streampix-websocket");

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log(str),
      });

      stompClient.onConnect = () => {
        console.log("✅ Conectado ao STOMP");

        if (stompClient) {
          stompClient.subscribe(`/topics/payments/${transactionId}`, (message) => {
            const data: PaymentUpdate = JSON.parse(message.body);
            setAlreadyPaid(data.isDonated ?? false);
            setTimeLeft(data.timeRemainingSeconds ?? 0);
          });

        }
      };

      stompClient.activate();
    });

    return () => {
      mounted = false;
      if (stompClient) stompClient.deactivate();
    };
  }, [transactionId]);

  return { alreadyPaid, timeLeft };
}
