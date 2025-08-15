import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import logoQrCode from '../assets/logo-qrcode.png';
import logo from '../assets/logo.png';

import { useNavigate } from 'react-router-dom';

import { createDonationRequest, sendDonation } from '../api/DonationRequest';

import './style.css';

interface DonationFormProps { }

const StreamPixDonation: React.FC<DonationFormProps> = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [voiceType, setVoiceType] = useState<string>('');


  const quickAmounts = [5, 10, 25, 50, 100];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setSelectedQuickAmount(value);
  };

  const handleSubmit = async () => {
    if (!voiceType) return alert("Selecione uma voz!");
    const donation = createDonationRequest(username, message, Number(amount), voiceType);

    try {
      const response = await sendDonation(donation); // retorna ShortResponseApiDTO
      const transactionId = response.transaction_StreamPix_id;
      navigate(`/streampix/donation/${transactionId}`); // redireciona para localhost/:transaction_StreamPix_id
    } catch (error) {
      console.error("Erro ao enviar doação:", error);
    }
  };



  return (
    <>

      <div className="donation-container">
        <div className="donation-wrapper">
          {/* Donation Form */}
          <div className="form-card">
            


            <div className='header-card'>
              <img src={logoQrCode} alt="" width={"30px"} />
              <p>StreamerName</p>
            </div>
            {/* Username */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
              />
            </div>

            {/* Quick Amount Buttons */}
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

            {/* Audio Options */}
            <div className="form-group">
              <div className="button-row">
                <button type="button" className="audio-button" disabled={!isAudioEnabled} style={{ backgroundColor: isAudioEnabled ? '#f7f6f6ff' : '#eeededff', cursor: isAudioEnabled ? 'pointer' : 'not-allowed' }}>

                  <Mic size={14} />
                  Gravar áudio

                </button>

              </div>
            </div>

            {/* Message */}
            <div className="form-group">
              <div className="textarea-wrapper">
                <textarea
                  placeholder="Sua mensagem de apoio..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={162}
                  className="textarea"
                />
                <div className="char-count">
                  {message.length}/162
                </div>
              </div>
            </div>

            {/* AI Voice Option */}
            <div className="form-group">
              <div className="voice-selection">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="voiceType"
                    value="male"
                    checked={voiceType === 'male'}
                    onChange={() => {
                      setVoiceType('male');
                      setIsAudioEnabled(true);
                    }}
                  />
                  Voz Masculina
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="voiceType"
                    value="female"
                    checked={voiceType === 'female'}
                    onChange={() => {
                      setVoiceType('female');
                      setIsAudioEnabled(true);
                    }}
                  />
                  Voz Feminina
                </label>
              </div>
            </div>

            {/* Amount and Currency */}
            <div className="form-group">
              <div className="amount-row">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="select"
                >
                  <option value="BRL">BRL</option>

                </select>
                <input
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  step="0.01"
                  className="input amount-input"
                />
              </div>
              <p className="min-amount">
                Valor mínimo é de R$ 10,00
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="submit-button"
            >
              ENVIAR DOAÇÃO
            </button>

            {/* Terms */}
            <div className="terms">
              Ao continuar, você declara que leu e concorda com os{' '}
              <a href="#" className="link">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="#" className="link">
                Política de Privacidade
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-brand">
              <div style={{
                backgroundColor: "#2563eb", padding: "5px", borderRadius: "10px",
                justifyContent: "center", alignItems: "center", height: "32px"
              }}>
                <img src={logo} alt="" width={"20px"} />
              </div>
              <span>StreamPix</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamPixDonation;