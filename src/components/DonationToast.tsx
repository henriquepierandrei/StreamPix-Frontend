import React, { useEffect, useRef, useState } from "react";
import { X, Volume2, User } from "lucide-react";
import Logo from "../assets/logo.png"
import "./DonationToast.css";

type DonationToastProps = {
  name: string;
  amount: number;         // ex: 5, 10.5, 0.05
  message?: string;
  autoCloseMs?: number;   // padrão 6000ms
  onClose?: () => void;
  playSoundUrl?: string;  // opcional: tocar som ao abrir
};

function formatAmountCurrency(amount: number): string {
  const isInt = Number.isInteger(amount);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: isInt ? 0 : 2,
  }).format(amount);
}

function formatAmountText(amount: number): string {
  if (amount < 1) {
    // 0.05 -> 5 centavos
    const centavos = Math.round(amount * 100);
    return `${centavos} ${centavos === 1 ? "centavo" : "centavos"}`;
  }
  const isInt = Number.isInteger(amount);
  const inteiro = Math.trunc(amount);
  const resto = Math.round((amount - inteiro) * 100);
  const reaisParte = `${inteiro} ${inteiro === 1 ? "real" : "reais"}`;
  if (resto === 0) return reaisParte;
  const centavosParte = `${resto} ${resto === 1 ? "centavo" : "centavos"}`;
  return `${reaisParte} e ${centavosParte}`;
}

const DonationToast: React.FC<DonationToastProps> = ({
  name,
  amount,
  message,
  autoCloseMs = 6000,
  onClose,
  playSoundUrl,
}) => {
  const [visible, setVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef<number | null>(null);

  // auto-close com pausa no hover
  // useEffect(() => {
  //   if (hovering) {
  //     if (timerRef.current) window.clearTimeout(timerRef.current);
  //     return;
  //   }
  //   timerRef.current = window.setTimeout(() => {
  //     setVisible(false);
  //     onClose?.();
  //   }, autoCloseMs);
  //   return () => {
  //     if (timerRef.current) window.clearTimeout(timerRef.current);
  //   };
  // }, [hovering, autoCloseMs, onClose]);

  // som opcional ao abrir
  useEffect(() => {
    if (!playSoundUrl) return;
    const audio = new Audio(playSoundUrl);
    audio.volume = 0.8;
    audio.play().catch(() => {/* ignore autoplay block */ });
  }, [playSoundUrl]);

  if (!visible) return null;

  const amountCurrency = formatAmountCurrency(amount);
  const amountText = formatAmountText(amount);

  const formatMessage = (msg: string) => {
    if (msg.length <= 60) return msg;
    return msg.slice(0, 60) + "...";
  };

  return (
    <div
      className="spx-toast"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >


      <div className="spx-toast__left">
        <div className="spx-avatar">
          <img src={Logo} alt="" width={"20px"}/>
        </div>
      </div>

      <div className="spx-toast__content">
        <div className="spx-toast__headline">
          <span className="spx-name">{name}</span>{" "}
          <span className="spx-verb">enviou</span>{" "}
          <strong className="spx-amount">{amountCurrency}</strong>
        </div>
        

        {message && <div className="spx-toast__message">“{formatMessage(message)}”</div>}
      </div>
    </div>
  );
};

export default DonationToast;
