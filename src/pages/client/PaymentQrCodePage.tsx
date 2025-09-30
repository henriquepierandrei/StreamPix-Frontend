import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getDonation } from '../../api/GetDonation';
import { usePaymentWebSocket } from '../../api/usePaymentStatus';
import logo from "../../assets/image.png";
import '../style/style.css';
import Loading from '../../components/Loading';

interface PaymentQrCodeProps { }

const PaymentQrCode: React.FC<PaymentQrCodeProps> = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const { alreadyPaid } = usePaymentWebSocket(transactionId ?? null);
    const [isAlreadyPaidApi, setAlreadyPaidApi] = useState<boolean>(false);
    const [paymentInfo, setPaymentInfo] = useState<{ qrcode?: string } | null>(null);
    const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);


    // Inicializa quando o QR code chega
    useEffect(() => {
        if (!transactionId) return;

        getDonation(transactionId)
            .then(res => {
                setPaymentInfo(res);
                setLocalTimeLeft(res.time_remaining_seconds);
                setAlreadyPaidApi(res.already_paid);
            })
            .finally(() => setLoading(false));
    }, [transactionId]);



    // Define status do pagamento baseado no hook
    let paymentStatus: 'pending' | 'success' | 'expired' = 'pending';


    if (alreadyPaid || isAlreadyPaidApi) {
        paymentStatus = 'success';
    }
    else if (localTimeLeft !== null && localTimeLeft <= 0) {
        paymentStatus = 'expired';
    } else {
        paymentStatus = 'pending';
    }


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };



    // Decrementa cada segundo usando a função de callback do estado
    useEffect(() => {
        if (localTimeLeft === null) return;

        const interval = setInterval(() => {
            setLocalTimeLeft(prev => {
                if (prev === null) return null;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [localTimeLeft]); // ⬅️ observe que agora depende de localTimeLeft


    return (
        <>
            {loading && <Loading />}
            
            {!loading && paymentStatus === 'success' && (
                <div className="payment-container">
                    <img src={logo} alt="" width={40} style={{ position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)' }} />
                    <div className="success-card">
                        <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
                        <div className="success-icon"><CheckCircle size={40} color="white" /></div>
                        <h2 className="success-title">Pagamento Aprovado!</h2>
                        <p className="success-message">Sua doação foi processada com sucesso. Obrigado pelo apoio!</p>
                    </div>
                </div>
            )}

            {!loading && paymentStatus === 'expired' && (
                <div className="payment-container">
                    <img src={logo} alt="" width={40} style={{ position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)' }} />
                    <div className="error-card">
                        <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
                        <div className="error-icon"><XCircle size={40} color="white" /></div>
                        <h2 className="error-title">Pagamento Expirado</h2>
                        <p className="error-message">O tempo limite expirou ou ocorreu um erro no processamento. Tente novamente.</p>
                    </div>
                </div>
            )}

            {!loading && paymentStatus === 'pending' && paymentInfo && (
                <div className="payment-container">
                    <img src={logo} alt="" width={40} style={{ position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)' }} />
                    <div className="qr-card">
                        <div className="header-card-qr">
                            <h1 className="title">Pagamento PIX</h1>
                            <p className="subtitle">Escaneie o QR Code ou copie o código</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <QRCodeCanvas value={paymentInfo?.qrcode || ''} size={256} level="H" includeMargin={true} />
                        </div>

                        <div className="timer">
                            <Clock size={16} />
                            Expira em: {localTimeLeft !== null ? formatTime(localTimeLeft) : "--:--"}
                        </div>


                        <div className="pix-section">
                            <div className="pix-label">Código PIX Copia e Cola:</div>
                            <div className="pix-code">{paymentInfo?.qrcode}</div>
                            <button
                                className={`copy-button ${copied ? 'copied' : ''}`}
                                onClick={() => {
                                    navigator.clipboard.writeText(paymentInfo?.qrcode || '');
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? <><CheckCircle size={16} /> Copiado!</> : <><Copy size={16} /> Copiar Código PIX</>}
                            </button>
                        </div>

                        <p className="status-text" style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                            O Processamento pode levar alguns minutos.
                        </p>
                        <p className="status-text">Aguardando pagamento<span className="loading-dots"></span></p>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentQrCode;
