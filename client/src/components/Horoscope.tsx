import React, { useState, useEffect } from 'react';
import { Star, Sparkles, RefreshCw, Volume2, VolumeX, Loader2 } from 'lucide-react';
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

interface HoroscopeData {
  sign: string;
  horoscope: string;
  date: string;
}

const zodiacSigns = [
  { name: 'aries', symbol: '♈', emoji: '🐏', constellation: 'ram' },
  { name: 'taurus', symbol: '♉', emoji: '🐂', constellation: 'bull' },
  { name: 'gemini', symbol: '♊', emoji: '👯', constellation: 'twins' },
  { name: 'cancer', symbol: '♋', emoji: '🦀', constellation: 'crab' },
  { name: 'leo', symbol: '♌', emoji: '🦁', constellation: 'lion' },
  { name: 'virgo', symbol: '♍', emoji: '👩', constellation: 'maiden' },
  { name: 'libra', symbol: '♎', emoji: '⚖️', constellation: 'scales' },
  { name: 'scorpio', symbol: '♏', emoji: '🦂', constellation: 'scorpion' },
  { name: 'sagittarius', symbol: '♐', emoji: '🏹', constellation: 'archer' },
  { name: 'capricorn', symbol: '♑', emoji: '🐐', constellation: 'goat' },
  { name: 'aquarius', symbol: '♒', emoji: '🏺', constellation: 'water' },
  { name: 'pisces', symbol: '♓', emoji: '🐟', constellation: 'fish' }
];

interface HoroscopeProps {
  onBack?: () => void;
}

