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
    <div className="h-full bg-gradient-to-br from-[#98FB98] to-[#E6E6FA] p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Heart className="text-green-600" size={32} />
              <h1 className="text-2xl font-bold text-green-800">Daily Affirmation</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`text-green-600 ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>

          {/* Affirmation Display */}
          <div className="bg-white/30 rounded-xl p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Heart className="text-green-600 animate-pulse" size={24} />
                  <span className="text-green-700">Loading your daily inspiration...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : affirmationData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-green-600" size={20} />
                    <h2 className="text-lg font-semibold text-green-800">
                      {affirmationData.category} - {affirmationData.date}
                    </h2>
                  </div>
                  <button
                    onClick={playAffirmationAudio}
                    disabled={isPlaying}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <VolumeX className="text-green-600" size={20} />
                    ) : (
                      <Volume2 className="text-green-600" size={20} />
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-green-700 leading-relaxed text-xl font-medium italic">
                    "{affirmationData.affirmation}"
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-green-600/80">
              Start your day with positive energy and self-compassion
            </p>
          </div>

          {/* Affirmation Tips */}
          <div className="mt-6 bg-white/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">How to Use Your Affirmation</h3>
            <ul className="text-sm text-green-700 space-y-2">
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