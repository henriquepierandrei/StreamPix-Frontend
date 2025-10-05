import { BellRing, MessageCircle } from "lucide-react";
import { ApiConfig } from "../../api/ApiConfig";
import { useState } from "react";

const ReplayButtonDonation = ({ uuid }: { uuid: string }) => {
  const [icon, setIcon] = useState(<BellRing size={12} />);

  const handleReplay = async () => {
    try {
      const api = ApiConfig.getInstance();
      await api.post(`/replay-donation?uuid=${uuid}`);
      setIcon(<MessageCircle size={12} />);
      setTimeout(() => setIcon(<BellRing size={12} />), 1500);
      console.log("Replay enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao reenviar donate:", error);
      alert("Não foi possível reenviar o donate.");
    }
  };

  return (
    <button
      onClick={handleReplay}
      className={`
                // Base: Tamanho, Forma e Transição
                w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 active:scale-95
                
                // Tema CLARO
                bg-white text-gray-600 border border-gray-300
                hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300
                shadow-sm hover:shadow-md 
                
                // Tema ESCURO (dark:)
                dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700
                dark:hover:bg-zinc-700 dark:hover:text-blue-400 dark:hover:border-blue-600
                dark:shadow-md dark:hover:shadow-lg
            `}
      aria-label="Reenviar donate"
    >
      {icon}
    </button>
  );
};

export default ReplayButtonDonation;
