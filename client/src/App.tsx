import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const traiLogo = '/TrAI-Logo.png';

interface BotStats {
  level: number;
  stage: string;
  wordsLearned: number;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface Goal {
  id: number;
  name: string;
  current: number;
  target: number;
  color: string;
}

const AppLayout = () => {
  const [activeSection, setActiveSection] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [input, setInput] = useState('');
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<string>('');
  const [showReflection, setShowReflection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [personalityMode, setPersonalityMode] = useState('friend');
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState('carla');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [selectedZodiacSign, setSelectedZodiacSign] = useState('');
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [dailyHoroscope, setDailyHoroscope] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');

  const personalityModes = [
    'friend', 'counsel', 'study', 'diary', 'goal-setting', 'wellness', 'creative'
  ];

  useEffect(() => {
    fetchBotStats();
    fetchDailyAffirmation();
    fetchWeeklySummary();
    loadZodiacData();
  }, []);

  const fetchBotStats = async () => {
    try {
      const response = await fetch('/api/bot-stats');
      if (response.ok) {
        const stats = await response.json();
        setBotStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch bot stats:', error);
    }
  };

  const fetchDailyAffirmation = async () => {
    try {
      const response = await fetch('/api/daily-affirmation');
      if (response.ok) {
        const data = await response.json();
        setDailyAffirmation(data.affirmation || 'Stay positive and focused today.');
      }
    } catch (error) {
      console.error('Failed to fetch daily affirmation:', error);
      setDailyAffirmation('Today is a new opportunity to grow and learn.');
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch('/api/weekly-summary');
      if (response.ok) {
        const data = await response.json();
        setWeeklySummary(data.summary || 'Your therapeutic journey continues to evolve positively.');
      }
    } catch (error) {
      console.error('Failed to fetch weekly summary:', error);
      setWeeklySummary('Focus on your mental wellness and personal growth this week.');
    }
  };

  const loadZodiacData = async () => {
    try {
      const response = await fetch('/api/horoscope/aries');
      if (response.ok) {
        const data = await response.json();
        setDailyHoroscope(data.horoscope || 'Today brings new opportunities for growth.');
        setZodiacSign('aries');
      }
    } catch (error) {
      console.error('Failed to load horoscope:', error);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessageText = input.trim();
    const userMessage: Message = {
      sender: 'user',
      text: userMessageText,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: userMessageText,
        userId: 1
      });
      
      const botResponse = res.data.message || res.data.response || 'No response received';

      const newMessage: Message = {
        sender: 'bot',
        text: botResponse,
        time: getCurrentTime()
      };

      setMessages(prev => [...prev, newMessage]);
      
      // FORCE CARLA VOICE PLAYBACK
      console.log('=== FORCING CARLA VOICE ===');
      console.log('Bot response text:', botResponse.substring(0, 50) + '...');
      
      // Kill all browser TTS
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        speechSynthesis.pause();
      }
      
      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: botResponse,
          voice: 'carla',
          emotionalContext: 'calming'
        })
      });
        
      console.log('Audio response status:', audioResponse.status);
      
      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        console.log('CARLA AUDIO RECEIVED:', { audioUrlExists: !!audioData.audioUrl, audioLength: audioData.audioUrl?.length });
        
        if (audioData.audioUrl) {
          console.log('PLAYING CORRECT CARLA VOICE NOW');
          console.log('Audio URL length:', audioData.audioUrl.length);
          
          // Kill all existing audio completely
          document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            audio.remove();
          });
          
          // Force stop any browser TTS
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            speechSynthesis.pause();
          }
          
          // Create single audio element for Carla
          const carlaAudio = new Audio(audioData.audioUrl);
          carlaAudio.volume = 1.0;
          carlaAudio.preload = 'auto';
          
          // FORCE CARLA AUDIO PLAYBACK NOW
          carlaAudio.play().then(() => {
            console.log('AUTHENTIC CARLA VOICE PLAYING - SUCCESS!');
          }).catch((error) => {
            console.log('Browser autoplay blocked - audio will play on next interaction');
            console.log('CLICK ANYWHERE TO HEAR AUTHENTIC CARLA VOICE');
            
            // Store audio for immediate click playback
            window.pendingCarlaAudio = carlaAudio;
            
            // Global click handler for immediate audio permission
            const playCarlaOnClick = () => {
              if (window.pendingCarlaAudio) {
                window.pendingCarlaAudio.play().then(() => {
                  console.log('AUTHENTIC CARLA VOICE NOW PLAYING!');
                  window.pendingCarlaAudio = null;
                }).catch(err => {
                  console.error('Final Carla playback failed:', err);
                });
              }
              document.removeEventListener('click', playCarlaOnClick);
            };
            
            document.addEventListener('click', playCarlaOnClick, { once: true });
          });
          
        } else {
          console.log('NO AUDIO URL RECEIVED');
        }
      } else {
        console.log('AUDIO REQUEST FAILED:', audioResponse.status);
      }
      
      setBotStats(prev => prev ? {
        ...prev,
        wordsLearned: res.data.wordsLearned || prev.wordsLearned,
        stage: res.data.stage || prev.stage,
        level: res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : 5
      } : null);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I encountered an issue. Please try again.',
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const enableAudio = () => {
    // Disable all browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      speechSynthesis.pause();
    }
    
    // Stop any existing audio elements
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      audio.pause();
      audio.remove();
    });
    
    setAudioEnabled(true);
    console.log('ElevenLabs-only audio enabled, all browser TTS disabled');
    
    if (pendingAudio) {
      const audio = new Audio(pendingAudio);
      audio.play().then(() => {
        console.log('Pending audio playing successfully');
      }).catch(err => {
        console.error('Failed to play pending audio:', err);
      });
      audio.onended = () => {
        URL.revokeObjectURL(pendingAudio);
        setPendingAudio(null);
      };
    }
  };

  const testAudio = async () => {
    try {
      console.log('=== ELEVENLABS AUDIO TEST ===');
      
      // Disable browser TTS completely
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        speechSynthesis.pause();
      }
      
      // Test ElevenLabs API only
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: 'ElevenLabs Carla voice test',
          voice: 'carla'
        })
      });
      
      if (response.ok) {
        const audioData = await response.json();
        console.log('ElevenLabs test response:', audioData.audioUrl ? 'SUCCESS' : 'FAILED');
        
        if (audioData.audioUrl) {
          const audio = new Audio(audioData.audioUrl);
          audio.volume = 1.0;
          
          audio.play().then(() => {
            console.log('ElevenLabs TTS test successful');
            setAudioEnabled(true);
          }).catch(error => {
            console.log('Audio playback blocked:', error);
          });
        }
      }
      
      console.log('=== AUDIO TEST COMPLETE ===');
    } catch (error: any) {
      console.log('Audio test failed:', error.message);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    console.log('Voice recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Voice recording stopped');
  };

  const handleProfileSave = () => {
    if (newUserName.trim()) {
      console.log('Profile updated:', newUserName);
      setMessages([]);
      setNewUserName('');
      setShowSettings(false);
      
      setBotStats({
        level: 1,
        stage: 'Therapist',
        wordsLearned: 1000
      });
    }
  };

  const handleClearMemory = () => {
    setMessages([]);
    setBotStats(null);
    setShowSettings(false);
    console.log('Memory cleared');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70">{message.time}</span>
                    <span className="text-xs opacity-70">{message.time}</span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {pendingAudio && !audioEnabled && (
                <div className="fixed top-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50">
                  <p className="text-sm mb-2">Click to enable audio</p>
                  <button
                    onClick={enableAudio}
                    className="px-4 py-2 bg-white text-purple-600 rounded font-medium hover:bg-gray-100"
                  >
                    Enable Audio
                  </button>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Daily Reflection</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 mb-4">{dailyAffirmation}</p>
              <button
                onClick={() => testAudio()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                🔊 Read Affirmation
              </button>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Progress Tracking</h2>
            
            {botStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{botStats.level}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-400">{botStats.stage}</div>
                  <div className="text-sm text-gray-400">Stage</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-xl font-bold text-purple-400">{botStats.wordsLearned}</div>
                  <div className="text-sm text-gray-400">Words Learned</div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Chat Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{messages.length}</div>
                  <div className="text-sm text-gray-400">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-400">{personalityMode}</div>
                  <div className="text-sm text-gray-400">Mode</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Voice Settings</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Audio Status</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white">Audio Enabled</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                  audioEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {audioEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              {!audioEnabled && (
                <button
                  onClick={enableAudio}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  🔊 Enable Audio
                </button>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Voice Selection</h3>
              <VoiceSelector selectedVoice={selectedReflectionVoice} onVoiceChange={setSelectedReflectionVoice} />
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Test Audio</h3>
              <button
                onClick={testAudio}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                🔊 Test Carla Voice
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Profile</h3>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600 mb-3"
              />
              <button
                onClick={handleProfileSave}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save Profile
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Personality Mode</h3>
              <select
                value={personalityMode}
                onChange={(e) => setPersonalityMode(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              >
                {personalityModes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Data Management</h3>
              <button
                onClick={handleClearMemory}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Clear Memory
              </button>
            </div>
          </div>
        );

      default:
        return <div className="p-4 text-white">Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={traiLogo} alt="TraI Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold">TraI</h1>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-gray-400 hover:text-white"
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Navigation */}
      <div className="bg-gray-800/50 backdrop-blur border-t border-gray-700 p-4">
        <div className="flex justify-around">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'daily', icon: Heart, label: 'Daily' },
            { id: 'voice', icon: Mic, label: 'Voice' },
            { id: 'progress', icon: Target, label: 'Progress' },
            { id: 'settings', icon: User, label: 'Settings' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded transition-colors ${
                activeSection === id ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Enable Button */}
      {!audioEnabled && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            onClick={enableAudio}
            className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2 animate-pulse"
          >
            🔊 CLICK TO ENABLE CARLA VOICE
          </button>
        </div>
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50">
          <OnboardingQuiz 
            onComplete={() => setShowOnboarding(false)} 
          />
        </div>
      )}
    </div>
  );
};

function AppWithOnboarding() {
  // Skip onboarding for now and go directly to main app
  const onboardingStatus = { isComplete: true };
  const onboardingLoading = false;

  // Show main application
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding />
    </QueryClientProvider>
  );
}