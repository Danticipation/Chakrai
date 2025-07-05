import React, { useState } from 'react';
import Modal from './Modal';
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
            className="dashboard-card cursor-pointer bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
            onClick={() => setIsHoroscopeOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">🔮 Horoscope</h3>
            <p className="text-base opacity-80">Explore your daily zodiac insights with elegance.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-3xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
            onClick={() => setIsAffirmationOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">💖 Affirmation</h3>
            <p className="text-base opacity-80">Empower your mind with today’s affirmation.</p>
          </div>

          <div
            className="dashboard-card cursor-pointer bg-gradient-to-br from-gray-700 to-slate-900 text-white rounded-3xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
            onClick={() => setIsSettingsOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">⚙️ Settings</h3>
            <p className="text-base opacity-80">Tweak your preferences and fine-tune your experience.</p>
          </div>
        </div>
      </div>

      {/* Premium Reusable Modal System */}
      <Modal isOpen={isHoroscopeOpen} onClose={() => setIsHoroscopeOpen(false)} title="Daily Horoscope">
        <HoroscopeModal />
      </Modal>

      <Modal isOpen={isAffirmationOpen} onClose={() => setIsAffirmationOpen(false)} title="Daily Affirmation">
        <Affirmation />
      </Modal>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsModal />
      </Modal>
    </>
  );
}
