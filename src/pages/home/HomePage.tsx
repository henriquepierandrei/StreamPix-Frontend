import { QrCode, Settings, Wallet, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import NavbarHome from '../../components/navbar/NavbarHome'
import { useNavigate } from 'react-router-dom';
import MessagePerson from './Typing-rafiki.svg'
import { ApiConfig } from "../../api/ApiConfig";

import './HomeStyle.css';

function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ overflowX: "hidden" }}>
      <NavbarHome />
      <div className='component-title-home'>
        <div className="arc-shape"></div>
        <div className="hero-content">
          <h1>Monetize. Engaje. Cresça.</h1>
          <h2>Mais engajamento, mais receita, mais liberdade para criar.</h2>
          <button className='button-home-dashboard' onClick={() => navigate("/streamer/dashboard/login")}
          >Acessar Dashboard</button>
        </div>
        <div className="arc-shape-invert"></div>
      </div>

      <div className='how-work-container'>
        <h1 className='title-how-work'>Como funciona</h1>

        <div className='flex-how-work-card'>
          <div className='how-work-card'>
            <div className="card-icon-wrapper">
              <Settings size={62} className='icon-work-card' />
            </div>
            <h3>Configuração</h3>
            <p>Configure os widgets de alerta em seu software de transmissão ou use uma integração.</p>
          </div>
          <div className='how-work-card'>
            <div className="card-icon-wrapper">
              <QrCode size={62} className='icon-work-card' />
            </div>
            <h3>Pagamento/Alerta</h3>
            <p>Seus espectadores enviam pagamentos com mensagem e são exibidos em sua transmissão.</p>
          </div>
          <div className='how-work-card'>
            <div className="card-icon-wrapper">
              <Wallet size={62} className='icon-work-card' />
            </div>
            <h3>Carteira/Saque</h3>
            <p>O dinheiro fica disponível na hora e você saca os valores a partir de R$ 1,00 via Pix.</p>
          </div>
        </div>
      </div>

      <div className="card-info-home">
        <div className="info-card-content">
          <img src={MessagePerson} alt="Pessoa enviando mensagem" />
          <div className="info-text">
            <h2>Mensagens Monetizadas</h2>
            <p>
              Receba mensagens via Pix ou Cartão de Crédito e exiba os alertas na sua transmissão em tempo real.
            </p>
            <button className='button-secondary' onClick={() => navigate("/streamer/dashboard/login")}>Saiba mais</button>
          </div>
        </div>
      </div>

      {/* Nova seção de recursos */}
      <div className="features-section">
        <h2 className="features-title">Por que escolher nossa plataforma?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3>Comunidade Engajada</h3>
            <p>Conecte-se com sua audiência de forma mais próxima e autêntica</p>
          </div>
          <div className="feature-card">
            <TrendingUp className="feature-icon" />
            <h3>Crescimento Acelerado</h3>
            <p>Aumente sua receita e expanda seu alcance rapidamente</p>
          </div>
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Pagamentos Seguros</h3>
            <p>Transações protegidas e saques rápidos via Pix</p>
          </div>
          <div className="feature-card">
            <Zap className="feature-icon" />
            <h3>Integração Fácil</h3>
            <p>Configure em minutos com OBS, Streamlabs e outras plataformas</p>
          </div>
        </div>
      </div>

      {/* Seção de estatísticas */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Criadores Ativos</p>
          </div>
          <div className="stat-item">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Suporte</p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="cta-section">
        <h2>Pronto para monetizar seu conteúdo?</h2>
        <p>Junte-se a milhares de criadores que já estão transformando sua paixão em receita</p>
        <div className="cta-buttons">
          <button className="button-primary-large" onClick={() => navigate("/streamer/dashboard/login")}>Começar Agora</button>
          <button className="button-outline-large" onClick={() => navigate("/streamer/dashboard/login")}>Ver Demonstração</button>
        </div>
      </div>

      {/* Footer simples */}
      <footer className="footer-home">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Suporte</h4>
            <a href="#">Central de Ajuda</a>
            <a href="#">Documentação</a>
            <a href="#">Contato</a>
          </div>
          <div className="footer-section">
            <h4>Empresa</h4>
            <a href="#">Sobre</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 StreamPix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage