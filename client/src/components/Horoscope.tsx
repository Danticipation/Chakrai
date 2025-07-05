import React from 'react';

export default function HoroscopeModal({ onClose }: { onClose: () => void }) {
  const zodiacSigns = [
    { name: 'Aries', emoji: '🐏' },
    { name: 'Taurus', emoji: '🐂' },
    { name: 'Gemini', emoji: '👯‍♂️' },
    { name: 'Cancer', emoji: '🦀' },
    { name: 'Leo', emoji: '🦁' },
    { name: 'Virgo', emoji: '👩‍🌾' },
    { name: 'Libra', emoji: '⚖️' },
    { name: 'Scorpio', emoji: '🦂' },
    { name: 'Sagittarius', emoji: '🏹' },
    { name: 'Capricorn', emoji: '🐐' },
    { name: 'Aquarius', emoji: '🏺' },
    { name: 'Pisces', emoji: '🐟' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full p-8 animate-scaleIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl font-extrabold text-center text-white mb-6">✨ Select Your Zodiac Sign ✨</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {zodiacSigns.map((sign) => (
            <div
              key={sign.name}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-purple-600 to-indigo-700 rounded-xl shadow-lg cursor-pointer hover:scale-105 hover:shadow-2xl transition-transform duration-300"
            >
              <span className="text-5xl mb-2">{sign.emoji}</span>
              <span className="text-lg font-semibold text-white tracking-wide">{sign.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
