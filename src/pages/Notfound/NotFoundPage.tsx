import React, { useState, useEffect } from 'react';
import './NotFoundStyle.css'; // Importe o arquivo CSS
import logo from '../../assets/logo.png';
import '../style/style.css'

// Interface para tipagem das partículas
interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
}

function NotFoundPage() {


    return (
        <div className="not-found-container">


            {/* Código 404 de fundo */}
            <div className="background-code">404</div>
            <div className="background-code-2">Página Não Encontrada!</div>

            {/* Ícone principal */}
            <img src={logo} alt="" className='main-logo' />

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