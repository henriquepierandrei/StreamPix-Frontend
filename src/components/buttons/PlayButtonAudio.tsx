import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

const PlayButtonAudio = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);




  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };


  return (
    <div>
      <audio ref={audioRef}>
        <source src={src} type="audio/mpeg" />
      </audio>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
        <source src={src} type="audio/mpeg" />
      </audio>
      <button
        onClick={togglePlay}
        className={`
                // Base: Compacto, Circular e Transição
                flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 transition-all duration-150

                // Tema CLARO
                bg-white border border-gray-300 text-gray-800 hover:bg-gray-300 shadow-md 
                
                // Tema ESCURO
                dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600 dark:shadow-lg
            `}
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {/* Ícones de 12px para boa visibilidade no tamanho 24x24 */}
        {isPlaying
          ? <Pause size={12} fill="currentColor" />
          // O Play tem uma ligeira margem para centralizar visualmente
          : <Play size={12} fill="currentColor" className="ml-[1px]" />
        }
      </button>
    </div>
  );
};

export default PlayButtonAudio;
