import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, 
  Sun, Star, Heart, FileText, UserCheck, Award, Users, Activity, Headphones, 
  Gift, Zap, Shield, Lock, Home, Menu, BarChart, Settings, Lightbulb, MicOff,
  ChevronDown, ChevronUp, TrendingUp, Eye
} from 'lucide-react';
import axios from 'axios';

// Import all dashboard components
import TherapistPortal from './components/TherapistPortal';
import VRTherapyDashboard from './components/VRTherapyDashboard';
import HealthDashboard from './components/HealthDashboard';
import CommunityPortal from './components/CommunityPortal';
import EnhancedGamificationDashboard from './components/EnhancedGamificationDashboard';
import EmotionalIntelligenceDashboard from './components/EmotionalIntelligenceDashboard';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import PrivacyComplianceDashboard from './components/PrivacyComplianceDashboard';
import AiPerformanceMonitoringDashboard from './components/AiPerformanceMonitoringDashboard';
import MoodTracker from './components/MoodTracker';
import JournalEditor from './components/JournalEditor';

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

// Navigation menu configuration
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
      { id: 'vr-therapy', label: 'VR Therapy', icon: Headphones },
      { id: 'therapist-portal', label: 'Therapist Portal', icon: UserCheck },
      { id: 'emotional-intelligence', label: 'AI Intelligence', icon: Zap },
      { id: 'analytics', label: 'Analytics', icon: BarChart },
    ]
  },
  {
    title: 'Wellness & Community',
    items: [
      { id: 'health', label: 'Health Dashboard', icon: Activity },
      { id: 'community', label: 'Community', icon: Users },
      { id: 'gamification', label: 'Wellness Rewards', icon: Gift },
      { id: 'achievements', label: 'Achievements', icon: Award },
    ]
  },
  {
    title: 'Privacy & Monitoring',
    items: [
      { id: 'privacy', label: 'Privacy Controls', icon: Lock },
      { id: 'ai-monitoring', label: 'AI Performance', icon: Eye },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

// Main App Component
function TraiApp() {
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Core Features': true,
    'Advanced Therapy': false,
    'Wellness & Community': false,
    'Privacy & Monitoring': false
  });
  
  // Default userId for professional demo - in production this would come from authentication
  const userId = 1;

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('James');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Bot stats query
  const { data: botStats } = useQuery<BotStats>({
    queryKey: ['/api/stats'],
    queryFn: () => fetch('/api/stats').then(res => res.json()),
  });

  // Daily affirmation query
  const { data: affirmation } = useQuery({
    queryKey: ['/api/affirmation'],
    queryFn: () => fetch('/api/affirmation').then(res => res.json()),
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleNavigation = (itemId: string) => {
    setCurrentView(itemId);
    setIsMenuOpen(false);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setInputMessage(data.text);
        }
      } else {
        console.error('Transcription failed');
      }
    } catch (error) {
      console.error('Error sending audio to Whisper:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          voice: selectedVoice 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage: Message = {
          sender: 'bot',
          text: data.message || data.response || 'I\'m here to help with your wellness journey.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMessage]);

        // Play audio response if enabled
        if (audioEnabled && data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.play().catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resetBot = async () => {
    try {
      const response = await fetch('/api/reset-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setMessages([]);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error resetting bot:', error);
    }
  };

  // Render different views based on current selection
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <img src={traiLogo} alt="TrAI Logo" className="w-24 h-24 mx-auto" />
              <h1 className="text-3xl font-bold">Welcome to TrAI</h1>
              <p className="text-lg opacity-90">Your AI-powered therapeutic companion</p>
              
              {affirmation && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-sm opacity-75">Daily Affirmation</p>
                  <p className="font-medium">{affirmation.message}</p>
                </div>
              )}
            </div>

            {botStats && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">Your AI Companion</h3>
                <div className="space-y-2">
                  <p>Stage: {botStats.stage}</p>
                  <p>Level: {botStats.level}</p>
                  <p>Words Learned: {botStats.wordsLearned}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => handleNavigation('chat')}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all"
              >
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Start Chat</span>
              </button>
              <button
                onClick={() => handleNavigation('mood')}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all"
              >
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Track Mood</span>
              </button>
              <button
                onClick={() => handleNavigation('journal')}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Journal</span>
              </button>
              <button
                onClick={() => handleNavigation('vr-therapy')}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all"
              >
                <Headphones className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">VR Therapy</span>
              </button>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <Brain className="w-16 h-16 mx-auto opacity-60" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Start Your Therapeutic Journey</h3>
                    <p className="opacity-75">Share your thoughts, feelings, or ask me anything.</p>
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="w-full p-3 pr-12 rounded-xl bg-white/20 backdrop-blur-sm border-none focus:ring-2 focus:ring-blue-400 placeholder-white/60"
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  className="p-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'mood':
        return <MoodTracker />;
      case 'journal':
        return <JournalEditor userId={userId} />;
      case 'vr-therapy':
        return <VRTherapyDashboard />;
      case 'therapist-portal':
        return <TherapistPortal userId={userId.toString()} />;
      case 'emotional-intelligence':
        return <EmotionalIntelligenceDashboard />;
      case 'analytics':
        return <InteractiveDashboard userId={userId} />;
      case 'health':
        return <HealthDashboard />;
      case 'community':
        return <CommunityPortal userId={userId} />;
      case 'gamification':
        return <EnhancedGamificationDashboard />;
      case 'achievements':
        return <EnhancedGamificationDashboard />;
      case 'privacy':
        return <PrivacyComplianceDashboard />;
      case 'ai-monitoring':
        return <AiPerformanceMonitoringDashboard />;
      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm">Voice Selection:</span>
                    <select 
                      value={selectedVoice} 
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-white/20 backdrop-blur-sm border-none"
                    >
                      <option value="James">James</option>
                      <option value="Brian">Brian</option>
                      <option value="Alexandra">Alexandra</option>
                      <option value="Carla">Carla</option>
                    </select>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={audioEnabled}
                      onChange={(e) => setAudioEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable voice responses</span>
                  </label>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Bot Memory</h3>
                <p className="text-sm opacity-75 mb-4">Reset the AI to retake personality quiz and start fresh.</p>
                <button
                  onClick={resetBot}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Bot Memory</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Feature Coming Soon</h2>
            <p className="opacity-75">This advanced feature is being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={traiLogo} alt="TrAI" className="w-8 h-8" />
          <h1 className="text-xl font-bold">TrAI</h1>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        {isMenuOpen && (
          <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              
              {navigationSections.map((section) => (
                <div key={section.title} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <span className="font-medium">{section.title}</span>
                    {expandedSections[section.title] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedSections[section.title] && (
                    <div className="mt-2 space-y-1">
                      {section.items.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left ${
                              currentView === item.id
                                ? 'bg-blue-500/50'
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Root App with QueryClient Provider
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TraiApp />
    </QueryClientProvider>
  );
}