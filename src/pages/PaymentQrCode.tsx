import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock, QrCode, RefreshCw, ArrowBigLeft, ArrowLeft } from 'lucide-react';
import './style.css';

interface PaymentQrCodeProps { }

const PaymentQrCode: React.FC<PaymentQrCodeProps> = () => {
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
    const [copied, setCopied] = useState(false);

    const pixCode = "00020126580014BR.GOV.BCB.PIX013636401748-2532-4272-8d83-6ec93d9e26d15204000053039865802BR5925DOUGLAS STREAMER GAMER6009Sao Paulo62070503***6304A7B2";
    const amount = "25.00";

    // Simular verificação de pagamento
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setPaymentStatus('failed');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Simular pagamento aprovado após 10 segundos (para demo)
        const paymentTimer = setTimeout(() => {
            if (paymentStatus === 'pending') {
                setPaymentStatus(Math.random() > 0.3 ? 'success' : 'failed');
            }
        }, 10000);

        return () => {
            clearInterval(timer);
            clearTimeout(paymentTimer);
        };
    }, [paymentStatus]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                            <QrCode size={24} color="#2563eb" />
                            Pagamento PIX
                        </h1>
                        <p className="subtitle">Escaneie o QR Code ou copie o código</p>
                    </div>

                    <div className="qr-section">
                        <div className="qr-placeholder">
                            <div className="qr-grid">
                                {Array.from({ length: 64 }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="amount">R$ {amount}</div>
                    </div>

                    <div className="timer">
                        <Clock size={16} />
                        Expira em: {formatTime(timeLeft)}
                    </div>

                    <div className="pix-section">
                        <div className="pix-label">Código PIX Copia e Cola:</div>
                        <div className="pix-code">{pixCode}</div>
                        <button
                            className={`copy-button ${copied ? 'copied' : ''}`}
                            onClick={copyToClipboard}
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