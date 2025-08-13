import React, { useState } from 'react';
import { Mic, Play } from 'lucide-react';
import logo from '../assets/logo.png';
import './style.css';

interface DonationFormProps { }

const StreamPixDonation: React.FC<DonationFormProps> = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setSelectedQuickAmount(value);
  };

  const handleSubmit = () => {
    console.log('Donation submitted:', {
      username,
      message,
      amount,
      currency,
      isAudioEnabled
    });
  };

  return (
    <>

      <div className="donation-container">
        <div className="donation-wrapper">
          {/* Header Card */}
          <div className='header-card'>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "10px" }}>
              <img src={logo} alt="" width={"30px"} />
              <p>StreamerName</p>

            </div>
          </div>

          {/* Donation Form */}
          <div className="form-card">
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
                <button type="button" className="audio-button" disabled={!isAudioEnabled} style={{ backgroundColor: isAudioEnabled ? '#f7f6f6ff' : '#dfddddff', cursor: isAudioEnabled ? 'pointer' : 'not-allowed' }}>

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
              <div className="toggle-row">
                <span className="toggle-text">Escolher voz gerada com IA</span>
                <div
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`toggle ${isAudioEnabled ? 'active' : ''}`}
                >
                  <div className="toggle-knob" />
                </div>
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