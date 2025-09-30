import { X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './AlertStyle.css';

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

        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [error, duration, onClose]);

    if (!error || !visible) return null;

    return (
        <div className="alert-container">
            <p className="alert-message" style={{border: "none"}}>
                <XCircle /> {error.message}
            </p>
            <button
                className="alert-close"
                onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                }}
            >
                <X size={16} />
            </button>
            <div
                className="alert-progress"
                style={{ animationDuration: `${duration}s` }}
            />
        </div>
    );
};

export default Alert;
