import React, { useState } from 'react';
import HoroscopeModal from './HoroscopeModal';

export default function Dashboard() {
  const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to TrAI</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Horoscope Button */}
        <button
          onClick={() => setIsHoroscopeOpen(true)}
          className="w-full p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:scale-105 transition"
        >
          🔮 Open Horoscope
        </button>
        {/* Other dashboard cards/buttons can go here */}
      </div>

      {/* Horoscope Modal */}
      <HoroscopeModal
        isOpen={isHoroscopeOpen}
        onClose={() => setIsHoroscopeOpen(false)}
      />
    </div>
  );
}
