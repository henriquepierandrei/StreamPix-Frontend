import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";

// 🔑 Change this version to force the popup to show again
const POPUP_VERSION = "v1";

// 🔑 Control whether to show the popup
const SHOW_POPUP = true;

export default function DailyPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!SHOW_POPUP) return; // manually disabled

    const saved = localStorage.getItem("daily-popup-closed");

    let lastClosed: { version: string } | null = null;
    if (saved) {
      try {
        lastClosed = JSON.parse(saved);
      } catch {}
    }

    // Show if version changed OR never closed
    if (!lastClosed || lastClosed.version !== POPUP_VERSION) {
      setShow(true);
    }
  }, []);

  const todayBR: string = new Date().toLocaleDateString("pt-BR");

  const closePopup = () => {
    const data = { version: POPUP_VERSION };
    localStorage.setItem("daily-popup-closed", JSON.stringify(data));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-700 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600 transition-colors"
          onClick={closePopup}
          aria-label="Fechar popup"
        >
          ✖
        </button>

        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
          <AlertOctagon size={20} /> Notificação
        </h2>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700 w-full"></div>

        <p className="text-zinc-700 dark:text-zinc-300 text-sm">
          <strong>Streampix</strong>, atualmente, não aceita usuários externos. Isso é um projeto educacional, então, não use para fins lucrativos.
        </p>

        <span className="self-end text-xs text-zinc-400 dark:text-zinc-600 opacity-50">{todayBR}</span>
      </div>
    </div>
  );
}
