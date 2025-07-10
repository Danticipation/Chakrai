import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, 
  Sun, Star, Heart, FileText, UserCheck, Award, Users, Activity, Headphones, 
  Gift, Zap, Shield, Lock, Home, Menu, BarChart, Settings, Lightbulb, MicOff,
  ChevronDown, ChevronUp, TrendingUp, Eye
} from 'lucide-react';
import axios from 'axios';
import SimplifiedDashboard from './components/SimplifiedDashboard';

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

// Simplified navigation menu
const navigationSections = [
  {
    title: 'Core Features',
    items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'chat', label: 'Chat', icon: MessageCircle },
      { id: 'mood', label: 'Mood Tracker', icon: Heart },
      { id: 'journal', label: 'Journal', icon: BookOpen },
    ]
  },
  {
    title: 'Advanced Therapy',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

// Voice options
const voiceOptions = [
  { id: 'james', name: 'James', description: 'Warm and supportive' },
  { id: 'brian', name: 'Brian', description: 'Calm and professional' },
  { id: 'alexandra', name: 'Alexandra', description: 'Gentle and understanding' },
  { id: 'carla', name: 'Carla', description: 'Energetic and encouraging' }
];

function ChakraiApp() {
  const [currentView, setCurrentView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userId] = useState(1); // Simplified user ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('james');

  // Bot stats query
  const { data: botStats } = useQuery({
    queryKey: ['/api/bot-stats', userId],
    queryFn: () => axios.get(`/api/bot-stats/${userId}`).then(res => res.data),
    initialData: { level: 1, stage: 'Companion', wordsLearned: 1000 }
  });

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    try {
      const response = await axios.post('/api/chat', {
        message: inputValue,
        userId,
        voice: selectedVoice
      });
      
      const botMessage: Message = {
        sender: 'bot',
        text: response.data.message || response.data.response || 'I understand.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I apologize, but I encountered an issue. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <SimplifiedDashboard userId={userId} />;
      
      case 'chat':
        return (
          <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-white/70" />
                  <h3 className="text-xl font-semibold text-white mb-2">Welcome to Chakrai</h3>
                  <p className="text-white/80">Your personal AI therapist is here to help. Start a conversation below.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500/80 text-white ml-auto' 
                      : 'bg-white/20 text-white mr-auto backdrop-blur-sm border border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-white/60'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-white/20 bg-white/5">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
                  />
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      isRecording ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="px-6 py-3 bg-blue-500/80 hover:bg-blue-600/80 disabled:bg-gray-400/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'mood':
        return (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mood Tracker</h2>
            <p className="text-white/80">Mood tracking functionality will be available soon.</p>
          </div>
        );
      
      case 'journal':
        return (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Journal</h2>
            <p className="text-white/80">Journaling functionality will be available soon.</p>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
            <p className="text-white/80">Analytics dashboard will be available soon.</p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Voice Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {voiceOptions.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`p-4 rounded-xl border transition-colors text-left ${
                        selectedVoice === voice.id
                          ? 'bg-blue-500/20 border-blue-300/50 text-white'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-sm text-white/60">{voice.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <SimplifiedDashboard userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <h1 className="text-xl font-bold text-white">Chakrai</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white/80 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 md:min-h-screen`}>
        <div className="p-6">
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-white">Chakrai</h1>
            <p className="text-white/70 text-sm">Mental Wellness Companion</p>
          </div>

          {/* Bot Stats */}
          <div className="mb-8 p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Brain className="w-8 h-8 text-blue-300" />
              <div>
                <h3 className="text-white font-semibold">AI Wellness Companion</h3>
                <p className="text-white/60 text-sm">{botStats?.stage || 'Wellness Companion'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Level</span>
                <span className="text-white font-medium">{botStats?.level || 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Experience</span>
                <span className="text-white font-medium">{botStats?.wordsLearned || 1000} words</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          currentView === item.id
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-300/30'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraiApp />
    </QueryClientProvider>
  );
}