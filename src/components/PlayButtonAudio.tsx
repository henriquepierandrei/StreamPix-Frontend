import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

const PlayButtonAudio = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // ✅ Tipagem correta
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
      <button onClick={togglePlay}
        style={{
          width: '28px',
          height: '28px',
          color: '#ffffffff',
          background: 'linear-gradient(45deg, #373749, rgb(72, 103, 161))',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          margin: 0,
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 0
        }}>
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>
    </div>
  );
};

export default PlayButtonAudio;
