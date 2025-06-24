import React, { useState } from 'react';

interface Voice {
  id: string;
  name: string;
  description: string;
}

const voices: Voice[] = [
  { id: 'james', name: 'James', description: 'Warm and supportive' },
  { id: 'brian', name: 'Brian', description: 'Calm and professional' },
  { id: 'alexandra', name: 'Alexandra', description: 'Gentle and understanding' },
  { id: 'carla', name: 'Carla', description: 'Energetic and encouraging' }
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

export default function VoiceSelector({ selectedVoice, onVoiceChange }: VoiceSelectorProps) {
  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">Voice Selection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`p-4 rounded-xl border transition-colors text-left ${
              selectedVoice === voice.id
                ? 'bg-blue-500/20 border-blue-300/50 text-white'
                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
            }`}
          >
            <h3 className="font-semibold mb-1">{voice.name}</h3>
            <p className="text-sm opacity-80">{voice.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}