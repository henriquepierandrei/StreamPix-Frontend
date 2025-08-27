import { BellRing } from "lucide-react";
import { ApiConfig } from "../api/ApiConfig";

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
      onClick={handleReplay}
      style={{
        width: "28px",
        height: "28px",
        color: "#fff",
        background: "linear-gradient(45deg, #373749, rgb(72, 103, 161))",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <BellRing size={12} />
    </button>
  );
};

export default ReplayButtonDonation;
