import { X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AlertProps {
    error?: {
        timestamp: string;
        status: number;
        error: string;
        message: string;
        path: string;
    };
    duration?: number; // duração em segundos
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ error, duration = 5, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!error) return;
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [error, duration, onClose]);

    if (!error || !visible) return null;

    // Define classes baseadas no status (assumindo que 4xx/5xx é erro)
    const baseClasses = "bg-red-50 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-200";

    return (
        <div
            role="alert"
            className={`
                relative w-full p-4 rounded-xl shadow-2xl transition-all duration-300 transform 
                flex items-start justify-between gap-4 overflow-hidden
                ${baseClasses}
            `}
            // Adiciona a animação de entrada
            style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .progress-bar {
                    animation: shrink ${duration}s linear forwards;
                }
                `}
            </style>

            <div className="flex items-center gap-3">
                <XCircle size={24} className="flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium leading-relaxed">
                    {error.message}
                </p>
            </div>

            <button
                className="flex-shrink-0 p-1 rounded-full text-red-500 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition-colors w-6 h-6 flex items-center justify-center"
                onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                }}
                aria-label="Fechar alerta"
            >
                <X size={16} />
            </button>


            {/* Barra de Progresso (Feedback Visual do Timer) */}
            <div className="absolute bottom-0 left-0 h-1 w-full">
                <div
                    className="progress-bar h-full bg-red-400 dark:bg-red-600"
                    style={{ animationDuration: `${duration}s` }}
                />
            </div>
        </div>
    );
};

export default Alert;
