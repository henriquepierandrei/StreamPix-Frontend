// MessageComponentToShow.tsx
import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { Frame, IMessage } from "@stomp/stompjs";
import { ApiConfig } from "../../api/ApiConfig";
import "./message-style.css";
import logo from "./logo.png";
import logoDark from "./../../assets/logo-dark.png"

export interface Donation {
  id: string; // chave única
  name: string;
  amount: number;
  message?: string;
  playSoundUrl?: string | null;
  donateIsDarkTheme?: boolean;
  qrCodeIsDarkTheme: boolean;
  exiting?: boolean; // ← adiciona essa linha
  entering?: boolean;

}

export const MessageComponentToShow: React.FC = () => {
  const [toastQueue, setToastQueue] = useState<Donation[]>([]);
  const [toasts, setToasts] = useState<Donation[]>([]);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const stompClient = useRef<Client | null>(null);
  const toastQueueRef = useRef<Donation[]>([]);

  const DEFAULT_SOUND = "https://res.cloudinary.com/dvadwwvub/video/upload/v1757880720/new-notification-021-370045_fogkxi.mp3";
  const MAX_QUEUE_SIZE = 10;

  // ────────────── QUEUE LOGIC ──────────────

  const queueToast = (donation: Donation) => {
    console.log(donation);
    setToastQueue(prev => {
      const newQueue = [...prev, donation];
      if (newQueue.length > MAX_QUEUE_SIZE) newQueue.splice(0, newQueue.length - MAX_QUEUE_SIZE);
      toastQueueRef.current = newQueue;
      return newQueue;
    });
  };



  const playAudio = (url?: string | null) => {
    return new Promise<void>((resolve) => {
      if (!url) return resolve();
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
      }
      currentAudio.current = new Audio(url);
      currentAudio.current.volume = 0.7;
      currentAudio.current.onended = () => resolve();
      currentAudio.current.onerror = () => resolve();
      currentAudio.current.play().catch(resolve);
    });
  };

  const playNotificationAndMessage = async (notificationUrl: string, messageUrl?: string | null) => {
    await playAudio(notificationUrl);
    if (messageUrl) await playAudio(messageUrl);
  };

  // ────────────── PROCESS QUEUE ──────────────

  // useEffect(() => {
  //   let active = true;

  //   const runQueue = async () => {
  //     while (active) {
  //       if (toastQueueRef.current.length === 0) {
  //         await new Promise(res => setTimeout(res, 100)); // espera se a fila estiver vazia
  //         continue;
  //       }

  //       const next = toastQueueRef.current[0];
  //       toastQueueRef.current = toastQueueRef.current.slice(1);
  //       setToastQueue([...toastQueueRef.current]);

  //       // adiciona toast com estado inicial (opacity:0)
  //       setToasts(prev => [...prev, { ...next, entering: false }]);

  //       // força o browser aplicar o estado inicial antes de transitar
  //       setTimeout(() => {
  //         setToasts(prev =>
  //           prev.map(t =>
  //             t.id === next.id ? { ...t, entering: true } : t
  //           )
  //         );
  //       }, 50);


  //       await playNotificationAndMessage(DEFAULT_SOUND, next.playSoundUrl);

  //       // espera visível (toast aparece)
  //       await new Promise(res => setTimeout(res, 5000));

  //       // marca para sair (adiciona flag no objeto)
  //       setToasts(prev =>
  //         prev.map(t => t.id === next.id ? { ...t, exiting: true } : t)
  //       );

  //       // espera o tempo da animação CSS (ex.: 500ms)
  //       await new Promise(res => setTimeout(res, 500));

  //       // remove de vez
  //       setToasts(prev => prev.filter(t => t.id !== next.id));
  //     }
  //   };

  //   runQueue();

  //   return () => { active = false; };
  // }, []);

  // No seu useEffect de processamento de fila, substitua esta parte:
  useEffect(() => {
    let active = true;

    const runQueue = async () => {
      while (active) {
        if (toastQueueRef.current.length === 0) {
          await new Promise(res => setTimeout(res, 100));
          continue;
        }

        const next = toastQueueRef.current[0];
        toastQueueRef.current = toastQueueRef.current.slice(1);
        setToastQueue([...toastQueueRef.current]);

        // Adiciona toast com estado inicial
        setToasts(prev => [...prev, { ...next, entering: false }]);

        // Força a animação de entrada após um pequeno delay
        setTimeout(() => {
          setToasts(prev =>
            prev.map(t =>
              t.id === next.id ? { ...t, entering: true } : t
            )
          );
        }, 10); // Reduzi para 10ms para ser mais responsivo

        await playNotificationAndMessage(DEFAULT_SOUND, next.playSoundUrl);

        // Espera o toast ficar visível
        await new Promise(res => setTimeout(res, 5000));

        // Inicia animação de saída
        setToasts(prev =>
          prev.map(t => t.id === next.id ? { ...t, exiting: true } : t)
        );

        // Espera a animação de saída terminar
        await new Promise(res => setTimeout(res, 500));

        // Remove o toast
        setToasts(prev => prev.filter(t => t.id !== next.id));
      }
    };

    runQueue();

    return () => { active = false; };
  }, []);

  // ────────────── WEBSOCKET ──────────────

  useEffect(() => {
    let mounted = true;

    import("sockjs-client").then((SockJS) => {
      if (!mounted) return;

      const socket = new SockJS.default(ApiConfig.getBaseBackendURL() + "/streampix-websocket");

      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: () => { },
      });

      client.onConnect = () => {
        console.log("✅ Conectado via STOMP");
        client.subscribe("/topics/donation", (msg: IMessage) => {
          try {
            const donationData = JSON.parse(msg.body);
            const { payload, audioUrl, donateIsDarkTheme, qrCodeIsDarkTheme } = donationData;
            if (!payload) return;

            queueToast({
              id: payload.transactionId || crypto.randomUUID(), // chave única
              name: payload.name || "Anônimo",
              amount: payload.amount || 0,
              message: payload.message || "",
              playSoundUrl: audioUrl || null,
              donateIsDarkTheme: donateIsDarkTheme,
              qrCodeIsDarkTheme: qrCodeIsDarkTheme
            });
          } catch (err) {
            console.error("Erro ao processar WS de doação:", err);
          }
        });
      };

      client.onStompError = (err: Frame) => {
        console.error("Erro STOMP:", err);
      };

      client.activate();
      stompClient.current = client;
    });

    return () => {
      mounted = false;
      if (stompClient.current?.active) stompClient.current.deactivate();
      if (currentAudio.current) currentAudio.current.pause();
    };
  }, []);

  // ────────────── COMPONENT JSX ──────────────

  return (
    <div className="donation-toast-container" id="toasts">
      {toasts.map(donation => (
        <div
          key={donation.id}
          className={`donation-toast 
            ${donation.donateIsDarkTheme ? "donation-toast-dark" : "donation-toast-light"} 
            ${donation.entering ? "entering" : ""}
            ${donation.exiting ? "donation-toast-exit" : ""}`}
        >
          <img
            style={{ backgroundColor: donation.donateIsDarkTheme ? "white" : "black" }}
            src={donation.donateIsDarkTheme ? logoDark : logo}
            className="donation-toast-logo"
            alt="logo"
          />
          <div className="donation-toast-content">
            <div className="donation-toast-text">
              <span className="donation-toast-name">{donation.name}</span> enviou{" "}
              <strong>R$ {donation.amount}</strong>
            </div>
            {donation.message && (
              <div className="donation-toast-message">
                "{donation.message.length > 30
                  ? donation.message.substring(0, 30) + "..."
                  : donation.message}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
