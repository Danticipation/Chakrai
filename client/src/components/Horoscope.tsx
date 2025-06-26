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
      // Try external horoscope API first
      const response = await fetch(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`);
      
      if (response.ok) {
        const data = await response.json();
        setHoroscopeData({
          sign: sign.charAt(0).toUpperCase() + sign.slice(1),
          horoscope: data.data.horoscope_data,
          date: new Date().toLocaleDateString()
        });
      } else {
        throw new Error('External API failed');
      }
    } catch (apiError) {
      console.log('External horoscope API failed, using fallback...');
      
      // Fallback to OpenAI-generated horoscope
      try {
        const fallbackResponse = await fetch('/api/horoscope', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sign })
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setHoroscopeData({
            sign: sign.charAt(0).toUpperCase() + sign.slice(1),
            horoscope: fallbackData.horoscope,
            date: new Date().toLocaleDateString()
          });
        } else {
          throw new Error('Fallback API failed');
        }
      } catch (fallbackError) {
        console.error('Both horoscope APIs failed:', fallbackError);
        setError('Unable to fetch horoscope. Please try again later.');
      }
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
    <div className="h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6] p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Star className="text-purple-600" size={32} />
              <h1 className="text-2xl font-bold text-purple-800">Daily Horoscope</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`text-purple-600 ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>

          {/* Zodiac Sign Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Select Your Sign</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign}
                  onClick={() => handleSignChange(sign)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSign === sign
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/30 text-purple-700 hover:bg-white/50'
                  }`}
                >
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Horoscope Display */}
          <div className="bg-white/30 rounded-xl p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Sparkles className="text-purple-600 animate-pulse" size={24} />
                  <span className="text-purple-700">Reading the stars...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : horoscopeData ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold text-purple-800">
                    {horoscopeData.sign} - {horoscopeData.date}
                  </h2>
                </div>
                <p className="text-purple-700 leading-relaxed text-lg">
                  {horoscopeData.horoscope}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-purple-600/80">
              Your daily cosmic guidance for wellness and reflection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}