import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Usei 'react-qrcode-logo' como estava no seu código original
import { QRCode } from "react-qrcode-logo";
import { ApiConfig } from "../../api/ApiConfig";
// Ajuste os imports de logo conforme a sua estrutura de arquivos
import logoDark from "../../assets/logo.png";
import logo from "../../assets/logo-dark.png";

// ------------------- Tipos de Dados -------------------

interface StreamerData {
    qr_code_url: string;
    nickname: string;
}

interface QrCodeTheme {
    qr_code_is_dark_theme: boolean;
    add_messages_bellow: boolean;
}

// ------------------- Componente da Mensagem Animada (Isolado) -------------------
// Componente separado para gerenciar a animação da mensagem e evitar a re-renderização
// desnecessária do QR Code (resolvendo o problema do "piscar").

interface AnimatedMessageProps {
    isDarkTheme: boolean;
    addMessages: boolean;
    messages: string[];
    messageColor: string;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ isDarkTheme, addMessages, messages, messageColor }) => {
    const [currentMessage, setCurrentMessage] = useState(0);

    // Lógica de Animação isolada
    useEffect(() => {
        if (!addMessages || messages.length === 0) return;

        const interval = setInterval(() => {
            // Usa o callback prev para garantir que o estado é atualizado corretamente
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 15000); // 15 segundos por mensagem

        return () => clearInterval(interval);
    }, [addMessages, messages.length]);

    if (!addMessages || messages.length === 0) return null;

    return (
        <div className="mb-2 w-full">
            <p
                key={currentMessage} // Key é importante para forçar a animação
                className={`px-3 py-1 text-sm font-semibold text-center rounded-lg 
                    ${isDarkTheme
                        ? 'bg-black/50 text-white shadow-lg'
                        : 'bg-white/80 text-zinc-900 shadow-md'} 
                    ${messageColor} animate-fade-in-out`}
            >
                {messages[currentMessage]}
            </p>
        </div>
    );
};

// ------------------- Componente Principal -------------------

const StreamerQrPage: React.FC = () => {
    const { nickname } = useParams<{ nickname: string }>();
    const [streamerData, setStreamerData] = useState<StreamerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeTheme, setQrCodeTheme] = useState<QrCodeTheme | null>(null);

    const messages = [
        "🚀 Envie sua mensagem!",
        "📱 Aponte o celular para o qr-code!",
        "💖 Apoie seu streamer favorito!",
    ];

    // Variáveis derivadas do estado
    const isDarkTheme = qrCodeTheme?.qr_code_is_dark_theme ?? false;
    const fgColor = isDarkTheme ? "#FFFFFFFF" : "#21272BFF";
    const finalLogo = isDarkTheme ? logoDark : logo;

    // ------------------- Lógica de Fetch -------------------

    useEffect(() => {
        async function fetchStreamerData() {
            setLoading(true);
            setError(null);
            try {
                const api = ApiConfig.getInstance();
                const response = await api.get<StreamerData>(`/${nickname}`);
                setStreamerData(response.data);
            } catch (err: any) {
                setError("Streamer não encontrado ou erro de API.");
                console.error("Erro no fetch de streamer:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStreamerData();
    }, [nickname]);

    useEffect(() => {
        async function fetchQrCodeTheme() {
            try {
                const api = ApiConfig.getPublicInstance();
                const response = await api.get<QrCodeTheme>(`/streamer/qrcode?nickname=${nickname}`);
                setQrCodeTheme(response.data);
            } catch (error) {
                console.error('Error fetching QR code theme:', error);
            }
        }
        fetchQrCodeTheme();
    }, [nickname]);

    // ------------------- Renderização de Estados -------------------

    if (loading) {
        return (
            // Fundo **SEMPRE TRANSPARENTE** para o OBS
            <div className="flex items-center justify-center w-screen h-screen bg-transparent">
                <p className="text-xl text-white drop-shadow-md">Carregando...</p>
            </div>
        );
    }

    if (error || !streamerData) {
        return (
            // Mantenha o erro visível com um fundo sólido, ou use bg-transparent se preferir
            <div className="flex items-center justify-center w-screen h-screen bg-red-800/90 text-white">
                <p className="text-xl font-bold">Erro: {error || "Dados incompletos."}</p>
            </div>
        );
    }

    // ------------------- Classes Dinâmicas Tailwind -------------------

    const containerClasses = isDarkTheme
        ? "bg-zinc-800/90 text-white shadow-2xl shadow-zinc-900/70 border-zinc-700"
        : "bg-white/90 text-zinc-800 shadow-xl shadow-zinc-300/60 border-zinc-300";

    const messageColor = isDarkTheme ? "text-white" : "text-zinc-900";

    // Esta classe é para o container *em volta* do QR Code, não para o fundo da tela.
    const qrCodeBgClasses = isDarkTheme
        ? "bg-zinc-800 shadow-inner shadow-zinc-700/50"
        : "bg-white shadow-inner shadow-zinc-300/50";

    const qrCodeSize = 200;

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-transparent">
            {/* Container centralizado */}
            <div className="relative flex items-center justify-center">

                {/* Fundo só do QR code */}
                <div
                    className={`absolute inset-0 rounded-md ${isDarkTheme ? "bg-zinc-900" : "bg-white"
                        }`}
                    style={{ zIndex: 0 }}
                />

                {/* QR Code em cima do fundo */}
                <QRCode
                    value={streamerData.qr_code_url}
                    size={qrCodeSize}
                    bgColor="transparent"
                    fgColor={fgColor}
                    qrStyle="squares"
                    eyeRadius={5}
                    logoImage={finalLogo}
                    logoWidth={40}
                    logoHeight={40}
                    logoOpacity={1}
                    removeQrCodeBehindLogo={true}
                    logoPadding={3}
                    logoPaddingStyle="circle"
                    style={{ position: "relative", zIndex: 10 }}
                />
            </div>
        </div>
    );

}

export default StreamerQrPage;