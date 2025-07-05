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
            className="dashboard-card cursor-pointer bg-blue-700 text-white rounded-xl p-6 hover:scale-105 transition-transform"
            onClick={() => setIsHoroscopeOpen(true)}
          >
            <h3 className="text-xl font-bold mb-2">Horoscope</h3>
            <p className="text-sm">Tap here to open your daily horoscope in a floating window.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-green-700 text-white rounded-xl p-6 hover:scale-105 transition-transform"
            onClick={() => setIsAffirmationOpen(true)}
          >
            <h3 className="text-xl font-bold mb-2">Affirmation</h3>
            <p className="text-sm">Tap here to see today’s affirmation in a floating window.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-gray-700 text-white rounded-xl p-6 hover:scale-105 transition-transform"
            onClick={() => setIsSettingsOpen(true)}
          >
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-sm">Tap here to adjust your preferences and account settings.</p>
          </div>
        </div>
      </div>

      {/* Fully Functional Modals with Smooth Transitions */}
      <HoroscopeModal isOpen={isHoroscopeOpen} onClose={() => setIsHoroscopeOpen(false)} animate />
      <Affirmation isOpen={isAffirmationOpen} onClose={() => setIsAffirmationOpen(false)} animate />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} animate />
    </>
  );
}