// MessageComponentToShow.tsx

import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { Frame, IMessage } from "@stomp/stompjs";
import { ApiConfig } from "../../api/ApiConfig";
// Importações de CSS customizado removidas
import logo from "./logo.png";
import logoDark from "./../../assets/logo-dark.png"
import { useParams } from "react-router-dom";


export interface Donation {
    id: string; // chave única
    name: string;
    amount: number;
    message?: string;
    playSoundUrl?: string | null;
    donateIsDarkTheme?: boolean;
    qrCodeIsDarkTheme: boolean;
    exiting?: boolean; // Estado para animação de saída
    entering?: boolean; // Estado para animação de entrada
}

export const MessageComponentToShow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [, setToastQueue] = useState<Donation[]>([]);
    const [toasts, setToasts] = useState<Donation[]>([]);
    const currentAudio = useRef<HTMLAudioElement | null>(null);
    const stompClient = useRef<Client | null>(null);
    const toastQueueRef = useRef<Donation[]>([]);

    // URL do som padrão (mantido)
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

    useEffect(() => {
        let active = true;
        const ANIMATION_DURATION = 500; // Tempo em ms para a animação de saída (deve coincidir com a classe `duration-500`)
        const VISIBLE_DURATION = 5000; // Tempo em ms que o toast fica visível

        const runQueue = async () => {
            while (active) {
                if (toastQueueRef.current.length === 0) {
                    await new Promise(res => setTimeout(res, 100));
                    continue;
                }

                const next = toastQueueRef.current[0];
                toastQueueRef.current = toastQueueRef.current.slice(1);
                setToastQueue([...toastQueueRef.current]);

                // 1. Adiciona toast com estado inicial (invisível e fora da tela)
                setToasts(prev => [...prev, { ...next, entering: false, exiting: false }]);

                // 2. Força a animação de entrada (transition-transform/opacity) após um pequeno delay
                setTimeout(() => {
                    setToasts(prev =>
                        prev.map(t =>
                            t.id === next.id ? { ...t, entering: true } : t
                        )
                    );
                }, 10);

                await playNotificationAndMessage(DEFAULT_SOUND, next.playSoundUrl);

                // 3. Espera o tempo visível
                await new Promise(res => setTimeout(res, VISIBLE_DURATION));

                // 4. Inicia animação de saída (define exiting: true)
                setToasts(prev =>
                    prev.map(t => t.id === next.id ? { ...t, exiting: true } : t)
                );

                // 5. Espera a animação de saída terminar
                await new Promise(res => setTimeout(res, ANIMATION_DURATION));

                // 6. Remove o toast
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
                client.subscribe("/topics/donation/" + id, (msg: IMessage) => {
                    try {
                        const donationData = JSON.parse(msg.body);
                        const { payload, audioUrl, donateIsDarkTheme, qrCodeIsDarkTheme } = donationData;
                        if (!payload) return;

                        // Tratamento para garantir que amount seja um número (se vier como string de novo)
                        const amountValue = parseFloat(String(payload.amount).replace(',', '.')) || 0;


                        queueToast({
                            id: payload.transactionId || crypto.randomUUID(), // chave única
                            name: payload.name || "Anônimo",
                            amount: amountValue,
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
    }, [id]); // Adicione 'id' como dependência

    // ────────────── COMPONENT JSX com Tailwind ──────────────

    return (
        // Container principal: define a área de exibição (canto inferior direito, por exemplo)
        // Você pode ajustar as classes 'fixed', 'bottom-4', 'right-4' conforme o posicionamento desejado no OBS
        <div 
            id="toasts" 
            className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3 p-4 pointer-events-none"
        >
            {toasts.map(donation => {
                const isDark = donation.donateIsDarkTheme;
                
                // Estilos de transição: aplicados sempre
                const baseClasses = `
                    w-80 max-w-sm p-4 rounded-xl shadow-2xl flex items-start gap-4 
                    transition-all duration-500 ease-in-out transform pointer-events-auto
                `;
                
                // Estilos de tema: dinâmicos
                const themeClasses = isDark
                    ? 'bg-gray-900 text-white border border-gray-700' // Tema Escuro
                    : 'bg-white text-gray-900 border border-gray-100'; // Tema Claro

                // Estilos de estado de animação
                let animationClasses = '';
                
                if (donation.exiting) {
                    // Estado de saída: move para a direita (fora da tela) e diminui opacidade
                    animationClasses = 'opacity-0 translate-x-full';
                } else if (donation.entering) {
                    // Estado de entrada: posição final (dentro da tela)
                    animationClasses = 'opacity-100 translate-x-0';
                } else {
                    // Estado inicial: fora da tela e invisível (preparando para a transição)
                    animationClasses = 'opacity-0 translate-x-full';
                }

                return (
                    <div
                        key={donation.id}
                        className={`${baseClasses} ${themeClasses} ${animationClasses}`}
                    >
                        {/* Logo */}
                        <img
                            // Use classes Tailwind para o fundo da imagem
                            className={`w-10 h-10 rounded-full flex-shrink-0 p-1 ${isDark ? 'bg-white' : 'bg-black'}`}
                            src={isDark ? logoDark : logo}
                            alt="logo"
                        />

                        {/* Conteúdo */}
                        <div className="flex flex-col">
                            <div className="text-sm font-semibold leading-tight">
                                {/* Nome e Valor */}
                                <span className="font-bold text-lg text-purple-500">{donation.name}</span> enviou{" "}
                                <strong className="text-xl">R$ {donation.amount.toFixed(2).replace('.', ',')}</strong>
                            </div>
                            
                            {/* Mensagem */}
                            {donation.message && (
                                <div className="mt-1 text-sm italic opacity-80 break-words">
                                    "{donation.message.length > 60 // Aumentei o limite para 60 para melhor legibilidade no toast
                                        ? donation.message.substring(0, 60) + "..."
                                        : donation.message}"
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};