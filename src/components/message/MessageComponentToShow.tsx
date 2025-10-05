// MessageComponentToShow.tsx

import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { Frame, IMessage } from "@stomp/stompjs";
import { ApiConfig } from "../../api/ApiConfig";
import { useParams } from "react-router-dom";
import { DollarSign } from 'lucide-react';

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

    const DEFAULT_SOUND = "https://res.cloudinary.com/dvadwwvub/video/upload/v1757880720/new-notification-021-370045_fogkxi.mp3";
    const MAX_QUEUE_SIZE = 10;
    const ANIMATION_DURATION = 500;
    const VISIBLE_DURATION = 5000;

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
    
    // Processamento da Fila de Toasts
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

                // 1. Adiciona o Toast (Estado inicial: fora da tela)
                setToasts(prev => [...prev, { ...next, entering: false, exiting: false }]);

                // 2. Inicia a animação de entrada
                setTimeout(() => {
                    setToasts(prev =>
                        prev.map(t =>
                            t.id === next.id ? { ...t, entering: true } : t
                        )
                    );
                }, 10); // Pequeno delay para garantir a transição inicial

                // 3. Toca o áudio
                await playNotificationAndMessage(DEFAULT_SOUND, next.playSoundUrl);
                
                // 4. Espera a duração de visibilidade
                await new Promise(res => setTimeout(res, VISIBLE_DURATION));

                // 5. Inicia a animação de saída
                setToasts(prev =>
                    prev.map(t => t.id === next.id ? { ...t, exiting: true } : t)
                );

                // 6. Espera a animação de saída terminar
                await new Promise(res => setTimeout(res, ANIMATION_DURATION));

                // 7. Remove o toast da lista
                setToasts(prev => prev.filter(t => t.id !== next.id));
            }
        };

        runQueue();

        return () => { active = false; };
    }, []);

    // Conexão STOMP
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

                        const amountValue = parseFloat(String(payload.amount).replace(',', '.')) || 0;


                        queueToast({
                            id: payload.transactionId || crypto.randomUUID(),
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
    }, [id]);

    
    // -------------------------------------------------------------
    // JSX MELHORADO: Design de Card de Alerta com Destaque
    // -------------------------------------------------------------
    return (
        <div
            id="toasts"
            // Mantém a posição inferior direita, com espaçamento maior entre cards
            className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3 p-4 pointer-events-none"
        >
            {toasts.map(donation => {
                const isDark = donation.donateIsDarkTheme;
                
                // --- ESTILOS DO CARD ---
                
                // Estilos de base: Card com largura FIXA (w-96 = 384px)
                const baseClasses = `
                    flex flex-col rounded-xl shadow-2xl w-96 
                    transition-all duration-500 ease-out transform pointer-events-auto
                    overflow-hidden
                `;
                
                // Estilos de tema: Foco no contraste e profundidade
                const themeClasses = isDark
                    ? 'bg-gray-900/90 text-white border border-purple-600/50 shadow-purple-900/70'
                    : 'bg-white/95 text-gray-900 border border-gray-300 shadow-xl';

                // Estilos de animação: Entrada/Saída Vertical
                let animationClasses = '';
                if (donation.exiting) {
                    // Saída: Move para baixo e some
                    animationClasses = 'opacity-0 translate-y-full scale-95'; 
                } else if (donation.entering) {
                    // Entrada: Posição final (visível)
                    animationClasses = 'opacity-100 translate-y-0 scale-100';
                } else {
                    // Estado inicial (fora de vista)
                    animationClasses = 'opacity-0 translate-y-full scale-95'; 
                }
                
                // --- CONTEÚDO ---
                const messagePresent = donation.message && donation.message.trim().length > 0;

                return (
                    <div
                        key={donation.id}
                        className={`${baseClasses} ${themeClasses} ${animationClasses}`}
                    >
                        {/* 1. HEADER / BARRA DE DESTAQUE (Foco no Valor) */}
                        <div 
                            className={`
                                flex items-center justify-between p-3 
                                ${isDark ? 'bg-purple-700/80' : 'bg-green-600/90'}
                                text-white font-bold
                            `}
                        >
                            {/* Ícone e Nome do Doador */}
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                    {donation.name} doou:
                                </span>
                            </div>
                            
                            {/* Valor - MÁXIMO DE DESTAQUE */}
                            <strong 
                                className="text-2xl font-black whitespace-nowrap tracking-tight"
                            >
                                R$ {donation.amount.toFixed(2).replace('.', ',')}
                            </strong>
                        </div>

                        {/* 2. CORPO DA MENSAGEM (Opcional) */}
                        {messagePresent && (
                            <div className="p-3 pt-2">
                                {/* Citação visualmente distinta */}
                                <blockquote 
                                    className={`
                                        text-sm italic border-l-4 pl-3 py-1 
                                        ${isDark ? 'border-purple-400 text-gray-200' : 'border-green-600 text-gray-700'}
                                        max-h-24 overflow-hidden
                                    `}
                                >
                                    {donation.message}
                                </blockquote>
                            </div>
                        )}
                        
                        {/* 3. FOOTER SUTIL (Se não houver mensagem, adiciona um pequeno padding) */}
                        {!messagePresent && (
                            <div className="p-1"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};