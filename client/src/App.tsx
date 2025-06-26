import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart, BarChart3, Gift, Headphones, Shield } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';
import TherapeuticJournal from './components/TherapeuticJournal';
import PersonalityReflection from './components/PersonalityReflection';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import WellnessRewards from './components/WellnessRewards';
import CommunitySupport from './components/CommunitySupport';
import AdaptiveLearning from './components/AdaptiveLearning';
import VRTherapy from './components/VRTherapy';
import HealthIntegration from './components/HealthIntegration';
import PrivacyCompliance from './components/PrivacyCompliance';
import Horoscope from './components/Horoscope';
import DailyAffirmation from './components/DailyAffirmation';

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
  const [userQuery, setUserQuery] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('carla');
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState('carla');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState('Today is a new opportunity for growth and healing.');
  const [horoscopeText, setHoroscopeText] = useState<string>('');
  const [userZodiacSign, setUserZodiacSign] = useState<string>('aries');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get('/api/user/current');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    fetchBotStats();
    fetchDailyAffirmation();
    fetchHoroscope();
    fetchWeeklySummary();
    loadZodiacData();
    
    if (user && user.hasCompletedOnboarding) {
      // User is onboarded, proceed with app
    } else {
      setShowOnboarding(true);
    }
  }, [user]);

  const fetchBotStats = async () => {
    try {
      const response = await fetch('/api/bot-stats');
      if (response.ok) {
        const data = await response.json();
        setBotStats(data);
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

  const fetchHoroscope = async (sign: string = userZodiacSign) => {
    // Skip external API due to CORS restrictions, use OpenAI-generated horoscope directly
    try {
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sign })
      });

      if (response.ok) {
        const data = await response.json();
        setHoroscopeText(data.horoscope);
      } else {
        setHoroscopeText('Your stars are aligning for a day of growth and positive energy.');
      }
    } catch (error) {
      setHoroscopeText('Today brings opportunities for reflection and personal development.');
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
        setWeeklySummary(data.horoscope || 'Today brings new opportunities for growth.');
      }
    } catch (error) {
      console.error('Failed to load horoscope:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          voice: selectedVoice
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          sender: 'bot',
          text: data.message,
          time: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, botMessage]);

        // ElevenLabs Carla voice playback with aggressive activation
        if (data.audioUrl && data.audioUrl.length > 1000) {
          console.log(`ElevenLabs ${data.voiceUsed || 'Carla'} voice detected: ${data.audioUrl.length} characters`);
          
          const playElevenLabsAudio = async () => {
            try {
              // Create audio with proper MIME type
              const audioBlob = new Blob([
                Uint8Array.from(atob(data.audioUrl), c => c.charCodeAt(0))
              ], { type: 'audio/mpeg' });
              
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              // Configure audio for immediate playback
              audio.preload = 'auto';
              audio.volume = 0.8;
              
              // Play with multiple fallback attempts
              try {
                await audio.play();
                console.log('✓ ElevenLabs Carla voice played successfully');
                
                // Cleanup URL after playing
                audio.addEventListener('ended', () => {
                  URL.revokeObjectURL(audioUrl);
                });
                
              } catch (playError) {
                console.log('Direct play blocked, setting up click trigger...');
                
                // Show user that audio is ready
                const audioReadyMessage = {
                  sender: 'bot' as const,
                  text: '🔊 Audio ready - click anywhere to hear Carla voice',
                  time: new Date().toLocaleTimeString()
                };
                setMessages(prev => [...prev, audioReadyMessage]);
                
                // Single click anywhere triggers audio
                const playOnClick = async () => {
                  try {
                    await audio.play();
                    console.log('✓ ElevenLabs Carla voice played after user interaction');
                    
                    // Remove the audio ready message
                    setMessages(prev => prev.filter(msg => msg.text !== audioReadyMessage.text));
                    
                  } catch (err) {
                    console.error('Audio play failed even with user gesture:', err);
                  }
                  
                  document.removeEventListener('click', playOnClick);
                  URL.revokeObjectURL(audioUrl);
                };
                
                document.addEventListener('click', playOnClick, { once: true });
              }
              
            } catch (error) {
              console.error('ElevenLabs audio processing failed:', error);
            }
          };
          
          // Execute audio playback
          playElevenLabsAudio();
          
        } else {
          console.log('No ElevenLabs audio received or audio data too short');
          if (data.error) {
            console.error('Server audio error:', data.error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setInput(data.text || '');
      } else {
        console.error('Transcription failed');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'daily':
        return <PersonalityReflection userId={1} />;

      case 'chat':
        return (
          <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-lg">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-white/70 py-12">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-semibold text-white mb-2">Welcome to TraI</h3>
                  <p className="text-white/80">Your therapeutic companion for mental wellness and self-reflection</p>
                  <p className="text-sm text-white/60 mt-2">Start sharing your thoughts below</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className="text-xs mt-2 opacity-70">{message.time}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-sm text-white max-w-md px-4 py-3 rounded-2xl border border-white/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/20">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-white/50 focus:outline-none"
                  disabled={loading}
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-3 rounded-xl transition-colors ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-[#5c6bc0] hover:bg-[#7986cb] text-white'
                  }`}
                  disabled={loading}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-xl text-white transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'journal':
        return (
          <TherapeuticJournal 
            userId={1} 
            onEntryCreated={(entry) => {
              console.log('New journal entry created:', entry);
            }}
          />
        );

      case 'memory':
        return <MemoryDashboard />;

      case 'analytics':
        return <AnalyticsDashboard userId={1} />;

      case 'rewards':
        return <WellnessRewards />;

      case 'community':
        return <CommunitySupport />;

      case 'adaptive':
        return <AdaptiveLearning />;

      case 'vr':
        return <VRTherapy />;

      case 'health':
        return <HealthIntegration />;

      case 'privacy':
        return <PrivacyCompliance />;

      case 'horoscope':
        return <Horoscope />;

      case 'affirmation':
        return <DailyAffirmation />;

      case 'goals':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wellness Goals</h2>
            <div className="space-y-4">
              {[
                { name: 'Daily Mindfulness', current: 12, target: 21, color: 'bg-green-500' },
                { name: 'Anxiety Management', current: 8, target: 14, color: 'bg-blue-500' },
                { name: 'Social Connection', current: 3, target: 7, color: 'bg-purple-500' }
              ].map((goal, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                    <span className="text-sm text-gray-600">{goal.current}/{goal.target} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${goal.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
            <p className="text-gray-600">Select a section to get started</p>
          </div>
        );
    }
  };

  const onOnboardingComplete = () => {
    console.log('Onboarding completed');
  };

  const handleCompleteOnboarding = () => {
    onOnboardingComplete();
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
        <OnboardingQuiz onComplete={handleCompleteOnboarding} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex">
      {/* Left Sidebar Navigation */}
      <div className="w-20 bg-[#1a237e] flex flex-col items-center py-4 space-y-4">
        {/* Logo */}
        <div className="mb-4">
          <img src={traiLogo} alt="TrAI" className="w-10 h-10" />
        </div>
        
        {/* Navigation Tabs */}
        {[
          { id: 'chat', icon: MessageCircle, label: 'Chat' },
          { id: 'daily', icon: Brain, label: 'Reflection' },
          { id: 'journal', icon: BookOpen, label: 'Journal' },
          { id: 'memory', icon: Brain, label: 'Memory' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'rewards', icon: Gift, label: 'Rewards' },
          { id: 'community', icon: User, label: 'Community' },
          { id: 'adaptive', icon: Star, label: 'AI Learning' },
          { id: 'vr', icon: Headphones, label: 'VR Therapy' },
          { id: 'health', icon: Heart, label: 'Health' },
          { id: 'privacy', icon: Shield, label: 'Privacy' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeSection === tab.id
                ? 'bg-[#7986cb] text-white'
                : 'text-white/70 hover:text-white hover:bg-[#3949ab]/30'
            }`}
            title={tab.label}
          >
            <tab.icon size={20} />
          </button>
        ))}
        
        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-[#3949ab]/30 transition-colors mt-auto"
          title="Settings"
        >
          <User size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-[#1a237e] p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">TrAI</h1>
          {botStats && (
            <div className="text-sm text-white/80">
              {botStats.stage} • Level {botStats.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#3949ab] p-4">
          <div className="bg-[#5c6bc0] rounded-lg h-full p-4">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a237e] rounded-2xl p-6 w-full max-w-md border border-[#3949ab]/30">
            <h3 className="text-lg font-semibold mb-4 text-white">Settings</h3>
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-[#7986cb] text-white rounded-lg hover:bg-[#9fa8da] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppWithOnboarding = () => {
  return <AppLayout />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding />
    </QueryClientProvider>
  );
}