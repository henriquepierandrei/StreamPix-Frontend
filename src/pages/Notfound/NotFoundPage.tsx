import './NotFoundStyle.css'; // Importe o arquivo CSS
import logo from '../../assets/logo.png';
import '../style/style.css'

function NotFoundPage() {
    return (
        <div className="not-found-container">
            {/* Código 404 de fundo */}
            <div className="background-code">404</div>
            <div className="background-code-2">Página Não Encontrada!</div>

            <div className="footer">
                <div className="footer-brand">
                    <img src={logo} alt="Logo" width={15} />
                    <span style={{fontFamily: 'Saira'}}>StreamPix</span>
                </div>
            </div>

        </div>
    );
}

export default NotFoundPage;