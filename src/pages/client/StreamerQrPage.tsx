import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import { ApiConfig } from "../../api/ApiConfig";
import logoDark from "../../assets/logo.png";      // Logo para tema CLARO (Assumindo que é um logo escuro)
import logo from "../../assets/logo-dark.png"; // Logo para tema ESCURO (Assumindo que é um logo claro)

interface StreamerData {
    qr_code_url: string;
    nickname: string;
}

interface QrCodeTheme {
    qr_code_is_dark_theme: boolean;
    add_messages_bellow: boolean;
}

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
    const [currentMessage, setCurrentMessage] = useState(0);

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

    // ------------------- Lógica de Animação -------------------

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 15000); // 15 segundos por mensagem

        return () => clearInterval(interval);
    }, []);

    // ------------------- Renderização de Estados -------------------

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-transparent">
                <p className="text-xl text-white drop-shadow-md">Carregando...</p>
            </div>
        );
    }

    if (error || !streamerData) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-red-800/90 text-white">
                <p className="text-xl font-bold">Erro: {error || "Dados incompletos."}</p>
            </div>
        );
    }
    
    // ------------------- Classes Dinâmicas Tailwind -------------------

    // O container principal é a "moldura" compacta.
    const containerClasses = isDarkTheme
        ? "bg-gray-800/90 text-white shadow-2xl shadow-gray-900/70 border-gray-700"
        : "bg-white/90 text-gray-800 shadow-xl shadow-gray-300/60 border-gray-300";

    const messageColor = isDarkTheme ? "text-white" : "text-gray-900";

    // Fundo do QR Code (deve ser o oposto do fgColor para contraste)
    const qrCodeBgClasses = isDarkTheme 
        ? "bg-gray-800 shadow-inner shadow-gray-700/50" 
        : "bg-white shadow-inner shadow-gray-300/50";

    // Tamanho reduzido para compactação
    const qrCodeSize = 200; 

    return (
        // Container Fullscreen (Simula um overlay de streaming)
        <div className="flex items-center justify-center w-screen h-screen">
            
            {/* Cartão Centralizado Compacto */}
            <div 
                // Padding reduzido para p-3. O maxWidth é removido para que o tamanho seja ditado pelo QR Code.
                className={`flex flex-col items-center p-3 rounded-xl backdrop-blur-sm transition-all duration-500 w-auto border border-opacity-30 
                            ${containerClasses}`}
            >
                
                {/* Mensagem Motivacional (Agora como um rótulo compacto acima) */}
                {qrCodeTheme?.add_messages_bellow && (
                    <div className="mb-2 w-full">
                         <p 
                            key={currentMessage} 
                            // Adicionamos um fundo sutil à mensagem para legibilidade
                            className={`px-3 py-1 text-sm font-semibold text-center rounded-lg 
                                       ${isDarkTheme ? 'bg-black/50' : 'bg-white/70'} 
                                       ${messageColor} animate-fade-in-out`}
                        >
                            {messages[currentMessage]}
                        </p>
                    </div>
                )}
                
                {/* Container do QR Code */}
                {/* Removemos o padding interno excessivo, a div do QR code agora é o centro do design. */}
                <div className={`relative rounded-md ${qrCodeBgClasses}`}> 
                    <QRCode
                        value={streamerData.qr_code_url}
                        size={qrCodeSize} // Tamanho fixo e menor
                        bgColor="transparent"
                        fgColor={fgColor}
                        qrStyle="squares" 
                        eyeRadius={5}
                        logoImage={finalLogo}
                        logoWidth={40} // Logo reduzido
                        logoHeight={40} // Logo reduzido
                        logoOpacity={1}
                        removeQrCodeBehindLogo={true}
                        logoPadding={3}
                        logoPaddingStyle="circle" 
                    />
                </div>
            </div>
        </div>
    );
}

export default StreamerQrPage;