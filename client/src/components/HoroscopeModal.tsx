import React, { useState } from 'react';

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

  const [selectedSign, setSelectedSign] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const fetchHoroscope = async (sign: string) => {
    setSelectedSign(sign);
    setLoading(true);
    setError('');
    setHoroscope('');
    try {
      const res = await fetch(`/api/horoscope/${sign.toLowerCase()}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setHoroscope(data.horoscope);
    } catch (err) {
      setError('Could not load horoscope. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!horoscope) return;
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: horoscope, voice: 'carla', emotionalContext: 'calm' })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audioEl = new Audio(url);
      audioEl.play();
      setAudio(audioEl);
    } catch (err) {
      setError('Audio playback failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md overflow-y-auto p-4">
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 text-white animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl"
          onClick={() => {
            if (audio) audio.pause();
            onClose();
          }}
          aria-label="Close"
        >×</button>
        <h2 className="text-4xl font-bold text-center mb-6">🔮 Your Daily Horoscope</h2>
        <p className="text-center text-lg mb-8">Select your zodiac sign to see today’s insights.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {zodiacSigns.map((sign) => (
            <div
              key={sign.name}
              onClick={() => fetchHoroscope(sign.name)}
              className={`p-4 rounded-xl cursor-pointer text-center bg-gradient-to-tr from-purple-700 to-indigo-800 hover:scale-105 transition-transform ${selectedSign === sign.name ? 'ring-4 ring-purple-500 scale-105' : ''}`}
            >
              <div className="text-5xl mb-2">{sign.emoji}</div>
              <div className="font-semibold text-lg">{sign.name}</div>
            </div>
          ))}
        </div>

        {loading && <p className="text-center text-lg">Loading horoscope...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        {horoscope && (
          <div className="bg-gray-800 bg-opacity-70 p-6 rounded-xl shadow-inner mt-6">
            <p className="whitespace-pre-line leading-relaxed mb-4">{horoscope}</p>
            <div className="flex justify-center">
              <button
                onClick={playAudio}
                className="px-5 py-2 bg-purple-700 rounded-full hover:bg-purple-800 transition-colors"
              >🔊 Listen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
