import React, { useState } from "react";
import { ApiConfig } from "../../api/ApiConfig";
import { useNavigate } from "react-router-dom";

function DashboardLogin() {
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert("Digite uma chave válida!");
      return;
    }

    const isValid = await ApiConfig.validateKey(apiKey);
    if (isValid) {
      localStorage.setItem("streamer_api_key", apiKey);
      navigate("/streamer/dashboard/donations")
    } else {
      alert("❌ Chave inválida!");
    }
  };

  return (
    <div style={{ maxWidth: "320px", margin: "40px auto", textAlign: "center" }}>
      <h2>Login do Dashboard</h2>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Digite sua API Key"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />
      <button
        onClick={handleSave}
        style={{
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          background: "linear-gradient(45deg, #373749, rgb(72, 103, 161))",
          color: "white",
          cursor: "pointer",
        }}
      >
        Salvar
      </button>
    </div>
  );
}

export default DashboardLogin;
