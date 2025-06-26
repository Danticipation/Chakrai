import React, { useState, useEffect } from 'react';
import { Star, Sparkles, RefreshCw } from 'lucide-react';

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

  return (
    <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#5c6bc0]/30 backdrop-blur-sm rounded-2xl p-6 border border-[#7986cb]/30 shadow-lg">
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

          {/* Horoscope Display */}
          <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30">
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
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="text-purple-300" size={20} />
                  <h2 className="text-xl font-bold text-white">
                    {horoscopeData.sign} - {horoscopeData.date}
                  </h2>
                </div>
                <p className="text-white/90 leading-relaxed text-lg">
                  {horoscopeData.horoscope}
                </p>
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