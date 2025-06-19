import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';
// Use the actual TrAI logo from public directory
const traiLogo = '/TrAI-Logo.png';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
  const [showMemory, setShowMemory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [personalityMode, setPersonalityMode] = useState<string>('friend');

  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState<string>('EkK5I93UQWFDigLMpZcX'); // James - default voice
  const [dailyAffirmation, setDailyAffirmation] = useState<string>('');
  const [dailyHoroscope, setDailyHoroscope] = useState<string>('');
  const [zodiacSign, setZodiacSign] = useState<string>('');
  const [selectedZodiacSign, setSelectedZodiacSign] = useState<string>('');
  const [dailyReflection, setDailyReflection] = useState<string>('Your reflection will appear here as you interact with your TrAI.');
  
  // Goal tracking state
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, name: 'Daily Chat Goal', current: 7, target: 10, color: 'blue' },
    { id: 2, name: 'Weekly Reflection', current: 4, target: 7, color: 'green' },
    { id: 3, name: 'Voice Practice', current: 12, target: 15, color: 'purple' }
  ]);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sections = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'daily', icon: Sun, label: 'Daily' },
    { id: 'reflect', icon: Brain, label: 'Reflect' },
    { id: 'memory', icon: BookOpen, label: 'Memory' },
    { id: 'progress', icon: Target, label: 'Progress' },
    { id: 'voice', icon: Mic, label: 'Voice' },
    { id: 'settings', icon: User, label: 'Settings' }
  ];

  const voiceOptions = [
    { id: 'EkK5I93UQWFDigLMpZcX', name: 'James', description: 'Professional male voice', gender: 'Male', default: true },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Deep, resonant male voice', gender: 'Male' },
    { id: 'kdmDKE6EkgrWrrykO9Qt', name: 'Alexandra', description: 'Clear female voice', gender: 'Female' },
    { id: 'l32B8XDoylOsZKiSdfhE', name: 'Carla', description: 'Warm female voice', gender: 'Female' }
  ];

  const personalityModes = [
    { id: 'friend', name: 'Friend Mode', emoji: '😊', description: 'Casual conversation and friendly banter' },
    { id: 'counsel', name: 'Counsel Mode', emoji: '🧭', description: 'Advice and guidance for decisions' },
    { id: 'study', name: 'Study Mode', emoji: '📚', description: 'Research and learning assistance' },
    { id: 'diary', name: 'Diary Mode', emoji: '💭', description: 'Listening and emotional support' },
    { id: 'goal', name: 'Goal-Setting Mode', emoji: '🎯', description: 'Track progress and achieve milestones' },
    { id: 'wellness', name: 'Wellness Mode', emoji: '🌱', description: 'Mental health and mindfulness support' },
    { id: 'creative', name: 'Creative Mode', emoji: '🎨', description: 'Brainstorming and creative inspiration' }
  ];

  useEffect(() => {
    axios.get('/api/stats?userId=1')
      .then(res => {
        setBotStats({
          level: res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : 5,
          stage: res.data.stage,
          wordsLearned: res.data.wordCount
        });
      })
      .catch(() => setBotStats({ level: 1, stage: 'Infant', wordsLearned: 0 }));

    axios.get('/api/weekly-summary?userId=1')
      .then(res => setWeeklySummary(res.data.summary))
      .catch(() => setWeeklySummary('No reflection available yet. Start chatting to build your weekly summary!'));

    // Load saved zodiac preference
    const savedZodiacSign = localStorage.getItem('userZodiacSign') || '';
    setSelectedZodiacSign(savedZodiacSign);

    // Load daily content
    const zodiacParam = savedZodiacSign ? `?zodiacSign=${savedZodiacSign}` : '';
    axios.get(`/api/daily-content${zodiacParam}`)
      .then(res => {
        setDailyAffirmation(res.data.affirmation);
        setDailyHoroscope(res.data.horoscope);
        setZodiacSign(res.data.zodiacSign || '');
      })
      .catch(() => {
        setDailyAffirmation('Today is a new beginning. Embrace the possibilities that await you.');
        setDailyHoroscope('The universe is aligning to bring positive energy into your life today.');
        setZodiacSign('');
      });
  }, []);

  // Check onboarding status on load - only show if explicitly incomplete
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    
    if (!hasCompletedOnboarding) {
      axios.get('/api/onboarding-status?userId=1')
        .then(res => {
          if (!res.data.completed) {
            setShowOnboarding(true);
          } else {
            localStorage.setItem('onboardingCompleted', 'true');
          }
        })
        .catch(() => {
          // Don't force onboarding if API fails
          localStorage.setItem('onboardingCompleted', 'true');
        });
    }
  }, []);

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'r' && activeSection === 'chat') {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isRecording, activeSection]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
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

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.text) {
        setInput(response.data.text);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setInput('Could not transcribe audio - please try again or type your message');
    }
  };

  const updateDailyReflection = (userMessage: string, botResponse: string) => {
    const currentTime = new Date();
    const timeOfDay = currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening';
    
    // Analyze conversation themes
    const userLower = userMessage.toLowerCase();
    const themes = [];
    
    if (userLower.includes('stress') || userLower.includes('anxious') || userLower.includes('worry')) {
      themes.push('stress management');
    }
    if (userLower.includes('goal') || userLower.includes('achieve') || userLower.includes('success')) {
      themes.push('goal setting');
    }
    if (userLower.includes('feel') || userLower.includes('emotion') || userLower.includes('mood')) {
      themes.push('emotional awareness');
    }
    if (userLower.includes('grateful') || userLower.includes('thank') || userLower.includes('appreciate')) {
      themes.push('gratitude practice');
    }
    if (userLower.includes('mindful') || userLower.includes('present') || userLower.includes('moment')) {
      themes.push('mindfulness');
    }
    
    const reflectionPrompts = themes.length > 0 ? [
      `This ${timeOfDay}, your exploration of ${themes.join(' and ')} shows meaningful self-awareness and growth.`,
      `Your willingness to discuss ${themes.join(' and ')} demonstrates courage in facing life's challenges.`,
      `Today's focus on ${themes.join(' and ')} reflects your commitment to personal development.`,
      `The depth of your conversation about ${themes.join(' and ')} reveals genuine introspection.`
    ] : [
      `This ${timeOfDay}, you've engaged in meaningful dialogue that shows your commitment to growth.`,
      `Your thoughtful conversation today demonstrates self-awareness and emotional intelligence.`,
      `Today's interaction reflects your journey toward greater understanding and wellness.`,
      `The openness in your communication today highlights your strength and resilience.`
    ];
    
    const newReflection = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
    setDailyReflection(newReflection);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessageText = input.trim();
    const newMessage: Message = {
      sender: 'user',
      text: userMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: userMessageText,
        userId: 1,
        personalityMode: personalityMode
      });
      
      const botResponse = res.data.response;
      const botMessage = {
        sender: 'bot' as const,
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      
      updateDailyReflection(userMessageText, botResponse);
      
      // Generate audio for bot response
      try {
        const audioResponse = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: botResponse,
            voiceId: selectedReflectionVoice
          })
        });
        
        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          
          if (audioBlob.size > 0) {
            const audioUrl = URL.createObjectURL(audioBlob);
            setLastBotAudio(audioUrl);
            
            const audio = new Audio(audioUrl);
            audio.volume = 1.0;
            
            audio.addEventListener('ended', () => {
              URL.revokeObjectURL(audioUrl);
            });
            
            const playAttempt = audio.play();
            
            if (playAttempt !== undefined) {
              playAttempt
                .then(() => {
                  console.log('Audio playing successfully!');
                })
                .catch(error => {
                  console.error('Audio play failed:', error);
                  
                  if (error.name === 'NotAllowedError') {
                    setPendingAudio(audioUrl);
                  }
                });
            }
          }
        }
      } catch (audioError) {
        console.error('Error generating audio:', audioError);
      }
      
    } catch (error) {
      console.error('Chat request failed:', error);
      const errorMessage = {
        sender: 'bot' as const,
        text: 'Sorry, I had trouble processing that. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateAudioForText = async (text: string) => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voiceId: selectedReflectionVoice
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
          });
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Manual audio playing successfully!');
              })
              .catch(error => {
                console.error('Manual audio play failed:', error);
              });
          }
        }
      }
    } catch (error) {
      console.error('Error generating manual audio:', error);
    }
  };

  const enableAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      setAudioEnabled(true);
      
      if (pendingAudio) {
        const audio = new Audio(pendingAudio);
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(pendingAudio);
          setPendingAudio(null);
        });
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Pending audio playing!');
            })
            .catch(error => {
              console.error('Pending audio failed:', error);
            });
        }
      }
    } catch (error) {
      console.error('Failed to enable audio:', error);
    }
  };

  const handleZodiacChange = async (zodiacValue: string) => {
    setSelectedZodiacSign(zodiacValue);
    localStorage.setItem('userZodiacSign', zodiacValue);
    
    try {
      const zodiacParam = zodiacValue ? `?zodiacSign=${zodiacValue}` : '';
      const res = await axios.get(`/api/daily-content${zodiacParam}`);
      setDailyAffirmation(res.data.affirmation);
      setDailyHoroscope(res.data.horoscope);
      setZodiacSign(res.data.zodiacSign || '');
    } catch (error) {
      console.error('Failed to load daily content:', error);
    }
  };

  const readReflection = () => {
    if (weeklySummary) {
      generateAudioForText(weeklySummary);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            {/* Welcome Section for Mobile */}
            <div className="p-4 text-center" style={{ backgroundColor: 'var(--soft-blue)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <img src={traiLogo} alt="TrAI Logo" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to TraI</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your therapeutic companion for mental wellness and self-reflection. Start sharing your thoughts below.
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                      message.sender === 'user' 
                        ? 'rounded-br-md' 
                        : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor: message.sender === 'user' 
                        ? 'var(--soft-blue-dark)' 
                        : 'var(--surface-secondary)',
                      color: message.sender === 'user' 
                        ? 'white' 
                        : 'var(--text-primary)'
                    }}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">{message.time}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md p-3 shadow-sm border" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          </div>
        );

      case 'reflect':
        return (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Daily Reflection</h2>
              <button
                onClick={readReflection}
                disabled={!weeklySummary}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--soft-blue-dark)',
                  color: 'white'
                }}
              >
                🔊 Listen to Reflection
              </button>
            </div>

            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {weeklySummary}
              </div>
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Inspiration</h2>
            
            {/* Content area */}
            <div className="space-y-4 pb-4">
              {/* Zodiac Sign Selector - Mobile optimized */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your Zodiac Sign:</label>
                <select
                  value={selectedZodiacSign}
                  onChange={(e) => handleZodiacChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ 
                    borderColor: 'var(--gentle-lavender-dark)',
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Random Sign</option>
                  <option value="aries">♈ Aries (Mar 21 - Apr 19)</option>
                  <option value="taurus">♉ Taurus (Apr 20 - May 20)</option>
                  <option value="gemini">♊ Gemini (May 21 - Jun 20)</option>
                  <option value="cancer">♋ Cancer (Jun 21 - Jul 22)</option>
                  <option value="leo">♌ Leo (Jul 23 - Aug 22)</option>
                  <option value="virgo">♍ Virgo (Aug 23 - Sep 22)</option>
                  <option value="libra">♎ Libra (Sep 23 - Oct 22)</option>
                  <option value="scorpio">♏ Scorpio (Oct 23 - Nov 21)</option>
                  <option value="sagittarius">♐ Sagittarius (Nov 22 - Dec 21)</option>
                  <option value="capricorn">♑ Capricorn (Dec 22 - Jan 19)</option>
                  <option value="aquarius">♒ Aquarius (Jan 20 - Feb 18)</option>
                  <option value="pisces">♓ Pisces (Feb 19 - Mar 20)</option>
                </select>
              </div>
              
              {/* Daily Affirmation Section - Mobile optimized */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
                <div className="flex items-center mb-3">
                  <Sun className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Affirmation</h3>
                </div>
                <div className="bg-white/60 rounded-xl p-3 mb-3">
                  <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
                    "{dailyAffirmation}"
                  </p>
                </div>
                <button
                  onClick={() => generateAudioForText(dailyAffirmation)}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  🔊 Listen to Affirmation
                </button>
              </div>

              {/* Daily Horoscope Section - Mobile optimized */}
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
                <div className="flex items-center mb-3">
                  <Star className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Daily Horoscope {zodiacSign && `- ${zodiacSign}`}
                  </h3>
                </div>
                <div className="bg-white/60 rounded-xl p-3 mb-3">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {dailyHoroscope}
                  </p>
                </div>
                <button
                  onClick={() => generateAudioForText(dailyHoroscope)}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  🔊 Listen to Horoscope
                </button>
              </div>

              {/* Refresh Daily Content - Mobile optimized */}
              <div className="mt-4">
                <button
                  onClick={() => handleZodiacChange(selectedZodiacSign)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Get New Daily Content
                </button>
              </div>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="p-4">
            <MemoryDashboard userId={1} />
          </div>
        );

      case 'progress':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Wellness Progress</h2>
            
            {/* Bot Growth Stats - Mobile optimized */}
            <div className="rounded-2xl p-4 mb-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Your Growth</h3>
              </div>
              {botStats && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-xl p-3">
                    <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{botStats.level}</div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Level</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3">
                    <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{botStats.stage}</div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Stage</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 col-span-2">
                    <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{botStats.wordsLearned} words</div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Words Learned</div>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Insights - Mobile optimized */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
              <div className="flex items-center mb-3">
                <Brain className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Conversation Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="text-xl font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{messages.length}</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Messages</div>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="text-sm font-bold" style={{ color: 'var(--soft-blue-dark)' }}>{personalityMode}</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Mode</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Voice Settings</h2>
            
            {/* Audio Status - Mobile optimized */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Audio Status</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Audio Enabled</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${audioEnabled ? 'text-white' : 'text-white'}`}
                  style={{ backgroundColor: audioEnabled ? '#10B981' : '#EF4444' }}>
                  {audioEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              {!audioEnabled && (
                <button
                  onClick={enableAudio}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  🔊 Enable Audio
                </button>
              )}
            </div>

            {/* Voice Selection - Mobile optimized */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Voice Selection</h3>
              <VoiceSelector userId={1} onVoiceChange={() => {}} />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Coming Soon</h2>
            <p style={{ color: 'var(--text-secondary)' }}>This section is under development.</p>
          </div>
        );
    }
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <OnboardingQuiz 
          userId={1} 
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('onboardingCompleted', 'true');
          }} 
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--soft-blue)' }}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <div className="flex items-center">
            <img src={traiLogo} alt="TrAI Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>TraI</h1>
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Level {botStats?.level || 1}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="mobile-scroll-container">
          <div className="mobile-content">
            {renderActiveSection()}
          </div>
        </div>

        {/* Mobile Chat Input - Always visible and floating */}
        <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg z-50 border-t" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
          {/* Voice Selector */}
          <div className="px-4 pt-3 pb-2">
            <select
              value={selectedReflectionVoice}
              onChange={(e) => setSelectedReflectionVoice(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium"
              style={{ 
                borderColor: 'var(--gentle-lavender-dark)', 
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-secondary)'
              }}
            >
              {voiceOptions.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
          
          {/* Input Area */}
          <div className="flex items-center gap-2 px-4 pb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              className="flex-1 p-3 text-base rounded-2xl border-2 focus:outline-none focus:ring-0"
              style={{ 
                borderColor: 'var(--gentle-lavender-dark)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-2xl min-w-[48px] min-h-[48px] flex items-center justify-center shadow-lg transition-all ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{ 
                backgroundColor: isRecording ? '#EF4444' : 'var(--pale-green)',
                color: isRecording ? 'white' : 'var(--text-primary)'
              }}
              title={isRecording ? "Stop Recording" : "Start Voice Recording"}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-3 rounded-2xl min-w-[48px] min-h-[48px] flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--soft-blue-dark)',
                color: 'white'
              }}
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Fixed position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg mobile-nav z-50" style={{ borderTop: '1px solid var(--gentle-lavender)' }}>
          <div className="flex justify-around py-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex flex-col items-center py-2 px-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--soft-blue-light)' : 'transparent',
                    color: isActive ? 'var(--soft-blue-dark)' : 'var(--text-secondary)'
                  }}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default function App() {
  return <AppLayout />;
}