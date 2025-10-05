import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getDonation } from '../../api/GetDonation';
import { usePaymentWebSocket } from '../../hooks/usePaymentStatus';
import logo from "../../assets/image.png";
import Loading from '../../components/Loading';

// Assumindo que o getDonation retorna isso (apenas para tipagem local)
interface DonationInfo {
    qrcode?: string;
    time_remaining_seconds: number | null;
    already_paid: boolean;
    // Adicione outras propriedades relevantes aqui (ex: amount, name)
}


const PaymentQrCode: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const { alreadyPaid } = usePaymentWebSocket(transactionId ?? null);
    const [isAlreadyPaidApi, setAlreadyPaidApi] = useState<boolean>(false);
    const [paymentInfo, setPaymentInfo] = useState<DonationInfo | null>(null);
    const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    // ────────────────────── LÓGICA DE DADOS E ESTADOS ──────────────────────

    // 1. Inicializa quando o QR code chega (via REST)
    useEffect(() => {
        if (!transactionId) {
            setLoading(false);
            return;
        }

        getDonation(transactionId)
            .then(res => {
                setPaymentInfo(res);
                setLocalTimeLeft(res.time_remaining_seconds);
                setAlreadyPaidApi(res.already_paid);
            })
            .catch(error => {
                console.error("Erro ao carregar doação:", error);
                // Trate o erro de forma apropriada, talvez definindo um status de erro
            })
            .finally(() => setLoading(false));
    }, [transactionId]);

    // 2. Decrementa o tempo restante (Timer)
    useEffect(() => {
        if (localTimeLeft === null || localTimeLeft <= 0) return;

        // Otimização: A dependência aqui deve ser apenas o ID ou 'true',
        // para que o intervalo não seja recriado a cada segundo (o que é ineficiente).
        // Usamos a função de callback do estado para ler o valor anterior.
        const interval = setInterval(() => {
            setLocalTimeLeft(prev => {
                if (prev === null) return null;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);

        // A limpeza deve ser feita quando o componente desmonta ou o tempo zera
        return () => clearInterval(interval);
    }, [localTimeLeft === null || localTimeLeft > 0]);


    // 3. Define o status do pagamento
    let paymentStatus: 'pending' | 'success' | 'expired' = 'pending';

    if (alreadyPaid || isAlreadyPaidApi) {
        paymentStatus = 'success';
    } else if (localTimeLeft !== null && localTimeLeft <= 0) {
        paymentStatus = 'expired';
    } 

    // 4. Funções auxiliares
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopy = () => {
        if (paymentInfo?.qrcode) {
            navigator.clipboard.writeText(paymentInfo.qrcode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // ────────────────────── RENDERIZAÇÃO ──────────────────────

    if (loading) {
        return <Loading />;
    }

    // Container base para centralizar tudo
    const BaseContainer = ({ children, status }: { children: React.ReactNode, status: 'pending' | 'success' | 'expired' }) => {
        const bgClass = status === 'success' ? 'bg-green-600/90' : 
                         status === 'expired' ? 'bg-red-600/90' : 
                         'bg-gray-900/90';
        
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${bgClass} transition-colors duration-500`}>
                <button
                    className="absolute top-8 left-8 text-white hover:text-gray-300 transition-colors duration-200"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft size={24} />
                </button>
                {/* Logo no topo (centralizado) */}
                <img src={logo} alt="Logo" className="absolute top-8 w-12 h-12" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                
                {children}
            </div>
        );
    };

    // ----------------------- 1. STATUS SUCESSO -----------------------
    if (paymentStatus === 'success') {
        return (
            <BaseContainer status="success">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full max-w-sm transform scale-105 transition-transform duration-500">
                    <div className="bg-green-500 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                        <CheckCircle size={32} color="white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Pagamento Aprovado!</h2>
                    <p className="text-gray-600">Sua doação foi processada com sucesso. Agradecemos imensamente o seu apoio!</p>
                </div>
            </BaseContainer>
        );
    }

    // ----------------------- 2. STATUS EXPIRADO -----------------------
    if (paymentStatus === 'expired') {
        return (
            <BaseContainer status="expired">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full max-w-sm transform scale-105 transition-transform duration-500">
                    <div className="bg-red-500 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                        <XCircle size={32} color="white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Pagamento Expirado</h2>
                    <p className="text-gray-600">O tempo limite para esta transação expirou. Por favor, inicie uma nova doação.</p>
                </div>
            </BaseContainer>
        );
    }

    // ----------------------- 3. STATUS PENDENTE (QR CODE) -----------------------
    if (paymentStatus === 'pending' && paymentInfo && paymentInfo.qrcode) {
        
        const isUrgent = localTimeLeft !== null && localTimeLeft <= 60 && localTimeLeft > 0;
        
        return (
            <BaseContainer status="pending">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Pagamento PIX</h1>
                        <p className="text-gray-500 mt-1">Escaneie ou use o Código Copia e Cola para finalizar.</p>
                    </div>

                    {/* QR Code */}
                    <div className="relative inline-block border-8 border-gray-100 p-2 rounded-lg shadow-inner mb-6">
                        <QRCodeCanvas 
                            value={paymentInfo.qrcode} 
                            size={256} 
                            level="H" 
                            includeMargin={false} 
                            className="rounded-md"
                        />
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center justify-center gap-2 font-semibold mb-6 p-2 rounded-lg transition-colors duration-300 ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Clock size={18} />
                        Expira em: 
                        <span className={`font-extrabold ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
                            {localTimeLeft !== null ? formatTime(localTimeLeft) : "00:00"}
                        </span>
                    </div>

                    {/* PIX Code and Button */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2 text-left">CÓDIGO PIX COPIA E COLA:</div>
                        
                        {/* Código (Truncado para UI) */}
                        <p className="text-xs text-gray-700 break-all h-10 overflow-hidden mb-3 text-left font-mono leading-tight">
                            {paymentInfo.qrcode}
                        </p>
                        
                        {/* Botão de Copiar */}
                        <button
                            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-bold transition-all duration-300 shadow-md ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            onClick={handleCopy}
                        >
                            {copied ? <><CheckCircle size={18} /> Copiado!</> : <><Copy size={18} /> Copiar Código PIX</>}
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                        O Processamento é instantâneo após o PIX, mas a confirmação pode levar alguns segundos.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-indigo-600 flex items-center justify-center">
                        Aguardando pagamento...
                    </p>
                </div>
            </BaseContainer>
        );
    }
    
    // ----------------------- 4. ERRO GERAL / Sem QR Code -----------------------
    return (
        <BaseContainer status="expired">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full max-w-sm">
                <div className="bg-gray-400 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                    <XCircle size={32} color="white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Transação Inválida</h2>
                <p className="text-gray-600">Não foi possível carregar os detalhes do pagamento. Verifique o link.</p>
            </div>
        </BaseContainer>
    );
};

export default PaymentQrCode;