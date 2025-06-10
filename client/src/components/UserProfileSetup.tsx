import { useState } from 'react';
import axios from 'axios';

interface UserProfileSetupProps {
  onComplete: () => void;
}

export default function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/user/initialize', {
        name: name.trim(),
        interests: interests.trim(),
        preferences: preferences.trim()
      });
      onComplete();
    } catch (error) {
      setError('Could not create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-900">
      <div className="w-full max-w-md bg-zinc-800 rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Reflectibot
          </h1>
          <p className="text-zinc-400">
            Let's personalize your AI companion experience
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
              Your Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 rounded bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-zinc-300 mb-2">
              Your Interests
            </label>
            <textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., technology, music, cooking, sports..."
              className="w-full p-3 rounded bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="preferences" className="block text-sm font-medium text-zinc-300 mb-2">
              Chat Preferences
            </label>
            <textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., casual conversation, technical details, encouraging tone..."
              className="w-full p-3 rounded bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Start Chatting'}
          </button>
        </form>
      </div>
    </div>
  );
}