import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart, FileText, UserCheck, Award, Users, Activity, Headphones, Gift, Zap, Shield, Lock, Home, Menu, BarChart, Settings, Lightbulb, MicOff } from 'lucide-react';
import axios from 'axios';

// Set up CSS variables for therapeutic design
const cssVariables = `
:root {
  --soft-blue: #ADD8E6;
  --pale-green: #98FB98;
  --gentle-lavender: #E6E6FA;
  --soft-blue-dark: #4682B4;
  --surface-primary: #FFFFFF;
  --surface-secondary: #F8F9FA;
  --text-primary: #FFFFFF;
  --text-secondary: #E0E0E0;
  --border-light: #E5E7EB;
}

body {
  background: linear-gradient(135deg, var(--soft-blue) 0%, var(--pale-green) 50%, var(--gentle-lavender) 100%);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
}

* {
  color: #FFFFFF !important;
}
`;

// Inject CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = cssVariables;
document.head.appendChild(styleSheet);

// Use the actual TrAI logo from public directory
const traiLogo = '/TrAI-Logo.png';

// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Interfaces
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

interface Voice {
  id: string;
  name: string;
  description: string;
}

// Voice options
const voices: Voice[] = [
  { id: 'james', name: 'James', description: 'Warm, encouraging voice' },
  { id: 'brian', name: 'Brian', description: 'Calm, steady voice' },
  { id: 'alexandra', name: 'Alexandra', description: 'Gentle, supportive voice' },
  { id: 'carla', name: 'Carla', description: 'Friendly, understanding voice' }
];

// Main Navigation Component
interface NavigationProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'journal', label: 'Journal', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-md border-t border-white/30 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log('Navigation clicked:', item.id);
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-white/30 text-white scale-105' 
                  : 'text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Home Page Component
