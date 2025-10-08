import { useState, useRef, useEffect } from "react";
import { BicepsFlexed, Gauge, Mars, Mic, Music, Sparkles, Venus, Volume, Volume1, Volume2, X } from "lucide-react";

// Estilos customizados para o indicador de áudio em reprodução e o slider.
// Necessário pois o Tailwind não suporta nativamente a estilização de animações complexas ou inputs range.
const CustomStyles = () => (
  <style>
    {`
        @keyframes volume-bar {
            0%, 100% { transform: scaleY(0.2); }
            50% { transform: scaleY(1.0); }
        }

        .playing-indicator > span {
            display: block;
            width: 4px;
            height: 16px;
            background-color: #f87171; /* Cor do Tailwind red-500 */
            border-radius: 2px;
            animation: volume-bar 0.8s ease-in-out infinite alternate;
        }

        .playing-indicator > span:nth-child(2) {
            animation-delay: 0.1s;
        }

        .playing-indicator > span:nth-child(3) {
            animation-delay: 0.2s;
        }

        /* Estilização do Slider (input type="range") */
        .styled-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            outline: none;
            transition: opacity 0.2s;
        }

        .styled-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #9333ea; /* Tailwind purple-600 */
            cursor: pointer;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
        }

        .styled-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #9333ea;
            cursor: pointer;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
        }
        `}
  </style>
);


interface VoiceOption {
  id: string;
  name: string;
  avatar: any;
  gender: "male" | "female";
  audioUrl: string;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  style: string;
  styleDegree: number;
}

