import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock, QrCode, ArrowLeft } from 'lucide-react';
import './style/style.css';
import { useParams } from 'react-router-dom';
import { getDonation } from '../api/GetDonation';
import { QRCodeCanvas } from 'qrcode.react';
import logo from '../assets/logo.png';
import logoQrCode from '../assets/logo-qrcode.png';

interface PaymentQrCodeProps { }

const PaymentQrCode: React.FC<PaymentQrCodeProps> = () => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'notfound'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [copied, setCopied] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const { transactionId } = useParams<{ transactionId: string }>();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let paymentCheckInterval: ReturnType<typeof setInterval>;

    const fetchPayment = async () => {
      try {
        const response = await getDonation(transactionId!);
        setPaymentInfo(response);

        if ((response as any).already_paid) {
          setPaymentStatus('success');
        }
      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 409) {
          setPaymentStatus('notfound');
        } else {
          console.error(error);
        }
      }
    };


    fetchPayment();

    interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (paymentStatus === 'pending') setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    paymentCheckInterval = setInterval(fetchPayment, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(paymentCheckInterval);
    };
  }, [transactionId, paymentStatus]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTryAgain = () => {
    setPaymentStatus('pending');
    setTimeLeft(300);
  };

  // Aqui o retorno de success/failed continua igual ao seu código original...

  return (
    <>

      {paymentStatus === 'success' && (
        <div className="payment-container" style={{ background: 'linear-gradient(-45deg, #0b3315ff, #131212ff)' }}>
          <img src={logo} alt="" width={"40px"} style={{ position: 'absolute', left: "50%", top: "20px", transform: 'translateX(-50%' }} />
          <div className="success-card">
            <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
            <div className="success-icon">
              <CheckCircle size={40} color="white" />
            </div>
            <h2 className="success-title">Pagamento Aprovado!</h2>
            <p className="success-message">Sua doação foi processada com sucesso. Obrigado pelo apoio!</p>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="payment-container">
          <img src={logo} alt="" width={"40px"} style={{ position: 'absolute', left: "50%", top: "20px", transform: 'translateX(-50%' }} />
          <div className="error-card">
            <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
            <div className="error-icon">
              <XCircle size={40} color="white" />
            </div>
            <h2 className="error-title">Pagamento Não Realizado</h2>
            <p className="error-message">
              O tempo limite expirou ou ocorreu um erro no processamento. Tente novamente.
            </p>
            <button className="retry-button" onClick={handleTryAgain}>Tentar Novamente</button>
          </div>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div className="payment-container">
          <img src={logo} alt="" width={"40px"} style={{ position: 'absolute', left: "50%", top: "20px", transform: 'translateX(-50%' }} />

          <div className="qr-card">
            <div className="header">
              <h1 className="title">
                <QRCodeCanvas value={paymentInfo?.qrcode || ''} size={24} color="#2563eb" />
                Pagamento PIX
              </h1>
              <p className="subtitle">Escaneie o QR Code ou copie o código</p>
            </div>

            <div style={{ position: "relative", display: "inline-block" }}>
              <QRCodeCanvas
                value={paymentInfo?.qrcode || ''}
                size={256}
                level="H"
                includeMargin={true}
              />
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
              <Clock size={16} /> Expira em: {formatTime(timeLeft)}
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
                    <CheckCircle size={16} /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copiar Código PIX
                  </>
                )}
              </button>
            </div>

            <p className="status-text">
              Aguardando pagamento<span className="loading-dots"></span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentQrCode;
