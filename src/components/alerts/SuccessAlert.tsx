import { CheckCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// [Interfaces e Props permanecem inalterados]
interface SuccessAlertProps {
    success?: {
        message: string;
        path?: string;
        timestamp?: string;
    } | null;
    duration?: number;
    onClose: () => void; 
    onRedirect?: (path: string) => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ 
    success, 
    duration = 5, 
    onClose, 
    onRedirect 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Efeito de controle de visibilidade/timeout (CORRIGIDO)
    useEffect(() => {
        if (!success) {
            // Se o sucesso for null (resetado pelo pai), garantimos que tudo está fechado
            setIsVisible(false);
            setIsAnimatingOut(false); // Garante que o estado está pronto para o próximo show
            return;
        }

        // --- CORREÇÃO APLICADA AQUI ---
        // 1. Reseta a animação de saída
        setIsAnimatingOut(false); 
        // 2. Define visível
        setIsVisible(true); 

        const timer = setTimeout(() => {
            handleClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [success, duration]); // Dependência em 'success'

    // Função que aciona a animação de saída
    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose(); // Esta função DEVE resetar o estado 'success' no componente pai para 'null'
        }, 500); 
    };

    // Função para lidar com o clique
    const handleMessageClick = () => {
        // ... (lógica mantida)
        if (currentSuccess.path && onRedirect) { 
            onRedirect(currentSuccess.path);
            handleClose();
        } else {
            handleClose();
        }
    };

    // Verificação de saída antecipada. Essencial.
    if (!success || !isVisible) return null;

    const currentSuccess = success;

    return (
        <div 
            className={`fixed bottom-4 right-4 z-50 w-80 shadow-2xl rounded-xl overflow-hidden 
                         bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 
                         transition-all duration-500 transform
                         ${isAnimatingOut ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`
                     }
        >
            
            {/* Conteúdo do Alerta */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3 flex-grow">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    
                    <p 
                        className={`text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100 
                                     ${currentSuccess.path ? 'cursor-pointer hover:text-purple-600 transition' : ''}` 
                                    }
                        onClick={handleMessageClick}
                    >
                        {currentSuccess.message}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="ml-4 p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
                    aria-label="Fechar notificação"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Barra de Progresso (Timeout) */}
            <div className="h-1 bg-green-500/30">
                <div
                    className={`h-full bg-green-500 origin-left 
                                 ${isAnimatingOut ? 'w-0' : 'animate-progress-countdown'}`
                                 }
                    // Adicionar uma 'key' única ao div da barra de progresso forçará o recálculo da animação de CSS
                    key={currentSuccess.timestamp || 'default'} 
                    style={{ animationDuration: `${duration}s` }} 
                />
            </div>
        </div>
    );
};

export default SuccessAlert;