import React, { useState } from 'react';
import { Star, RefreshCw, Loader2 } from 'lucide-react';

interface HoroscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  animate?: boolean;
}

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

export default function HoroscopeModal({ isOpen, onClose, animate }: HoroscopeModalProps) {
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [horoscopeData, setHoroscopeData] = useState<{ sign: string; horoscope: string; date: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Star className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold">Daily Horoscope</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {zodiacSigns.map((sign) => (
            <button
              key={sign.name}
              onClick={() => handleSignChange(sign.name)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedSign === sign.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-2">{sign.emoji}</div>
              <div className="text-lg">{sign.symbol}</div>
              <div className="text-sm capitalize font-medium">{sign.name}</div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center space-x-3 py-8">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-gray-600">Consulting the stars...</span>
          </div>
        )}

        {horoscopeData && !loading && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                {horoscopeData.sign} Horoscope
              </h3>
              <p className="text-blue-600 text-sm">{horoscopeData.date}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-800 leading-relaxed">
                {horoscopeData.horoscope}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}