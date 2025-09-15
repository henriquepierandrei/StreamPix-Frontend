import { useState, useRef, useEffect } from "react";
import "./AudioComponentStyle.css";
import { Badge, BicepsFlexed, Gauge, Laugh, Mars, Mic, Music, Sparkles, Venus, Volume, Volume1, Volume2 } from "lucide-react";

interface VoiceOption {
  id: string;
  name: string;
  avatar: any;
  gender: "male" | "female";
  audioUrl: string;
  isPlaying?: boolean;
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

// Componente VoiceSelector
function VoiceSelector({ onVoiceSelect, isOpen = false, onClose }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [currentGender, setCurrentGender] = useState<"male" | "female">("female");
  const [showSettings, setShowSettings] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const [settings, setSettings] = useState<VoiceSettings>({
    rate: 0,
    pitch: 0,
    volume: 50,
    style: "cheerful",
    styleDegree: 1,
  });

  const [voices] = useState<VoiceOption[]>([
    // Vozes Femininas
    {
      id: "female",
      name: "Francisca",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614627/stream-pix-audio/female.mp3"
    },
    {
      id: "female_two",
      name: "Leila",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614629/stream-pix-audio/female_two.mp3"
    },
    {
      id: "female_three",
      name: "Letícia",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614632/stream-pix-audio/female_three.mp3"
    },
    {
      id: "female_four",
      name: "Thalita",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614634/stream-pix-audio/female_four.mp3"
    },
    {
      id: "female_five",
      name: "Brenda",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614636/stream-pix-audio/female_five.mp3"
    },
    {
      id: "female_six",
      name: "Elza",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614639/stream-pix-audio/female_six.mp3"
    },
    {
      id: "female_seven",
      name: "Giovanna",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614642/stream-pix-audio/female_seven.mp3"
    },
    {
      id: "female_nine",
      name: "Manuela",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614648/stream-pix-audio/female_nine.mp3"
    },
    {
      id: "female_ten",
      name: "Yara",
      avatar: <Sparkles />,
      gender: "female",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614650/stream-pix-audio/female_ten.mp3"
    },

    // Vozes Masculinas
    {
      id: "male",
      name: "Antônio",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614652/stream-pix-audio/male.mp3"
    },
    {
      id: "male_two",
      name: "Macério",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614654/stream-pix-audio/male_two.mp3"
    },
    {
      id: "male_three",
      name: "Donato",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614656/stream-pix-audio/male_three.mp3"
    },
    {
      id: "male_four",
      name: "Fábio",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614658/stream-pix-audio/male_four.mp3"
    },
    {
      id: "male_five",
      name: "Humberto",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614660/stream-pix-audio/male_five.mp3"
    },
    {
      id: "male_six",
      name: "Júlio",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614662/stream-pix-audio/male_six.mp3"
    },
    {
      id: "male_seven",
      name: "Nicolau",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614667/stream-pix-audio/male_seven.mp3"
    },
    {
      id: "male_eight",
      name: "Valério",
      avatar: <Sparkles />,
      gender: "male",
      audioUrl: "https://res.cloudinary.com/dvadwwvub/video/upload/v1757614669/stream-pix-audio/male_eight.mp3"
    },
  ]);

  const filteredVoices = voices.filter(v => v.gender === currentGender);

  const handlePlayVoice = async (voiceId: string) => {
    // Para todos os áudios em reprodução
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
      // Se já existe uma referência de áudio, use ela
      if (audioRefs.current[voiceId]) {
        const audio = audioRefs.current[voiceId];
        audio.volume = settings.volume / 100;
        audio.playbackRate = 1 + (settings.rate / 100);
        await audio.play();
      } else {
        // Criar novo áudio
        const audio = new Audio(voice.audioUrl);
        audioRefs.current[voiceId] = audio;

        audio.volume = settings.volume / 100;
        audio.playbackRate = 1 + (settings.rate / 100);

        audio.onended = () => {
          setPlayingVoice(null);
        };

        audio.onerror = () => {
          console.error("Erro ao carregar áudio");
          setPlayingVoice(null);
        };

        await audio.play();
      }

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

  // Atualizar configurações dos áudios quando settings mudar
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = settings.volume / 100;
        audio.playbackRate = 1 + (settings.rate / 100);
      }
    });
  }, [settings.volume, settings.rate]);

  const handleContinue = () => {
    if (selectedVoice && onVoiceSelect) {
      onVoiceSelect(selectedVoice, settings);
      onClose?.(); // Fecha o modal após selecionar
    }
  };

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="voice-selector-modal">
      <div className="voice-selector-container">

        {/* Seletor de gênero */}
        <div className="gender-selector">
          <button
            className={`gender-btn ${currentGender === 'female' ? 'active' : ''}`}
            onClick={() => setCurrentGender('female')}
          >
            <span className="gender-icon"><Venus /></span>
            Vozes Femininas
          </button>
          <button
            className={`gender-btn ${currentGender === 'male' ? 'active' : ''}`}
            onClick={() => setCurrentGender('male')}
          >
            <span className="gender-icon"><Mars /></span>
            Vozes Masculinas
          </button>
        </div>

        {/* Texto informativo */}
        <p className="voice-instruction">Escolha uma voz para ler sua mensagem:</p>

        {/* Grid de vozes */}
        <div className="voices-grid">
          {filteredVoices.map((voice) => (
            <div
              key={voice.id}
              className={`voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
              onClick={() => playingVoice === voice.id ? handleStopVoice(voice.id) : handlePlayVoice(voice.id)}
            >
              <div className="voice-avatar">
                <span className="avatar-text">{voice.avatar}</span>
                {playingVoice === voice.id && (
                  <div className="playing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
              <button className="play-btn" onClick={(e) => {
                e.stopPropagation();
                playingVoice === voice.id ? handleStopVoice(voice.id) : handlePlayVoice(voice.id);
              }}>
                {playingVoice === voice.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <p className="voice-name">{voice.name}</p>
            </div>
          ))}
        </div>

        {/* Botão de configurações avançadas */}
        <button
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.32-.07.64-.07.97c0 .33.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.08.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64l-2.11-1.63Z" />
          </svg>
          Configurações Avançadas
        </button>

        {/* Painel de configurações */}
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-group">
              <label className="setting-label">
                <span className="setting-icon"><Gauge /></span>
                Velocidade
                <span className="setting-value">{settings.rate > 0 ? `+${settings.rate}%` : `${settings.rate}%`}</span>
              </label>
              <input
                type="range"
                className="setting-slider"
                min="-50"
                max="50"
                step="5"
                value={settings.rate}
                onChange={(e) => setSettings({ ...settings, rate: Number(e.target.value) })}
              />
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <span className="setting-icon"><Music /></span>
                Tom (Grave/Agudo)
                <span className="setting-value">{settings.pitch > 0 ? `+${settings.pitch}%` : `${settings.pitch}%`}</span>
              </label>
              <input
                type="range"
                className="setting-slider"
                min="-50"
                max="50"
                step="5"
                value={settings.pitch}
                onChange={(e) => setSettings({ ...settings, pitch: Number(e.target.value) })}
              />
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <span className="setting-icon">
                  {settings.volume < 45
                    ? <Volume />
                    : settings.volume <= 90
                      ? <Volume1 />
                      : <Volume2 />
                  }
                </span>
                Volume
                <span className="setting-value">{settings.volume}%</span>
              </label>
              <input
                type="range"
                className="setting-slider"
                min="0"
                max="100"
                step="5"
                value={settings.volume}
                onChange={(e) => setSettings({ ...settings, volume: Number(e.target.value) })}
              />
            </div>



            {settings.style !== "default" && (
              <div className="setting-group">
                <label className="setting-label">
                  <span className="setting-icon"><BicepsFlexed /></span>
                  Intensidade do Estilo
                  <span className="setting-value">{settings.styleDegree === 1 ? 'Normal' : 'Forte'}</span>
                </label>
                <input
                  type="range"
                  className="setting-slider"
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

        {/* Botão Continuar */}
        <button
          className="continue-btn"
          disabled={!selectedVoice}
          onClick={handleContinue}
        >
          CONTINUAR
        </button>
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
    style: "default",
    styleDegree: 1,
  });

  const handleVoiceSelect = (voiceId: string, settings: VoiceSettings) => {
    setSelectedVoiceId(voiceId);
    setVoiceSettings(settings);
    setIsVoiceSelectorOpen(false);

    // Exporta as configurações para o componente principal
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

  return (
    <div className="audio-component">
      <div className="form-group">
        <label className="label"> Voz gerada por IA:</label>
        <button
          type="button"
          onClick={() => setIsVoiceSelectorOpen(true)}
          className="voice-selector-button"
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <span className="voice-icon"><Mic size={15} strokeWidth={3} /></span>
          {selectedVoiceId ? getVoiceName(selectedVoiceId) : "Selecionar Voz"}
        </button>

        {selectedVoiceId && (
          <div className="voice-settings-preview">
            <small>
              Velocidade: {voiceSettings.rate > 0 ? `+${voiceSettings.rate}%` : `${voiceSettings.rate}%`} |
              Volume: {voiceSettings.volume}% |
              Estilo: {voiceSettings.style === "default" ? "Padrão" : voiceSettings.style}
            </small>
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