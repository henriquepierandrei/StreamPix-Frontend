import { CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './SuccessAlertStyle.css';

interface SuccessAlertProps {
    success?: {
        message: string;
        timestamp?: string;
    } | null;
    duration?: number; // duração em segundos
    onClose?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ success, duration = 5, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [success, duration, onClose]);

    if (!success || !visible) return null;

    return (
        <div className="success-alert-container">
            <p className="success-alert-message" style={{ border: "none" }}>
                <CheckCircle /> {success.message}
            </p>
            <div
                className="success-alert-progress"
                style={{ animationDuration: `${duration}s` }}
            />
        </div>
    );
};


export default SuccessAlert;