import { BellRing } from "lucide-react";
import { ApiConfig } from "../../api/ApiConfig";

const ReplayButtonDonation = ({ uuid }: { uuid: string }) => {
  const handleReplay = async () => {
    try {
      const api = ApiConfig.getInstance();
      await api.post(`/replay-donation?uuid=${uuid}`);
      console.log("Replay enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao reenviar donate:", error);
      alert("Não foi possível reenviar o donate.");
    }
  };

  return (
    <button
      onClick={handleReplay} className="replay-button">
      <BellRing size={12} />
    </button>
  );
};

export default ReplayButtonDonation;
