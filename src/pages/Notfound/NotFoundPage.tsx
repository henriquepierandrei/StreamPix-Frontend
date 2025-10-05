import './NotFoundStyle.css'; // Importe o arquivo CSS
import '../../index.css'
import { ArrowBigLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <img src="https://res.cloudinary.com/dvadwwvub/image/upload/v1759512697/page-notfound_j9uhbz.png" alt="" className='img-notfound'/>
            <div className="background-code-2">Página Não Encontrada!</div>
            <br />
            <button onClick={() => navigate("/")} className='button-notfound-back'>
                <ArrowBigLeft strokeWidth={3}/>
            </button>
        </div>
    );
}

export default NotFoundPage;