interface HomePageProps {
  botStats: BotStats | null;
  onNavigate: (section: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ botStats, onNavigate }) => {
  const [dailyAffirmation, setDailyAffirmation] = useState('');

  useEffect(() => {
    // Generate daily affirmation
    const affirmations = [
      "Today is a fresh start. You have the power to create positive change.",
      "Your feelings are valid, and your healing journey matters.",
      "Every small step forward is progress worth celebrating.",
      "You are stronger than you realize and more resilient than you know.",
      "This moment is an opportunity to practice self-compassion."
    ];
    
    const today = new Date().getDate();
    setDailyAffirmation(affirmations[today % affirmations.length]);
  }, []);

  const quickActions = [
    { id: 'chat', title: 'Start Conversation', subtitle: 'Talk with your AI therapist', icon: MessageCircle, color: 'var(--soft-blue)' },
    { id: 'mood', title: 'Track Mood', subtitle: 'Log how you\'re feeling', icon: Heart, color: 'var(--pale-green)' },
    { id: 'journal', title: 'Write Journal', subtitle: 'Express your thoughts', icon: FileText, color: 'var(--gentle-lavender)' }
  ];

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          <img src={traiLogo} alt="TrAI Logo" className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome to TrAI</h1>
        <p className="text-white/80 text-lg">"Reflect. Refine. Rise."</p>
      </div>

      {/* Bot Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">{botStats?.level || 3}</div>
          <div className="text-sm font-medium">Bot Level</div>
          <div className="text-xs opacity-75">{botStats?.stage || 'Therapist'}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">{botStats?.wordsLearned || 1000}</div>
          <div className="text-sm font-medium">Words Learned</div>
          <div className="text-xs opacity-75">Growing vocabulary</div>
        </div>
      </div>

      {/* Daily Affirmation */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Today's Affirmation
        </h3>
        <p className="text-white/90 leading-relaxed">{dailyAffirmation}</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left transition-all hover:bg-white/30 hover:scale-102"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: action.color }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{action.title}</div>
                  <div className="text-sm text-white/70">{action.subtitle}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Chat Component with working microphone
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('james');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enable audio context
  const enableAudio = async () => {
    try {
      // Create and play a silent audio to enable audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioContext.resume();
      setAudioEnabled(true);
      console.log('Audio enabled successfully');
    } catch (error) {
      console.error('Failed to enable audio:', error);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      console.log('Starting voice recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I need microphone permission to use voice input. Please enable microphone access and try again.',
        time: new Date().toLocaleTimeString()
      }]);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  // Send audio to Whisper API
  const sendAudioToWhisper = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim()) {
          setInputText(data.text);
          // Auto-send the transcribed message
          await sendMessage(data.text);
        }
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I had trouble understanding your voice message. Please try typing instead.',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to bot
  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          sender: 'bot',
          text: data.message || data.response || 'I understand you, and I\'m here to help.',
          time: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, botMessage]);

        // Play voice response if audio is enabled
        if (audioEnabled && data.message) {
          playVoiceResponse(data.message);
        }
      } else {
        throw new Error('Chat request failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I\'m having trouble connecting right now. Please try again in a moment.',
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play voice response
  const playVoiceResponse = async (text: string) => {
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: selectedVoice,
          emotionalContext: 'supportive'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
        console.log('Voice response played successfully');
      }
    } catch (error) {
      console.error('Error playing voice response:', error);
    }
  };

  // Reset conversation
  const resetConversation = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setMessages([]);
        console.log('Conversation reset successfully');
      }
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Chat Header */}
      <div className="bg-white/20 backdrop-blur-md p-4 border-b border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">TrAI Therapist</h2>
              <p className="text-sm text-white/70">Your personal AI therapist</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetConversation}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Your Conversation</h3>
            <p className="text-white/70">Share what's on your mind. I'm here to listen and support you.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-white/30 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">{message.time}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/20 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/20 backdrop-blur-md border-t border-white/30">
        {/* Audio Control */}
        {!audioEnabled && (
          <div className="mb-3">
            <button
              onClick={enableAudio}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm transition-all"
            >
              Enable Audio & Voice Features
            </button>
          </div>
        )}

        {/* Voice Selector */}
        <div className="mb-3 flex items-center space-x-2">
          <span className="text-sm text-white/70">Voice:</span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm"
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id} className="bg-gray-800 text-white">
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        {/* Message Input */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder="Type your message or use voice..."
              className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              disabled={isLoading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-white/30 hover:bg-white/40 disabled:bg-white/10 text-white p-3 rounded-2xl transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Settings Page
const SettingsPage: React.FC = () => {
  const [botStats, setBotStats] = useState<BotStats | null>(null);

  const resetBot = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Refresh bot stats
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setBotStats(stats);
        }
        console.log('Bot reset successfully');
      }
    } catch (error) {
      console.error('Error resetting bot:', error);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Bot Management</h3>
        
        <div className="space-y-3">
          <button
            onClick={resetBot}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg transition-all"
          >
            Reset Bot Memory
          </button>
          
          <p className="text-sm text-white/70">
            This will clear the bot's memory and reset it to initial state. You can then retake the personality quiz.
          </p>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Bot Status</h3>
        {botStats ? (
          <div className="space-y-2 text-white/90">
            <p>Level: {botStats.level}</p>
            <p>Stage: {botStats.stage}</p>
            <p>Words Learned: {botStats.wordsLearned}</p>
          </div>
        ) : (
          <p className="text-white/70">Loading bot status...</p>
        )}
      </div>
    </div>
  );
};

// Simple placeholder components for other pages
const MoodPage: React.FC = () => (
  <div className="p-6 pb-24 max-w-md mx-auto">
    <h1 className="text-2xl font-bold text-white mb-6">Mood Tracker</h1>
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <p className="text-white">Mood tracking features coming soon...</p>
    </div>
  </div>
);

const JournalPage: React.FC = () => (
  <div className="p-6 pb-24 max-w-md mx-auto">
    <h1 className="text-2xl font-bold text-white mb-6">Journal</h1>
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <p className="text-white">Journal features coming soon...</p>
    </div>
  </div>
);

// Main App Layout Component
const AppLayout: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [botStats, setBotStats] = useState<BotStats | null>(null);

  // Fetch bot stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats');
      return response.data;
    },
    staleTime: 30000,
  });

  useEffect(() => {
    if (stats) {
      setBotStats(stats);
    }
  }, [stats]);

  // Navigate to section
  const handleNavigate = (section: string) => {
    console.log('Navigating to:', section);
    setCurrentSection(section);
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentSection) {
      case 'home':
        return <HomePage botStats={botStats} onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatPage />;
      case 'mood':
        return <MoodPage />;
      case 'journal':
        return <JournalPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage botStats={botStats} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentPage()}
      <Navigation currentSection={currentSection} onNavigate={handleNavigate} />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
};

export default App;