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

export default function Horoscope() {
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
    <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1e293b]/40 backdrop-blur-xl rounded-2xl p-8 border border-[#7986cb]/20 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-[#3f51b5] to-[#5c6bc0] shadow-lg">
                <Star className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-light text-white tracking-wide">Daily Horoscope</h1>
                <p className="text-white/60 text-sm mt-1">Cosmic guidance for your wellness journey</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 rounded-xl bg-[#1e293b]/60 hover:bg-[#1e293b]/80 transition-all duration-200 disabled:opacity-50 border border-[#7986cb]/20 hover:border-[#7986cb]/40"
            >
              <RefreshCw className={`text-white ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
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
                      : 'bg-[#1e293b]/60 text-white/80 hover:bg-[#1e293b]/80 hover:text-white border border-[#7986cb]/20 hover:border-[#7986cb]/40'
                  }`}
                >
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Horoscope Display - Enhanced for Full Content */}
          <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30 min-h-[400px] max-h-[600px] overflow-y-auto">
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
                  className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#3949ab] transition-colors"
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
                    className="p-2 rounded-lg bg-[#7986cb]/50 hover:bg-[#7986cb]/70 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
                {/* Professional Content Display */}
                <div className="bg-gradient-to-br from-[#3f51b5]/20 to-[#5c6bc0]/20 rounded-lg border border-[#7986cb]/30 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white/95 text-base leading-relaxed font-light tracking-wide space-y-4">
                        {horoscopeData.horoscope.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                          <p key={index} className="text-white/90 leading-7 mb-4 last:mb-0">
                            {paragraph.trim()}
                          </p>
                        ))}
                      </div>
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