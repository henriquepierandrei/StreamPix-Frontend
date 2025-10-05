import React from "react";
import { useGoalWebSocket } from "./GoalWebSocket";
import { useSearchParams } from "react-router-dom";
import { Clock, TrendingUp, CheckCircle } from "lucide-react";

interface GoalData {
    current_balance: number;
    balance_to_achieve: number;
    reason?: string | null;
    end_at_in_days?: number | null;
}

// Formatador de moeda para consistência e clareza
const formatCurrency = (value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`;

export const GoalComponentToShow: React.FC = () => {
    const [searchParams] = useSearchParams();
    const streamerId = searchParams.get("streamerId");
    
    // Verifica se o ID do streamer está presente (Primeira Verificação)
    if (!streamerId) {
        return (
            <div className="p-2 bg-red-600/70 text-white text-sm rounded-lg shadow-xl">
                Erro: Streamer não definido.
            </div>
        );
    }

    const goal: GoalData = useGoalWebSocket(streamerId); 
    
    const isGoalActive = goal.balance_to_achieve > 0;
    const isGoalAchieved = isGoalActive && goal.current_balance >= goal.balance_to_achieve;

    // Cálculo da porcentagem (limitado a 100%)
    const percent = isGoalActive
        ? Math.min((goal.current_balance / goal.balance_to_achieve) * 100, 100)
        : 0;
        
    // Lógica para o texto de conclusão do prazo
    const endText = (() => {
        const days = goal.end_at_in_days ?? null; 
        
        if (!isGoalActive || days === null) return null;
        
        if (days <= 0 && !isGoalAchieved) {
            return "PRAZO ENCERRADO!";
        }
        
        const dayText = days === 1 ? "dia" : "dias";
        return `Termina em ${days} ${dayText}`;
    })();

    // Cores dinâmicas para o TEMA CLARO
    const barColor = isGoalAchieved ? 'bg-amber-500' : 'bg-green-500';
    const containerShadow = isGoalAchieved ? 'shadow-amber-500/50' : 'shadow-green-500/50';

    // Estado para quando não há meta ativa (Ajustado para Tema Claro)
    if (!isGoalActive) {
        return (
            <div className="p-2 bg-gray-100/90 text-gray-700 text-sm rounded-lg shadow-xl border border-gray-300">
                <p className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-500" /> Nenhuma meta ativa no momento.
                </p>
            </div>
        );
    }
    
    return (
        // === CONTAINER PRINCIPAL HORIZONTAL E TEMA CLARO ===
        <div 
            // Largura fixa (ou max-w-lg) e layout flex horizontal
            className={`w-full max-w-xl flex items-center p-2 bg-white/95 backdrop-blur-sm 
                        rounded-xl shadow-lg transition-all duration-500 border border-gray-200 
                        ${containerShadow}`} // Mantém o shadow colorido
        >
            
            {/* Bloco 1: Título e Prazo (Fica à esquerda) */}
            <div className="flex flex-col flex-shrink-0 min-w-[120px] max-w-[200px] pr-3 border-r border-gray-200">
                <p 
                    className="text-sm font-semibold text-gray-900 truncate" 
                    title={goal.reason ?? "Meta de Doação"}
                >
                    {goal.reason ?? "Meta de Doação"}
                </p>
                
                {endText && (
                    <p className={`text-xs font-medium flex items-center gap-1 mt-0.5 
                                 ${goal.end_at_in_days && goal.end_at_in_days <= 1 && !isGoalAchieved ? 'text-red-600' : 'text-gray-500'}`}>
                        <Clock size={12} />
                        {endText}
                    </p>
                )}
            </div>

            {/* Bloco 2: Barra de Progresso e Valores (Ocupa o centro e direita) */}
            <div className="flex flex-1 flex-col justify-center pl-3">

                {/* Linha 1: Barra de Progresso */}
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner w-full">
                    <div
                        className={`h-full flex items-center justify-center transition-all duration-700 
                                    ${barColor} text-white font-bold text-xs tracking-wide 
                                    ${isGoalAchieved ? 'animate-pulse' : ''}`}
                        style={{ width: `${percent}%` }}
                    >
                        {/* Exibe o percentual apenas se a barra for grande o suficiente */}
                        {percent > 20 && !isGoalAchieved && (
                            <span className="px-2">{percent.toFixed(0)}%</span>
                        )}
                    </div>
                </div>

                {/* Linha 2: Valores Numéricos */}
                <div className="flex justify-between items-center mt-1.5 text-gray-900">
                    
                    {/* Arrecadado */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-600 uppercase font-medium">Arrecadado:</span>
                        <span className="text-sm font-extrabold text-green-600">
                            {formatCurrency(goal.current_balance)}
                        </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-baseline gap-1 text-right">
                        <span className="text-xs text-gray-600 uppercase font-medium">Meta:</span>
                        <span className="text-sm font-extrabold">
                            {formatCurrency(goal.balance_to_achieve)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bloco 3: Meta Atingida (Círculo de Check) */}
            {isGoalAchieved && (
                <div className={`ml-3 p-1.5 rounded-full ${barColor} animate-pop`}>
                    <CheckCircle size={20} className="text-white" />
                </div>
            )}
            
        </div>
    );
};