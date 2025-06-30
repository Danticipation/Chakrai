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
    <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-none sm:max-w-2xl mx-auto">
        <div className="bg-[#5c6bc0]/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#7986cb]/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Star className="text-purple-300" size={32} />
              <h1 className="text-2xl font-bold text-white">Daily Horoscope</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-[#7986cb]/50 hover:bg-[#7986cb]/70 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`text-white ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>

          {/* Zodiac Sign Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Select Your Sign</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign}
                  onClick={() => handleSignChange(sign)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSign === sign
                      ? 'bg-[#1a237e] text-white shadow-lg border border-purple-400'
                      : 'bg-[#7986cb]/30 text-white hover:bg-[#7986cb]/50'
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
                {/* Mobile-Optimized Content Display */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="text-white text-justify leading-7 space-y-4">
                    {horoscopeData.horoscope.split(/\n\s*\n/).map((paragraph, index) => (
                      paragraph.trim() && (
                        <div key={index} className="text-base font-normal tracking-wide">
                          {paragraph.trim().split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className="mb-2 last:mb-0">
                              {line.trim()}
                            </p>
                          ))}
                        </div>
                      )
                    ))}
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