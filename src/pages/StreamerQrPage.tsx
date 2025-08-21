import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { ApiConfig } from "./../api/ApiConfig";
import logo from "./../assets/logo.png";
import "./style/streamerQrStyle.css";

interface StreamerData {
    qr_code_url: string;
}

function StreamerQrPage() {
    const { streamerName } = useParams<{ streamerName: string }>();
    const [streamerData, setStreamerData] = useState<StreamerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // mensagens motivacionais para aparecer em loop
    const messages = [
        "💖 Apoie seu streamer favorito!",
        "🚀 Faça parte da live com sua doação!",
        "🔥 Mostre seu suporte, doe agora!",
        "🎉 Ajude a manter a energia da stream!",
    ];
    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        async function fetchStreamer() {
            try {
                const api = ApiConfig.getInstance();
                const response = await api.get(`/streamer/${streamerName}`);
                const data: StreamerData = response.data;
                setStreamerData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStreamer();
    }, [streamerName]);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center", marginTop: "50px" }} className="qr-container">
            <div className="title-qrcode">
                <h2>QR Code {streamerName}</h2>
            </div>

            {streamerData && (
                <>
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <QRCode
                            value={streamerData.qr_code_url}
                            size={200}
                            bgColor="transparent"
                            fgColor="#ffffff"
                            level="H"
                            className="custom-qr"
                        />
                        <img
                            src={logo}
                            alt="logo"
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "50px",
                                height: "50px",
                                borderRadius: "10px",
                                background: "linear-gradient(45deg, #223446ea 0%, #222222f3 50%, #1c1d1ff5 100%)",
                                padding: "5px",
                            }}
                        />

                    </div>

                    {/* mensagens rotativas */}

                </>
            )}
             <p key={currentMessage} className="qr-message">
          {messages[currentMessage]}
        </p>
            
        </div></div>
    );
}

export default StreamerQrPage;
