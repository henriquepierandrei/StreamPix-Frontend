import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, UserX, XCircle, XIcon } from 'lucide-react';
import logoQrCode from '../assets/logo-qrcode.png';
import logo from '../assets/logo.png';
import { useNavigate, useParams } from 'react-router-dom';
import { createDonationRequest, sendDonation, getStreamerData } from '../api/DonationRequest';
import './style/style.css';
import Loading from '../components/Loading';

type PaymentStatus = 'pending' | 'success' | 'failed' | 'notfound' | 'error';

const StreamPixDonation: React.FC = () => {
  const navigate = useNavigate();
  const { streamerName } = useParams() as { streamerName?: string };

  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [currency, setCurrency] = useState('BRL');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [voiceType, setVoiceType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // dados vindos da API do streamer
  const [minAmount, setMinAmount] = useState(10);
  const [maxNameLength, setMaxNameLength] = useState(20);
  const [maxMessageLength, setMaxMessageLength] = useState(162);

  useEffect(() => {
    if (!streamerName) return;

    const fetchStreamer = async () => {
      try {
        setLoading(true);
        const data = await getStreamerData(streamerName);
        setMinAmount(data.min_amount || 10);
        setMaxNameLength(data.max_name_lenght || 20);
        setMaxMessageLength(data.max_message_lenght || 162);
      } catch (err) {
        console.error("Erro ao carregar streamer:", err);
        setPaymentStatus('notfound');
      } finally {
        setLoading(false);
      }
    };

    fetchStreamer();
  }, [streamerName, navigate]);

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleQuickAmount = (value: number) => {
    setAmount(value);
    setSelectedQuickAmount(value);
  };

  const handleSubmit = async () => {
    if (!voiceType) return alert("Selecione uma voz!");
    if (!amount || amount < minAmount)
      return alert(`O valor mínimo é R$ ${minAmount},00`);

    setLoading(true);
    const donation = createDonationRequest(username, message, amount, voiceType);

    try {
      const response = await sendDonation(donation);
      const transactionId = response.transaction_StreamPix_id;
      navigate(`/donation/${transactionId}`);
    } catch (error) {
      setPaymentStatus('error');
      console.error('Erro ao enviar doação:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <Loading />;

  if (paymentStatus === 'notfound') {
    return (
      <div className="payment-container" style={{ background: 'linear-gradient(-45deg, #441313ff, #131212ff)' }}>
        <img src={logo} alt="Logo" width={40} style={{ position: 'absolute', left: "50%", top: "20px", transform: 'translateX(-50%)' }} />
        <div className="error-card">
          <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
          <div className="error-icon">
            <UserX size={40} color="white" />
          </div>
          <h2 className="error-title">Streamer Não Encontrado</h2>
          <p className="error-message">
            Não foi possível localizar o streamer. Verifique o nome e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="payment-container" style={{ background: 'linear-gradient(-45deg, #441313ff, #0c0c0cff)' }}>
        <img src={logo} alt="Logo" width={40} style={{ position: 'absolute', left: "50%", top: "20px", transform: 'translateX(-50%)' }} />
        <div className="error-card">
          <ArrowLeft className="button-go-back" onClick={() => window.history.back()} />
          <div className="error-icon">
            <XIcon size={40} color="white" />
          </div>
          <h2 className="error-title">Erro ao realizar a doação</h2>
          <p className="error-message">
            Houve um problema ao processar sua doação. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='donation-container'>
      <div className="donation-wrapper">
        <div className="form-card">
          <div className='header-card'>
            <img src={logoQrCode} alt="QR Code Logo" width={50} style={{ borderRadius: "10px 0px 0px 10px" }} />
            <p>{streamerName}</p>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={maxNameLength}
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">Valores rápidos:</label>
            <div className="quick-amounts">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickAmount(value)}
                  className={`quick-button ${selectedQuickAmount === value ? 'active' : ''}`}
                >
                  R$ {value}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="textarea-wrapper">
              <textarea
                placeholder="Sua mensagem de apoio..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={maxMessageLength}
                className="textarea"
              />
              <div className="char-count">{message.length}/{maxMessageLength}</div>
            </div>
          </div>

          <div className="form-group">
            <div className="voice-selection">
              <label className="radio-label">
                <input
                  type="radio"
                  name="voiceType"
                  value="male"
                  checked={voiceType === 'male'}
                  onChange={() => { setVoiceType('male'); setIsAudioEnabled(true); }}
                /> Voz Masculina
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="voiceType"
                  value="female"
                  checked={voiceType === 'female'}
                  onChange={() => { setVoiceType('female'); setIsAudioEnabled(true); }}
                /> Voz Feminina
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="amount-row">
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">
                <option value="BRL">BRL</option>
              </select>
              <input
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={minAmount}
                step={0.01}
                className="input amount-input"
              />
            </div>
            <p className="min-amount">Valor mínimo é de R$ {minAmount},00</p>
          </div>

          <button type="button" onClick={handleSubmit} className="submit-button">
            ENVIAR DOAÇÃO
          </button>
        </div>

        <div className="footer">
          <div className="footer-brand">
            <div style={{
              backgroundColor: "#2563eb",
              padding: "5px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "32px"
            }}>
              <img src={logo} alt="Logo" width={20} />
            </div>
            <span>StreamPix</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPixDonation;