export default function Horoscope({ onBack }: HoroscopeProps) {
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const [sliderRef] = useKeenSlider({
    loop: false,
    mode: "free-snap",
    slides: {
      perView: 3.5,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 1024px)": {
        slides: { perView: 'auto' },
      }
    }
  });

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/horoscope/${sign}`);
      if (response.ok) {
        const data = await response.json();
        setHoroscopeData({
          sign: sign.charAt(0).toUpperCase() + sign.slice(1),
          horoscope: data.horoscope,
          date: new Date().toLocaleDateString()
        });
      } else {
        throw new Error(`API failed with status ${response.status}`);
      }
    } catch (error) {
      setError('Unable to fetch horoscope. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignChange = (sign: string) => {
    setSelectedSign(sign);
    fetchHoroscope(sign);
  };

  const handleRefresh = () => {
    fetchHoroscope(selectedSign);
  };

  const handleVoiceToggle = async () => {
    if (!horoscopeData) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    try {
      setIsLoadingAudio(true);
      setError(null);
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: horoscopeData.horoscope,
          voice: 'carla',
          emotionalContext: 'calming'
        }),
      });
      if (!response.ok) throw new Error('Voice synthesis failed');

      const audioBlob = await response.blob();
      if (audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          setError('Audio playback failed');
        };
        setIsPlaying(true);
        await audio.play();
      } else {
        setError('No audio data received');
      }
    } catch (error) {
      setError('Voice synthesis failed. Please try again.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Constellation patterns for each zodiac sign
  const getConstellationPattern = (constellation: string) => {
    const patterns = {
      ram: [[20, 30], [40, 20], [60, 35], [80, 25]],
      bull: [[25, 35], [45, 25], [65, 30], [75, 40]],
      twins: [[30, 25], [50, 30], [70, 25], [30, 55], [50, 60], [70, 55]],
      crab: [[35, 30], [50, 25], [65, 30], [40, 45], [60, 45]],
      lion: [[25, 25], [45, 30], [65, 25], [35, 45], [55, 50], [75, 45]],
      maiden: [[30, 20], [50, 25], [70, 30], [40, 50], [60, 55]],
      scales: [[35, 25], [65, 25], [50, 40], [30, 55], [70, 55]],
      scorpion: [[20, 30], [40, 25], [60, 35], [80, 40], [70, 55]],
      archer: [[25, 30], [45, 25], [65, 35], [75, 20], [85, 30]],
      goat: [[30, 25], [50, 30], [70, 25], [45, 45], [65, 50]],
      water: [[35, 20], [55, 25], [75, 30], [40, 45], [60, 50], [80, 45]],
      fish: [[25, 30], [45, 25], [65, 35], [30, 50], [50, 55], [70, 50]]
    };
    return patterns[constellation as keyof typeof patterns] || patterns.ram;
  };

  const renderConstellation = (constellation: string) => {
    const points = getConstellationPattern(constellation);
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        <defs>
          <radialGradient id={`starGlow-${constellation}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2"/>
          </radialGradient>
        </defs>
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point[0]}
              cy={point[1]}
              r="1.5"
              fill={`url(#starGlow-${constellation})`}
              className="animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '2s'
              }}
            />
            {index < points.length - 1 && (
              <line
                x1={point[0]}
                y1={point[1]}
                x2={points[index + 1][0]}
                y2={points[index + 1][1]}
                stroke="rgba(124, 58, 237, 0.4)"
                strokeWidth="0.5"
                className="constellation-line"
              />
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-y-auto">
      <div className="min-h-full p-4 py-8">
        <div className="max-w-7xl mx-auto bg-[#1a237e]/80 backdrop-blur-xl rounded-2xl border border-[#7986cb]/30 shadow-2xl mb-8">
          <div className="sticky top-0 bg-[#1a237e]/90 backdrop-blur-xl p-6 border-b border-[#7986cb]/20 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-[#3f51b5] to-[#5c6bc0] shadow-lg">
                  <Star className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-white tracking-wide">Daily Horoscope</h1>
                  <p className="text-white/60 text-sm mt-1">Cosmic guidance for your wellness journey</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-3 rounded-xl bg-[#1a237e]/60 hover:bg-[#1a237e]/80 transition-all duration-200 disabled:opacity-50 border border-[#7986cb]/20 hover:border-[#7986cb]/40"
                >
                  <RefreshCw className={`text-white ${loading ? 'animate-spin' : ''}`} size={20} />
                </button>
                <button
                  onClick={onBack || (() => window.history.back())}
                  className="p-3 rounded-xl bg-red-600/20 hover:bg-red-600/40 transition-all duration-200 border border-red-400/20 hover:border-red-400/40"
                  title="Back to Home"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
            </div>
          </div>

          {/* Animated Zodiac Sign Selector with Constellation Backgrounds */}
          <div className="mb-8 px-6">
            <h3 className="text-xl font-light text-white mb-6 tracking-wide text-center">
              ✨ Select Your Zodiac Sign ✨
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign.name}
                  onClick={() => handleSignChange(sign.name)}
                  className={`zodiac-card relative overflow-hidden group py-6 px-4 rounded-2xl border-2 constellation-backdrop ${
                    selectedSign === sign.name
                      ? 'selected bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-400/80 shadow-2xl shadow-purple-500/50'
                      : 'bg-gradient-to-br from-gray-900/70 to-gray-800/70 border-gray-500/50 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/30'
                  }`}
                >
                  {renderConstellation(sign.constellation)}
                  <div className="relative z-10 text-center space-y-2">
                    <div className="text-3xl mb-2 zodiac-float">{sign.emoji}</div>
                    <div className="text-2xl font-light text-white">{sign.symbol}</div>
                    <div className="text-sm font-medium text-white/90 capitalize tracking-wider">
                      {sign.name}
                    </div>
                    <div className="text-xs text-white/60 capitalize">
                      {sign.constellation}
                    </div>
                  </div>
                  {selectedSign === sign.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl mystical-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Horoscope Content Display */}
          <div className="px-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6">
                <p className="text-red-200 text-center">{error}</p>
              </div>
            )}

            {loading && (
              <div className="bg-white/5 rounded-xl p-8 mb-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin text-white" size={24} />
                  <span className="text-white/90">Consulting the stars...</span>
                </div>
              </div>
            )}

            {horoscopeData && !loading ? (
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 border border-white/20">
                  <div>
                    <h2 className="text-2xl font-light text-white mb-1">
                      {horoscopeData.sign} Horoscope
                    </h2>
                    <p className="text-white/60 text-sm">{horoscopeData.date}</p>
                  </div>
                  <button
                    onClick={handleVoiceToggle}
                    disabled={isLoadingAudio}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#3f51b5] hover:bg-[#5c6bc0] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="animate-spin text-white" size={16} />
                    ) : isPlaying ? (
                      <VolumeX className="text-white" size={16} />
                    ) : (
                      <Volume2 className="text-white" size={16} />
                    )}
                    <span className="text-white text-sm">
                      {isLoadingAudio ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}
                    </span>
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <div className="text-white leading-8 space-y-6 text-lg font-light">
                      {horoscopeData.horoscope.split(/\n\s*\n/).filter(p => p.trim()).map((paragraph, index) => (
                        <p key={index} className="text-white/95 leading-8 text-justify">
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}