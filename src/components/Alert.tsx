import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const AlertContainer = styled.div`
  padding: 16px;
  background: linear-gradient(90deg, #ffa4a4ff, #fcc6c6ff);
  min-width: 350px;
  border-radius: 10px;
  
  color: #690000ff;
  border: 1px solid #690000ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const AlertMessage = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  width: max-content;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #690000ff;
  font-weight: bold;
  width: max-content;
  height: max-content;
  cursor: pointer;
  padding-left: 16px;
  position: relative;
  top: -20px;
    right: -18px;

  font-size: 16px;

  &:hover {
    opacity: 0.7;
  }
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: #690000ff;
  width: 100%;
  animation: ${({ duration }) => duration}s linear 0s 1 shrink;

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

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
        <AlertContainer>
            <AlertMessage>{error.message}</AlertMessage>
            <CloseButton
                onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                }}
            >
                ×
            </CloseButton>
            <ProgressBar duration={duration} />
        </AlertContainer>
    );
};

export default Alert;
