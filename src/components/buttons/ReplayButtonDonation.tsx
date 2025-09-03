import { BellRing, MessageCircle } from "lucide-react";
import { ApiConfig } from "../../api/ApiConfig";
import { useState } from "react";

const ReplayButtonDonation = ({ uuid }: { uuid: string }) => {
  
  const[icon, setIcon] = useState<any>(<BellRing size={12} />);
  const handleReplay = async () => {
    try {
      const api = ApiConfig.getInstance();
      await api.post(`/replay-donation?uuid=${uuid}`);
      setIcon(<MessageCircle size={12}/>)
      setTimeout(() => setIcon(<BellRing size={12} />), 1500);
      console.log("Replay enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao reenviar donate:", error);
      alert("Não foi possível reenviar o donate.");
    }
  };

  return (
    <button
      onClick={handleReplay} className="replay-button">
      {icon}
    </button>
  );
};

export default ReplayButtonDonation;
