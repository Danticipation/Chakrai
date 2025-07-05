import React, { useState } from 'react';
import HoroscopeModal from './HoroscopeModal';
import Affirmation from './Affirmation';
import SettingsModal from './SettingsModal';

export default function Dashboard() {
  const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);
  const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="dashboard p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            className="dashboard-card cursor-pointer bg-gradient-to-r from-purple-700 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            onClick={() => setIsHoroscopeOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">✨ Horoscope</h3>
            <p className="text-sm opacity-80">Discover your daily zodiac insights.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            onClick={() => setIsAffirmationOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">💖 Affirmation</h3>
            <p className="text-sm opacity-80">Start your day with positive energy.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-gradient-to-r from-gray-700 to-slate-800 text-white rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            onClick={() => setIsSettingsOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">⚙️ Settings</h3>
            <p className="text-sm opacity-80">Adjust your preferences and account.</p>
          </div>
        </div>
      </div>

      {/* Premium Modals */}
      <HoroscopeModal isOpen={isHoroscopeOpen} onClose={() => setIsHoroscopeOpen(false)} animate />
      <Affirmation isOpen={isAffirmationOpen} onClose={() => setIsAffirmationOpen(false)} animate />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} animate />
    </>
  );
}