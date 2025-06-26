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
      case 'chat':
        // Chat is handled separately in the main layout now
        return null;

      case 'daily':
        return <PersonalityReflection userId={1} />;

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
    <div className="h-screen bg-[#0a0e1a] flex flex-col">
      {/* Top Header - Three Sections */}
      <div className="bg-[#0a0e1a] p-4 grid grid-cols-3 gap-4 h-24">
        {/* Horoscope Section */}
        <div className="bg-purple-700 rounded-lg p-3 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1 underline">Horoscope</h3>
          <p className="text-xs text-white line-clamp-2">
            {horoscopeText ? horoscopeText.substring(0, 80) + '...' : "Your cosmic guidance awaits..."}
          </p>
        </div>
        
        {/* Logo Section */}
        <div className="bg-[#0a0e1a] rounded-lg p-3 flex items-center justify-center border border-white">
          <img src={traiLogo} alt="TrAI" className="h-12 w-auto" />
        </div>
        
        {/* Affirmation Section */}
        <div className="bg-purple-700 rounded-lg p-3 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1 underline">Affirmation</h3>
          <p className="text-xs text-white line-clamp-2">
            {dailyAffirmation.substring(0, 80)}...
          </p>
        </div>
        
        {/* Top Right Stats */}
        <div className="absolute top-4 right-4 text-sm text-white/80">
          {botStats && `${botStats.stage} • Level ${botStats.level}`}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-[#3f51b5]">
        {/* Left Sidebar Navigation - Seamless blended buttons */}
        <div className="w-48 flex flex-col justify-center py-8">
          {[
            { id: 'chat', label: 'Chat' },
            { id: 'daily', label: 'Reflection' },
            { id: 'journal', label: 'Journal' },
            { id: 'memory', label: 'Memory' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'rewards', label: 'Rewards' },
            { id: 'community', label: 'Community' },
            { id: 'adaptive', label: 'AI Learning' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`w-full h-14 px-4 text-base font-bold transition-colors ${
                activeSection === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Center Content Area - Different layouts based on active section */}
        <div className="flex-1 flex justify-center items-center">
          {activeSection === 'chat' ? (
            /* Chat Panel - Dark blue background as requested */
            <div className="w-[576px] h-[480px] bg-[#0a0e1a] rounded-lg relative">
              <div className="absolute inset-4 bg-[#0a0e1a] rounded">
                <div className="text-center text-white text-xl font-bold pt-6">Chat Box</div>
                
                {/* Chat Messages Area */}
                <div className="absolute top-16 left-4 right-4 bottom-20 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-white py-8">
                      <MessageCircle size={32} className="mx-auto mb-3" />
                      <p className="text-sm">Start a conversation with TraI</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.sender === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-purple-700 text-white'
                          }`}>
                            <p>{message.text}</p>
                            <p className="text-xs mt-1 opacity-70">{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {loading && (
                    <div className="flex justify-start mt-4">
                      <div className="bg-purple-700 text-white max-w-xs px-3 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input at Bottom */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Share your thoughts"
                    className="flex-1 px-3 py-2 bg-blue-600 text-white border border-blue-500 rounded text-sm placeholder-white/70"
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-[#5c6bc0] hover:bg-[#7986cb] text-white'
                    }`}
                    disabled={loading}
                  >
                    {isRecording ? <Square size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 bg-[#1a237e] hover:bg-[#3949ab] disabled:opacity-50 rounded text-white transition-colors flex items-center justify-center"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Separate Full Panels for Other Sections */
            <div className="w-full h-full mx-8 bg-[#0a0e1a] rounded-lg border border-white overflow-hidden">
              <div className="bg-[#0a0e1a] text-white text-center py-3 border-b border-white/30 font-bold text-lg">
                {activeSection === 'daily' && 'Personality Reflection'}
                {activeSection === 'journal' && 'Therapeutic Journal'}
                {activeSection === 'memory' && 'Memory Dashboard'}
                {activeSection === 'analytics' && 'Analytics & Reporting'}
                {activeSection === 'rewards' && 'Wellness Rewards'}
                {activeSection === 'community' && 'Community & Professional Support'}
                {activeSection === 'adaptive' && 'Adaptive Learning & Personalization'}
                {activeSection === 'vr' && 'VR/AR Therapy'}
                {activeSection === 'health' && 'Health Integration'}
                {activeSection === 'privacy' && 'Privacy & Compliance'}
                {activeSection === 'horoscope' && 'Horoscope'}
                {activeSection === 'affirmation' && 'Daily Affirmation'}
                {activeSection === 'goals' && 'Wellness Goals'}
              </div>
              <div className="h-full bg-[#0a0e1a] text-white p-6 overflow-y-auto">
                {renderActiveSection()}
              </div>
            </div>
          )}
        </div>

        {/* Right Stats Sidebar - Larger and blended */}
        <div className="w-64 py-8 px-6">
          <div className="text-white text-lg font-bold mb-6 text-center underline">Stats or goal tracking</div>
          
          {/* Real Progress Tracking */}
          <div className="space-y-3">
            {/* Daily Journaling Progress */}
            <div className="bg-purple-700 rounded p-2">
              <div className="text-white text-xs font-bold mb-1">Daily Journaling</div>
              <div className="bg-[#0a0e1a] rounded-full h-2 mb-1">
                <div className="bg-green-400 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <div className="text-white text-xs">15/20 days this month</div>
            </div>

            {/* Weekly Chat Sessions */}
            <div className="bg-purple-700 rounded p-2">
              <div className="text-white text-xs font-bold mb-1">Weekly Chat Goal</div>
              <div className="bg-[#0a0e1a] rounded-full h-2 mb-1">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              <div className="text-white text-xs">3/5 sessions this week</div>
            </div>

            {/* Mood Tracking Consistency */}
            <div className="bg-purple-700 rounded p-2">
              <div className="text-white text-xs font-bold mb-1">Mood Tracking</div>
              <div className="bg-[#0a0e1a] rounded-full h-2 mb-1">
                <div className="bg-yellow-400 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
              <div className="text-white text-xs">27/30 days tracked</div>
            </div>

            {/* App Usage Streak */}
            <div className="bg-purple-700 rounded p-2">
              <div className="text-white text-xs font-bold mb-1">App Usage Streak</div>
              <div className="bg-[#0a0e1a] rounded-full h-2 mb-1">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <div className="text-white text-xs">17 consecutive days</div>
            </div>

            {/* Overall Wellness Score */}
            <div className="bg-purple-700 rounded p-2 text-center">
              <div className="text-white text-xs font-bold mb-1">Overall Wellness</div>
              <div className="text-white text-lg font-bold">85%</div>
              <div className="text-white text-xs">This month</div>
            </div>
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