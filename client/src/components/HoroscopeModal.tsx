import React, { useState } from 'react';
import { Star, RefreshCw, Loader2 } from 'lucide-react';

const zodiacSigns = [
  { name: 'aries', symbol: '♈', emoji: '🐏' },
  { name: 'taurus', symbol: '♉', emoji: '🐂' },
  { name: 'gemini', symbol: '♊', emoji: '👯' },
  { name: 'cancer', symbol: '♋', emoji: '🦀' },
  { name: 'leo', symbol: '♌', emoji: '🦁' },
  { name: 'virgo', symbol: '♍', emoji: '👩' },
  { name: 'libra', symbol: '♎', emoji: '⚖️' },
  { name: 'scorpio', symbol: '♏', emoji: '🦂' },
  { name: 'sagittarius', symbol: '♐', emoji: '🏹' },
  { name: 'capricorn', symbol: '♑', emoji: '🐐' },
  { name: 'aquarius', symbol: '♒', emoji: '🏺' },
  { name: 'pisces', symbol: '♓', emoji: '🐟' }
];

export default function HoroscopeModal() {
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [horoscopeData, setHoroscopeData] = useState<{ sign: string; horoscope: string; date: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/horoscope/${sign}`);
      if (response.ok) {
        const data = await response.json();
        setHoroscopeData({
          sign: sign.charAt(0).toUpperCase() + sign.slice(1),
          horoscope: data.horoscope,
          date: new Date().toLocaleDateString()
        });
      }
    } catch (error) {
      console.error('Error fetching horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignChange = (sign: string) => {
    setSelectedSign(sign);
    fetchHoroscope(sign);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {zodiacSigns.map((sign) => (
          <button
            key={sign.name}
            onClick={() => handleSignChange(sign.name)}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              selectedSign === sign.name
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-400'
            }`}
          >
            <div className="text-2xl mb-2">{sign.emoji}</div>
            <div className="text-lg">{sign.symbol}</div>
            <div className="text-sm capitalize font-medium text-gray-700 dark:text-gray-300">{sign.name}</div>
          </button>
        ))}
      </div>

      {!selectedSign && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-4">
          <Star className="mx-auto mb-2 text-blue-600" size={32} />
          <p>Choose Your Zodiac Sign</p>
          <p className="text-sm">Select your sign to receive personalized cosmic guidance</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center space-x-3 py-8">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600 dark:text-gray-400">Consulting the stars...</span>
        </div>
      )}

      {horoscopeData && !loading && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              {horoscopeData.sign} Horoscope
            </h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm">{horoscopeData.date}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {horoscopeData.horoscope}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}