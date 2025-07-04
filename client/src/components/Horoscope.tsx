import React, { useState, useEffect } from 'react';
import { Star, Sparkles, RefreshCw, Volume2, VolumeX, Loader2 } from 'lucide-react';

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

// Constellation patterns for each zodiac sign
const constellationPatterns = {
  aries: [[20, 30], [40, 20], [60, 40], [80, 25]],
  taurus: [[15, 40], [35, 25], [55, 35], [75, 20], [85, 45]],
  gemini: [[25, 20], [45, 30], [25, 50], [45, 60], [65, 25], [65, 55]],
  cancer: [[30, 35], [50, 25], [70, 40], [50, 55]],
  leo: [[20, 25], [35, 20], [50, 30], [65, 25], [80, 35], [70, 50]],
  virgo: [[25, 20], [40, 30], [55, 20], [70, 35], [55, 50], [40, 60]],
  libra: [[30, 30], [50, 20], [70, 30], [50, 50]],
  scorpio: [[20, 40], [35, 30], [50, 35], [65, 25], [80, 40], [70, 55]],
  sagittarius: [[25, 45], [40, 30], [55, 35], [70, 20], [85, 30]],
  capricorn: [[30, 25], [45, 35], [60, 30], [75, 45], [60, 55]],
  aquarius: [[20, 30], [35, 40], [50, 25], [65, 40], [80, 30]],
  pisces: [[25, 25], [40, 35], [55, 30], [70, 45], [55, 55], [40, 50]]
};

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

  console.log('Horoscope component rendered');
  console.log('zodiacSigns array:', zodiacSigns);

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching horoscope for sign: ${sign}`);
      // Use the correct GET endpoint with sign as parameter
      const response = await fetch(`/api/horoscope/${sign}`);
      console.log('Horoscope response status:', response.status);
      console.log('Horoscope response headers:', response.headers.get('content-type'));

      if (response.ok) {
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200));
        
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed horoscope data:', data);
          setHoroscopeData({
            sign: sign.charAt(0).toUpperCase() + sign.slice(1),
            horoscope: data.horoscope,
            date: new Date().toLocaleDateString()
          });
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setError('Invalid response format from server.');
        }
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText.substring(0, 200));
        throw new Error(`API failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Horoscope API failed:', error);
      setError('Unable to fetch horoscope. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignChange = (sign: string) => {
    console.log('Zodiac sign clicked:', sign);
    setSelectedSign(sign);
    fetchHoroscope(sign);
  };

  // Constellation component for animated background
  const ConstellationBackground = ({ signName, isSelected }: { signName: string, isSelected: boolean }) => {
    const pattern = constellationPatterns[signName as keyof typeof constellationPatterns] || [];
    
    return (
      <div className={`absolute inset-0 transition-all duration-700 ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
        <svg className="w-full h-full" viewBox="0 0 100 80">
          {/* Background cosmic dust */}
          <defs>
            <radialGradient id={`cosmic-${signName}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.1)" />
              <stop offset="50%" stopColor="rgba(79, 70, 229, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {isSelected && (
            <circle
              cx="50"
              cy="40"
              r="35"
              fill={`url(#cosmic-${signName})`}
              className="transition-all duration-1000"
            />
          )}
          
          {/* Stars */}
          {pattern.map((star, index) => (
            <circle
              key={`star-${index}`}
              cx={star[0]}
              cy={star[1]}
              r={isSelected ? "2" : "1.5"}
              className={`fill-white transition-all duration-1000 ${
                isSelected ? 'constellation-star selected' : 'constellation-star'
              }`}
              style={{
                animationDelay: `${index * 300}ms`,
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(186,164,240,0.9))' : 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
              }}
            />
          ))}
          
          {/* Constellation lines */}
          {pattern.length > 1 && pattern.map((star, index) => {
            if (index === pattern.length - 1) return null;
            const nextStar = pattern[index + 1];
            return (
              <line
                key={`line-${index}`}
                x1={star[0]}
                y1={star[1]}
                x2={nextStar[0]}
                y2={nextStar[1]}
                className={`transition-all duration-1000 ${
                  isSelected ? 'stroke-purple-300/80 constellation-line selected' : 'stroke-white/30 constellation-line'
                }`}
                strokeWidth={isSelected ? "1" : "0.5"}
                style={{
                  animationDelay: `${index * 400}ms`
                }}
              />
            );
          })}
          
          {/* Connect last to first for closed constellations */}
          {pattern.length > 2 && (
            <line
              x1={pattern[pattern.length - 1][0]}
              y1={pattern[pattern.length - 1][1]}
              x2={pattern[0][0]}
              y2={pattern[0][1]}
              className={`transition-all duration-1000 ${
                isSelected ? 'stroke-purple-300/80 constellation-line selected' : 'stroke-white/30 constellation-line'
              }`}
              strokeWidth={isSelected ? "1" : "0.5"}
              style={{
                animationDelay: `${pattern.length * 400}ms`
              }}
            />
          )}
        </svg>
      </div>
    );
  };

  const handleRefresh = () => {
    fetchHoroscope(selectedSign);
  };

  const handleVoiceToggle = async () => {
    if (!horoscopeData) return;

    if (isPlaying && currentAudio) {
      // Stop current audio
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    try {
      setIsLoadingAudio(true);
      setError(null);
      
      // Call the text-to-speech API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: horoscopeData.horoscope,
          voice: 'carla',
          emotionalContext: 'calming'
        }),
      });

      if (!response.ok) {
        throw new Error('Voice synthesis failed');
      }

      // Handle audio blob directly instead of JSON
      const audioBlob = await response.blob();
      
      if (audioBlob.size > 0) {
        // Create audio from blob URL instead of base64 data URL
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
        
        setIsLoadingAudio(false);
        setIsPlaying(true);
        await audio.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setCurrentAudio(null);
      setError('Voice reading failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-y-auto">
      <div className="min-h-full p-4 py-8">
        <div className="max-w-4xl mx-auto theme-primary/80 backdrop-blur-xl rounded-2xl border border-[#7986cb]/30 shadow-2xl mb-8">
          <div className="sticky top-0 theme-primary/90 backdrop-blur-xl p-6 border-b border-[#7986cb]/20 mb-6">
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
                  className="p-3 rounded-xl theme-primary/60 hover:theme-primary/80 transition-all duration-200 disabled:opacity-50 border border-[#7986cb]/20 hover:border-[#7986cb]/40"
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
          <div className="mb-8">
            <h3 className="text-xl font-light text-white mb-6 tracking-wide text-center">
              ✨ Select Your Zodiac Sign ✨
            </h3>
            <div className="text-white mb-4">Debug: zodiacSigns length = {zodiacSigns.length}</div>
            
            {/* Test buttons to see if grid displays */}
            <div className="mb-4">
              <button className="bg-red-500 text-white p-2 m-2">Test Button 1</button>
              <button className="bg-green-500 text-white p-2 m-2">Test Button 2</button>
              <button className="bg-blue-500 text-white p-2 m-2">Test Button 3</button>
            </div>
            
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
                  {/* Constellation Background */}
                  <ConstellationBackground signName={sign.name} isSelected={selectedSign === sign.name} />
                  
                  {/* Sign Content */}
                  <div className="relative z-10 flex flex-col items-center space-y-3">
                    <div className={`text-3xl transition-all duration-500 ${
                      selectedSign === sign.name ? 'zodiac-emoji selected transform scale-110' : 'zodiac-emoji group-hover:scale-105'
                    }`}>
                      {sign.emoji}
                    </div>
                    <div className={`text-2xl font-bold transition-all duration-400 ${
                      selectedSign === sign.name ? 'text-purple-200 drop-shadow-lg' : 'text-white/90 group-hover:text-purple-200'
                    }`}>
                      {sign.symbol}
                    </div>
                    <div className={`text-sm font-semibold tracking-wider transition-all duration-400 ${
                      selectedSign === sign.name ? 'text-white drop-shadow-md' : 'text-white/85 group-hover:text-white'
                    }`}>
                      {sign.name.charAt(0).toUpperCase() + sign.name.slice(1)}
                    </div>
                    <div className={`text-xs font-medium text-center transition-all duration-400 ${
                      selectedSign === sign.name ? 'text-purple-200/90' : 'text-white/60 group-hover:text-purple-200/80'
                    }`}>
                      {sign.constellation}
                    </div>
                  </div>
                  
                  {/* Enhanced shimmer effect for selected */}
                  {selectedSign === sign.name && (
                    <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-purple-300/20 via-blue-300/15 to-transparent animate-pulse opacity-70"></div>
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    selectedSign === sign.name 
                      ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10' 
                      : 'group-hover:bg-gradient-to-br group-hover:from-purple-500/5 group-hover:to-blue-500/5'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Horoscope Display - Mobile Optimized */}
          <div className="bg-[var(--theme-secondary)] rounded-xl p-4 border border-[#3949ab]/30 max-h-[calc(100vh-400px)] overflow-y-auto mobile-scroll">
            {!selectedSign ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="text-purple-300 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">Choose Your Zodiac Sign</h3>
                <p className="text-white/70 max-w-md">
                  Select your zodiac sign above to receive personalized cosmic guidance and wellness insights tailored to your astrological profile.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Sparkles className="text-purple-300 animate-pulse" size={24} />
                  <span className="text-white">Reading the stars...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-300 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 theme-primary text-white rounded-lg hover:theme-primary transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : horoscopeData ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="text-purple-300" size={20} />
                    <h2 className="text-xl font-bold text-white">
                      {horoscopeData.sign} - {horoscopeData.date}
                    </h2>
                  </div>
                  <button
                    onClick={handleVoiceToggle}
                    disabled={loading || isLoadingAudio}
                    className="p-2 rounded-lg theme-primary/50 hover:theme-primary/70 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    title={isLoadingAudio ? "Loading audio..." : isPlaying ? "Stop reading" : "Read aloud"}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="text-white animate-spin" size={20} />
                    ) : isPlaying ? (
                      <VolumeX className="text-white" size={20} />
                    ) : (
                      <Volume2 className="text-white" size={20} />
                    )}
                    <span className="text-sm text-white hidden sm:inline">
                      {isLoadingAudio ? "Loading..." : isPlaying ? "Stop" : "Listen"}
                    </span>
                  </button>
                </div>
                {/* Full-Screen Content Display */}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Your daily cosmic guidance for wellness and reflection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}