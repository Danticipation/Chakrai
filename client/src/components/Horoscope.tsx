import React, { useState, useEffect } from 'react';
import { Star, Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface HoroscopeData {
  sign: string;
  horoscope: string;
  date: string;
}

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

interface HoroscopeProps {
  onBack?: () => void;
}

export default function Horoscope({ onBack }: HoroscopeProps) {
  const [selectedSign, setSelectedSign] = useState<string>('aries');
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct GET endpoint with sign as parameter
      const response = await fetch(`/api/horoscope/${sign}`);

      if (response.ok) {
        const data = await response.json();
        setHoroscopeData({
          sign: sign.charAt(0).toUpperCase() + sign.slice(1),
          horoscope: data.horoscope,
          date: new Date().toLocaleDateString()
        });
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.error('Horoscope API failed:', error);
      setError('Unable to fetch horoscope. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope(selectedSign);
  }, [selectedSign]);

  const handleSignChange = (sign: string) => {
    setSelectedSign(sign);
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
      setIsPlaying(true);
      
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
        
        await audio.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
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

          {/* Professional Zodiac Sign Selector */}
          <div className="mb-8">
            <h3 className="text-xl font-light text-white mb-4 tracking-wide">Select Your Zodiac Sign</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign}
                  onClick={() => handleSignChange(sign)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedSign === sign
                      ? 'bg-gradient-to-r from-[#3f51b5] to-[#5c6bc0] text-white shadow-lg border border-[#7986cb]/50 scale-105'
                      : 'theme-primary/60 text-white/80 hover:theme-primary/80 hover:text-white border border-[#7986cb]/20 hover:border-[#7986cb]/40'
                  }`}
                >
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Horoscope Display - Mobile Optimized */}
          <div className="bg-[var(--theme-secondary)] rounded-xl p-4 border border-[#3949ab]/30 max-h-[calc(100vh-400px)] overflow-y-auto mobile-scroll">
            {loading ? (
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
                    disabled={loading}
                    className="p-2 rounded-lg theme-primary/50 hover:theme-primary/70 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    title={isPlaying ? "Stop reading" : "Read aloud"}
                  >
                    {isPlaying ? (
                      <VolumeX className="text-white" size={20} />
                    ) : (
                      <Volume2 className="text-white" size={20} />
                    )}
                    <span className="text-sm text-white hidden sm:inline">
                      {isPlaying ? "Stop" : "Listen"}
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