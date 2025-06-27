import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

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
  onClose?: () => void;
}

export default function VoiceSelector({ selectedVoice, onVoiceChange, onClose }: VoiceSelectorProps) {
  console.log('VoiceSelector rendered with onClose:', !!onClose);
  
  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 relative">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-50 shadow-lg border-2 border-white"
          aria-label="Close voice selection"
          style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 9999 }}
        >
          <X size={20} />
        </button>
      )}
      
      <h2 className="text-2xl font-bold text-white mb-4">Voice Selection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`p-4 rounded-xl border transition-all duration-200 text-left relative ${
              selectedVoice === voice.id
                ? 'bg-blue-500/30 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
            }`}
          >
            {selectedVoice === voice.id && (
              <div className="absolute top-2 right-2">
                <Check size={16} className="text-blue-400" />
              </div>
            )}
            <h3 className="font-semibold mb-1">{voice.name}</h3>
            <p className="text-sm opacity-80">{voice.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}