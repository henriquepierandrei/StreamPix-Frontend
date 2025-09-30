import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import { ApiConfig } from "../../api/ApiConfig";
import logo from "../../assets/logo.png";
import logoDark from "../../assets/logo-dark.png";

import "../style/streamerQrStyle.css";
interface StreamerData {
    qr_code_url: string;
    nickname: string;
}

interface QrCodeTheme {
    qr_code_is_dark_theme: boolean;
    add_messages_bellow: boolean;
}

function StreamerQrPage() {
    const { nickname } = useParams<{ nickname: string }>();
    const [streamerData, setStreamerData] = useState<StreamerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeTheme, setQrCodeTheme] = useState<QrCodeTheme | null>(null);
    //  pega o tema do QR code e se deve adicionar as mensagens bellow

    // mensagens motivacionais para aparecer em loop
    const messages = [
        "envia sua mensagem!",
        "aponte o celular para o qr-code"
    ];
    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        async function fetchStreamerByName() {
            try {
                const api = ApiConfig.getInstance();
                const response = await api.get(`/${nickname}`); // endpoint público
                setStreamerData(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStreamerByName();
    }, [nickname]);

    useEffect(() => {
        async function fetchQrCodeTheme() {
            try {
                const api = ApiConfig.getPublicInstance();
                const response = await api.get(`/streamer/qrcode?nickname=${nickname}`);
                const data = response.data;

                setQrCodeTheme({
                    qr_code_is_dark_theme: data.qr_code_is_dark_theme,
                    add_messages_bellow: data.add_messages_bellow,
                });
            } catch (error) {
                console.error('Error fetching QR code theme:', error);
            }
        }
        fetchQrCodeTheme();
    }, [nickname]);



    // alterna mensagens a cada 3s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{
            textAlign: "center",
            marginTop: "50px",
            background: qrCodeTheme?.qr_code_is_dark_theme ? "linear-gradient(45deg, #223446ea 0%, #222222f3 50%, #1c1d1ff5 100%)" : "linear-gradient(45deg, #f3f3f3ff 0% 50%, #ffffffff 100%)",
        }} className="qr-container">
            <div className="title-qrcode">
                <h2 style={{
                    color: qrCodeTheme?.qr_code_is_dark_theme ? "#ffffff" : "#21272b",
                }}>{ApiConfig.getBaseFrontendURL().replace("https://", "")}/{nickname}</h2>
            </div>

            {streamerData && (
                <>
                    <div style={{ position: "relative", display: "inline-block", bottom: "10px" }}>

                        <QRCode
                            value={streamerData.qr_code_url}
                            size={200}
                            bgColor="transparent"
                            fgColor={qrCodeTheme?.qr_code_is_dark_theme ? "#ffffffff" : "#21272bff"}
                            qrStyle="fluid"
                            eyeRadius={3}
                            logoImage={qrCodeTheme?.qr_code_is_dark_theme ? logo : logoDark}
                            logoWidth={50}
                            logoHeight={50}
                            logoOpacity={1}
                            removeQrCodeBehindLogo={true}  // Remove os quadrados atrás da logo
                            logoPadding={2}               // Espaçamento ao redor da logo
                            logoPaddingStyle="circle"     // ou "square" para formato quadrado
                        />

                    </div>


                </>
            )}
            {qrCodeTheme?.add_messages_bellow && <p key={currentMessage} className="qr-message" style={{
                color: qrCodeTheme?.qr_code_is_dark_theme ? "#ffffff" : "#21272b",
            }}>
                {messages[currentMessage]}
            </p>}


        </div></div>
    );
}

export default StreamerQrPage;
