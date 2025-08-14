import React from 'react';
import loading from '../assets/loading.gif';

const Loading: React.FC = () => {
    return (
        <div className="loading-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(-40deg, rgb(109, 160, 255), #0066ffff',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            zIndex: 9999
        }}>
            <style>{`
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            `}</style>
            <img 
            src={loading} 
            alt="Loading..." 
            className="loading-gif"
            style={{
            width: '64px',
            height: '64px'
            }}
            />
        </div>
    );
};

export default Loading;