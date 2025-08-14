import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock, QrCode, ArrowLeft } from 'lucide-react';
import './style.css';
import { useParams } from 'react-router-dom';
import { getDonation} from '../api/GetDonation';
import { QRCodeCanvas } from 'qrcode.react';
import logoQrCode from '../assets/logo-qrcode.png';


interface PaymentQrCodeProps { }

const PaymentQrCode: React.FC<PaymentQrCodeProps> = () => {
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
    const [copied, setCopied] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const { transactionId } = useParams<{ transactionId: string }>();

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const response = await getDonation(transactionId!);
                console.log("Payment Info:", transactionId, response);
                setPaymentInfo(response); 
            } catch (error) {
                console.error(error);
            }
        };
        fetchPayment();
    }, [transactionId]);

    

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTryAgain = () => {
        setPaymentStatus('pending');
        setTimeLeft(300);
    };

    if (paymentStatus === 'success') {
        return (
            <>
                <style>{`
          .payment-container {
            min-height: 100vh;
            background-color: rgba(15, 15, 15, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .success-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .success-title {
            font-size: 24px;
            font-weight: 600;
            color: #10b981;
            margin: 0 0 12px;
          }

          .success-message {
            color: #374151;
            font-size: 16px;
            margin: 0 0 24px;
            line-height: 1.5;
          }

          .amount-display {
            font-size: 32px;
            font-weight: 700;
            color: #10b981;
            margin: 0 0 24px;
          }

          .back-button {
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: #ffffff;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 15px;
          }

          .back-button:hover {
            background: #1d4ed8;
          }
        `}</style>

                <div className="payment-container">
                    <div className="success-card">
                        <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
                        <div className="success-icon">
                            <CheckCircle size={40} color="white" />
                        </div>
                        <h2 className="success-title">Pagamento Aprovado!</h2>
                        <p className="success-message">
                            Sua doação foi processada com sucesso. Obrigado pelo apoio!
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <>
                <style>{`
          .payment-container {
            min-height: 100vh;
                        background-color: rgba(15, 15, 15, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .error-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          .error-icon {
            width: 80px;
            height: 80px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }

          .error-title {
            font-size: 24px;
            font-weight: 600;
            color: #ef4444;
            margin: 0 0 12px;
          }

          .error-message {
            color: #374151;
            font-size: 16px;
            margin: 0 0 24px;
            line-height: 1.5;
          }

          .button-row {
            display: flex;
            gap: 12px;
          }

          .retry-button, .back-button {
            flex: 1;
            padding: 14px;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 15px;
          }

          .retry-button {
            background: #2563eb;
            color: #ffffff;
          }

          .retry-button:hover {
            background: #1d4ed8;
          }

          .back-button {
            background: #f3f4f6;
            color: #374151;
          }

          .back-button:hover {
            background: #e5e7eb;
          }
        `}</style>

                <div className="payment-container">
                    <div className="error-card">
                        <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
                        <div className="error-icon">
                            <XCircle size={40} color="white" />
                        </div>
                        <h2 className="error-title">Pagamento Não Realizado</h2>
                        <p className="error-message">
                            O tempo limite expirou ou ocorreu um erro no processamento. Tente novamente.
                        </p>

                    </div>
                </div>
            </>
        );
    }

    return (
        <>

            <div className="payment-container">
                <div className="qr-card">
                    <div className="header">
                        <h1 className="title">
                          <QRCodeCanvas value={paymentInfo?.qrcode || ''} size={24} color="#2563eb" />
                          Pagamento PIX
                        </h1>
                        <p className="subtitle">Escaneie o QR Code ou copie o código</p>
                    </div>

                    <div style={{ position: "relative", display: "inline-block" }}>
              {/* QRCode */}
              <QRCodeCanvas
                value={paymentInfo?.qrcode || ''}
                size={256}
                level="H" // High error correction (necessário p/ suportar a logo no meio)
                includeMargin={true}
              />

              {/* Logo central */}
              <img
                src={logoQrCode}
                alt="Logo"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "30px",
                }}
              />
            </div>

                    <div className="timer">
                        <Clock size={16} />
                        Expira em: {formatTime(timeLeft)}
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
                            {copied ? (
                                <>
                                    <CheckCircle size={16} />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    Copiar Código PIX
                                </>
                            )}
                        </button>
                    </div>

                    <p className="status-text">
                        Aguardando pagamento<span className="loading-dots"></span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default PaymentQrCode;