import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { ApiConfig } from "./../api/ApiConfig";

interface StreamerData {
    qr_code_url: string;
}

function StreamerQrPage() {
    const { streamerName } = useParams<{ streamerName: string }>();
    const [streamerData, setStreamerData] = useState<StreamerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStreamer() {
            try {
                const api = ApiConfig.getInstance(); // instância do Axios

                // Use GET ao invés de POST se estiver apenas buscando dados
                const response = await api.get(`/streamer/${streamerName}`);

                // Axios já devolve o JSON em response.data
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

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>QR Code para doação de {streamerName}</h2>
            {streamerData && (
                <>
                    <QRCode value={streamerData.qr_code_url} size={200} />
                    <p style={{ marginTop: "20px" }}>{streamerData.qr_code_url}</p>
                </>
            )}
        </div>
    );
}

export default StreamerQrPage;