interface VoiceSelectorProps {
  onVoiceSelect?: (voiceId: string, settings: VoiceSettings) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface AudioComponentProps {
  onVoiceChange?: (voiceId: string, settings: VoiceSettings) => void;
}

// Componente VoiceSelector (Modal)
function VoiceSelector({ onVoiceSelect, isOpen = false, onClose }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [currentGender, setCurrentGender] = useState<"female" | "male">("female");
  const [showSettings, setShowSettings] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const [settings, setSettings] = useState<VoiceSettings>({
    rate: 0,
    pitch: 0,
    volume: 50,
    style: "cheerful", // Mantido o valor original do usuário
    styleDegree: 1,
  });

  const [voices] = useState<VoiceOption[]>([
    // Vozes Femininas (Exemplo de URLs)
    { id: "female", name: "Francisca", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614627/stream-pix-audio/female.mp3" },
    { id: "female_two", name: "Leila", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614629/stream-pix-audio/female_two.mp3" },
    { id: "female_three", name: "Letícia", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614632/stream-pix-audio/female_three.mp3" },
    { id: "female_four", name: "Thalita", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614634/stream-pix-audio/female_four.mp3" },
    { id: "female_five", name: "Brenda", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614636/stream-pix-audio/female_five.mp3" },
    { id: "female_six", name: "Elza", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614639/stream-pix-audio/female_six.mp3" },
    { id: "female_seven", name: "Giovanna", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614642/stream-pix-audio/female_seven.mp3" },
    { id: "female_nine", name: "Manuela", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614648/stream-pix-audio/female_nine.mp3" },
    { id: "female_ten", name: "Yara", avatar: <Sparkles size={28} />, gender: "female", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614650/stream-pix-audio/female_ten.mp3" },
    // Vozes Masculinas
    { id: "male", name: "Antônio", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614652/stream-pix-audio/male.mp3" },
    { id: "male_two", name: "Macério", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614654/stream-pix-audio/male_two.mp3" },
    { id: "male_three", name: "Donato", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614656/stream-pix-audio/male_three.mp3" },
    { id: "male_four", name: "Fábio", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614658/stream-pix-audio/male_four.mp3" },
    { id: "male_five", name: "Humberto", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614660/stream-pix-audio/male_five.mp3" },
    { id: "male_six", name: "Júlio", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614662/stream-pix-audio/male_six.mp3" },
    { id: "male_seven", name: "Nicolau", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614667/stream-pix-audio/male_seven.mp3" },
    { id: "male_eight", name: "Valério", avatar: <Sparkles size={28} />, gender: "male", audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614669/stream-pix-audio/male_eight.mp3" },
  ]);

  const filteredVoices = voices.filter(v => v.gender === currentGender);

  const handlePlayVoice = async (voiceId: string) => {
    // Pausa todos os outros áudios
    Object.values(audioRefs.current).forEach(audio => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    setPlayingVoice(voiceId);

    const voice = voices.find(v => v.id === voiceId);
    if (!voice) return;

    try {
      let audio = audioRefs.current[voiceId];
      if (!audio) {
        audio = new Audio(voice.audioUrl);
        audioRefs.current[voiceId] = audio;
        audio.onended = () => setPlayingVoice(null);
        audio.onerror = () => { console.error("Erro ao carregar áudio"); setPlayingVoice(null); };
      }

      audio.currentTime = 0; // Reinicia para tocar do início
      audio.volume = settings.volume / 100;
      audio.playbackRate = 1 + (settings.rate / 100);
      await audio.play();

      setSelectedVoice(voiceId);
    } catch (error) {
      console.error("Erro ao reproduzir:", error);
      setPlayingVoice(null);
    }
  };

  const handleStopVoice = (voiceId: string) => {
    if (audioRefs.current[voiceId]) {
      audioRefs.current[voiceId].pause();
      audioRefs.current[voiceId].currentTime = 0;
      setPlayingVoice(null);
    }
  };

  // Atualiza configurações dos áudios em reprodução
  useEffect(() => {
    const audio = playingVoice ? audioRefs.current[playingVoice] : null;
    if (audio) {
      audio.volume = settings.volume / 100;
      audio.playbackRate = 1 + (settings.rate / 100);
    }
  }, [settings.volume, settings.rate, playingVoice]);

  const handleContinue = () => {
    if (selectedVoice && onVoiceSelect) {
      onVoiceSelect(selectedVoice, settings);
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <CustomStyles />
      {/* Modal Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all p-6 sm:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100">Seletor de Voz IA</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-8 h-8 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 -mr-2"> {/* Content Scroll Area */}

          {/* Seletor de gênero */}
          <div className="flex space-x-3 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              className={`flex-1 flex items-center justify-center py-2 px-4 text-sm font-semibold rounded-lg transition-colors duration-200 ${currentGender === 'female' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
              onClick={() => setCurrentGender('female')}
            >
              <Venus size={16} className="mr-2" />
              Femininas
            </button>
            <button
              className={`flex-1 flex items-center justify-center py-2 px-4 text-sm font-semibold rounded-lg transition-colors duration-200 ${currentGender === 'male' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
              onClick={() => setCurrentGender('male')}
            >
              <Mars size={16} className="mr-2" />
              Masculinas
            </button>
          </div>

          {/* Texto informativo */}
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">Escolha uma voz para ler sua mensagem (clique para selecionar/ouvir):</p>

          {/* Grid de vozes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVoices.map((voice) => (
              <div
                key={voice.id}
                className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedVoice === voice.id
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/50 shadow-lg scale-[1.02]'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-400 hover:shadow-md'
                  }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="text-purple-500 dark:text-purple-300 mb-2">
                  {voice.avatar}
                </div>
                <p className="text-sm font-medium text-center text-zinc-800 dark:text-zinc-100">{voice.name}</p>

                {/* Botão Play/Pause Flutuante */}
                <button
                  className="absolute top-1 right-1 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full text-purple-600 hover:scale-110 transition-transform shadow-md w-8 h-8 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    playingVoice === voice.id ? handleStopVoice(voice.id) : handlePlayVoice(voice.id);
                  }}
                  aria-label={playingVoice === voice.id ? "Parar áudio" : "Ouvir demonstração"}
                >
                  {playingVoice === voice.id ? (
                    <div className="playing-indicator flex space-x-0.5 h-5 items-end">
                      <span />
                      <span style={{ animationDelay: '0.1s' }} />
                      <span style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Botão de configurações avançadas */}
          <button
            className="flex items-center justify-center w-full py-3 mt-6 text-purple-600 dark:text-purple-400 font-semibold rounded-xl bg-purple-50 dark:bg-zinc-800/50 hover:bg-purple-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            {/* Ícone */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2 w-5 h-5">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.32-.07.64-.07.97c0 .33.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.08.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64l-2.11-1.63Z" />
            </svg>
            {showSettings ? 'Ocultar Configurações' : 'Configurações Avançadas'}
          </button>

          {/* Painel de configurações */}
          {showSettings && (
            <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6">

              {/* Velocidade */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center"><Gauge size={16} className="mr-2 text-purple-500" /> Velocidade</span>
                  <span className="text-purple-600 font-bold">{settings.rate > 0 ? `+${settings.rate}%` : `${settings.rate}%`}</span>
                </label>
                <input
                  type="range"
                  className="styled-slider"
                  min="-50"
                  max="50"
                  step="5"
                  value={settings.rate}
                  onChange={(e) => setSettings({ ...settings, rate: Number(e.target.value) })}
                />
              </div>

              {/* Tom (Pitch) */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center"><Music size={16} className="mr-2 text-purple-500" /> Tom (Grave/Agudo)</span>
                  <span className="text-purple-600 font-bold">{settings.pitch > 0 ? `+${settings.pitch}%` : `${settings.pitch}%`}</span>
                </label>
                <input
                  type="range"
                  className="styled-slider"
                  min="-50"
                  max="50"
                  step="5"
                  value={settings.pitch}
                  onChange={(e) => setSettings({ ...settings, pitch: Number(e.target.value) })}
                />
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center">
                    {settings.volume < 40 ? <Volume size={16} className="mr-2 text-purple-500" /> : settings.volume < 80 ? <Volume1 size={16} className="mr-2 text-purple-500" /> : <Volume2 size={16} className="mr-2 text-purple-500" />}
                    Volume
                  </span>
                  <span className="text-purple-600 font-bold">{settings.volume}%</span>
                </label>
                <input
                  type="range"
                  className="styled-slider"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: Number(e.target.value) })}
                />
              </div>

              {/* Intensidade do Estilo */}
              {settings.style !== "default" && (
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <span className="flex items-center"><BicepsFlexed size={16} className="mr-2 text-purple-500" /> Intensidade do Estilo</span>
                    <span className="text-purple-600 font-bold">{settings.styleDegree === 1 ? 'Normal' : 'Forte'}</span>
                  </label>
                  <input
                    type="range"
                    className="styled-slider"
                    min="1"
                    max="2"
                    step="1"
                    value={settings.styleDegree}
                    onChange={(e) => setSettings({ ...settings, styleDegree: Number(e.target.value) })}
                  />
                </div>
              )}

            </div>
          )}


        </div>

        {/* Botão Continuar */}
        <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            className="w-full py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg hover:bg-purple-700 transition-all disabled:bg-purple-400 disabled:shadow-none disabled:cursor-not-allowed"
            disabled={!selectedVoice}
            onClick={handleContinue}
          >
            CONTINUAR COM {selectedVoice ? voices.find(v => v.id === selectedVoice)?.name.toUpperCase() : 'ESTA VOZ'}
          </button>
        </div>
      </div>
    </div>
  );


}

// Componente principal AudioComponent
export default function AudioComponent({ onVoiceChange }: AudioComponentProps) {
  const [isVoiceSelectorOpen, setIsVoiceSelectorOpen] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0,
    pitch: 0,
    volume: 50,
    style: "cheerful",
    styleDegree: 1,
  });

  const handleVoiceSelect = (voiceId: string, settings: VoiceSettings) => {
    setSelectedVoiceId(voiceId);
    setVoiceSettings(settings);
    setIsVoiceSelectorOpen(false);
    onVoiceChange?.(voiceId, settings);
  };

  const getVoiceName = (voiceId: string) => {
    const voiceNames: { [key: string]: string } = {
      "female": "Francisca",
      "female_two": "Leila",
      "female_three": "Letícia",
      "female_four": "Thalita",
      "female_five": "Brenda",
      "female_six": "Elza",
      "female_seven": "Giovanna",
      "female_nine": "Manuela",
      "female_ten": "Yara",
      "male": "Antônio",
      "male_two": "Macério",
      "male_three": "Donato",
      "male_four": "Fábio",
      "male_five": "Humberto",
      "male_six": "Júlio",
      "male_seven": "Nicolau",
      "male_eight": "Valério",
    };
    return voiceNames[voiceId] || "Nenhuma voz selecionada";
  };

  const formatStyle = (style: string) => {
    if (style === "default") return "Padrão";
    return style.charAt(0).toUpperCase() + style.slice(1);
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Voz gerada por IA:
        </label>

        {/* Botão principal para abrir o seletor */}
        <button
          type="button"
          onClick={() => setIsVoiceSelectorOpen(true)}
          className={`w-full flex items-center justify-center py-2.5 px-4 font-semibold rounded-lg transition-colors border-2 ${selectedVoiceId
            ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 dark:bg-zinc-800 dark:text-purple-400 dark:border-purple-600'
            : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
        >
          <Mic size={18} className="mr-2" />
          {selectedVoiceId ? getVoiceName(selectedVoiceId) : "Selecionar Voz"}
        </button>

        {/* Preview das configurações */}
        {selectedVoiceId && (
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <p className="flex justify-between">
              <span>Velocidade: </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-100">{voiceSettings.rate > 0 ? `+${voiceSettings.rate}%` : `${voiceSettings.rate}%`}</span>
            </p>
            <p className="flex justify-between">
              <span>Volume: </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-100">{voiceSettings.volume}%</span>
            </p>
            <p className="flex justify-between">
              <span>Estilo: </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-100">{formatStyle(voiceSettings.style)}</span>
            </p>
          </div>
        )}
      </div>

      <VoiceSelector
        isOpen={isVoiceSelectorOpen}
        onClose={() => setIsVoiceSelectorOpen(false)}
        onVoiceSelect={handleVoiceSelect}
      />
    </div>
  );


}
