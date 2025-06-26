import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface AffirmationData {
  affirmation: string;
  category: string;
  date: string;
}

export default function DailyAffirmation() {
  const [affirmationData, setAffirmationData] = useState<AffirmationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchDailyAffirmation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/daily-affirmation');
      
      if (response.ok) {
        const data = await response.json();
        setAffirmationData({
          affirmation: data.affirmation,
          category: data.category || 'Daily Inspiration',
          date: new Date().toLocaleDateString()
        });
      } else {
        throw new Error('Failed to fetch affirmation');
      }
    } catch (fetchError) {
      console.error('Failed to fetch daily affirmation:', fetchError);
      setError('Unable to fetch daily affirmation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const playAffirmationAudio = async () => {
    if (!affirmationData || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: affirmationData.affirmation,
          voice: 'carla'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.audio && data.audio.length > 10000) {
          // ElevenLabs audio detected
          const audioBlob = new Blob([
            new Uint8Array(atob(data.audio).split('').map(c => c.charCodeAt(0)))
          ], { type: 'audio/mpeg' });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          });
          
          await audio.play();
        }
      }
    } catch (error) {
      console.error('Failed to play affirmation audio:', error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    fetchDailyAffirmation();
  }, []);

  const handleRefresh = () => {
    fetchDailyAffirmation();
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#5c6bc0]/30 backdrop-blur-sm rounded-2xl p-6 border border-[#7986cb]/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Heart className="text-green-300" size={32} />
              <h1 className="text-2xl font-bold text-white">Daily Affirmation</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-[#7986cb]/50 hover:bg-[#7986cb]/70 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`text-white ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>

          {/* Affirmation Display */}
          <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Heart className="text-green-300 animate-pulse" size={24} />
                  <span className="text-white">Loading your daily inspiration...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-300 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#3949ab] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : affirmationData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-green-300" size={20} />
                    <h2 className="text-lg font-semibold text-white">
                      {affirmationData.category} - {affirmationData.date}
                    </h2>
                  </div>
                  <button
                    onClick={playAffirmationAudio}
                    disabled={isPlaying}
                    className="p-2 rounded-lg bg-[#7986cb]/50 hover:bg-[#7986cb]/70 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <VolumeX className="text-white" size={20} />
                    ) : (
                      <Volume2 className="text-white" size={20} />
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-white/90 leading-relaxed text-xl font-medium italic">
                    "{affirmationData.affirmation}"
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Start your day with positive energy and self-compassion
            </p>
          </div>

          {/* Affirmation Tips */}
          <div className="mt-6 bg-[#5c6bc0]/30 rounded-xl p-4 border border-[#7986cb]/30">
            <h3 className="text-lg font-semibold text-white mb-3">How to Use Your Affirmation</h3>
            <ul className="text-sm text-white/80 space-y-2">
              <li>• Read it slowly and mindfully</li>
              <li>• Repeat it three times with intention</li>
              <li>• Listen to the audio for deeper connection</li>
              <li>• Carry this message with you throughout the day</li>
              <li>• Return to it when you need encouragement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}