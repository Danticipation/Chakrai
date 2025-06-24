import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageSquare, BarChart3, Brain, User, Mic, Send, MicOff, RefreshCw, Settings } from 'lucide-react';
import { apiRequest } from './lib/queryClient';

// Type definitions
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

interface PersonalityInsights {
  communicationStyle: string;
  keyInsights: string[];
  dominantTraits: string[];
  interests: string[];
}

// Voice Recording Hook
function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        reject('No active recording');
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsTranscribing(true);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          resolve(data.text || '');
        } catch (error) {
          console.error('Transcription error:', error);
          reject('Failed to transcribe audio');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    });
  };

  return { isRecording, isTranscribing, startRecording, stopRecording };
}

// Daily Reflection Component
function DailyReflection() {
  const reflections = [
    "Today is a new opportunity for growth and healing.",
    "Your journey of self-discovery is unique and valuable.",
    "Every small step forward is worth celebrating.",
    "You have the strength to overcome challenges.",
    "Remember to be kind to yourself today."
  ];

  const todayReflection = reflections[new Date().getDay() % reflections.length];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="h-6 w-6 text-pink-500" />
        <h2 className="text-lg font-semibold text-gray-800">Daily Reflection</h2>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">{todayReflection}</p>
      <div className="text-sm text-gray-600">
        Take a moment to reflect on your thoughts and feelings today.
      </div>
    </div>
  );
}

// Chat Component with Voice
function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        sender: 'bot',
        text: data.message || data.response || 'I understand.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    chatMutation.mutate(text.trim());
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        if (transcribedText.trim()) {
          setInputText(transcribedText);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    } else {
      await startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col" style={{ height: '600px' }}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Welcome to TraI</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">Start a conversation to begin your wellness journey. I'm here to listen and support you.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Start a conversation to begin your wellness journey.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#1e3a8a' }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              disabled={isLoading || isTranscribing}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-gray-600 text-white p-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        {isTranscribing && (
          <p className="text-sm text-gray-500 mt-2">Transcribing your voice...</p>
        )}
      </div>
    </div>
  );
}

// Progress Component
function ProgressTracking() {
  const { data: stats } = useQuery({
    queryKey: ['/api/bot-stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/bot-stats');
      return response as BotStats;
    }
  });

  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/reset-bot', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-stats'] });
    }
  });

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the bot to starting values? This will clear all progress.')) {
      resetMutation.mutate();
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">Wellness Goals</h2>
        </div>
        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
          Reset
        </button>
      </div>
      
      {stats ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Current Stage</span>
              <span className="text-lg font-bold text-blue-600">{stats.stage}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Level</span>
              <span className="text-lg font-bold text-green-600">{stats.level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Words Learned</span>
              <span className="text-lg font-bold text-purple-600">{stats.wordsLearned}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Progress Overview</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.level / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Level {stats.level} of 10</p>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-4 rounded"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        </div>
      )}
    </div>
  );
}

// Memory Component
function MemoryInsights() {
  const { data: insights } = useQuery({
    queryKey: ['/api/personality-insights'],
    queryFn: async () => {
      const response = await apiRequest('/api/personality-insights');
      return response as PersonalityInsights;
    }
  });

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-800">Memory & Insights</h2>
      </div>
      
      {insights ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Communication Style</h3>
            <p className="text-gray-800">{insights.communicationStyle}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Key Insights</h3>
            <ul className="space-y-1">
              {insights.keyInsights.map((insight, index) => (
                <li key={index} className="text-gray-800 text-sm">• {insight}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Dominant Traits</h3>
            <div className="flex flex-wrap gap-2">
              {insights.dominantTraits.map((trait, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-4 rounded"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        </div>
      )}
    </div>
  );
}

// Reflection Component
function ReflectionTab() {
  const queryClient = useQueryClient();
  
  const { data: insights, refetch } = useQuery({
    queryKey: ['/api/personality-insights'],
    queryFn: async () => {
      const response = await apiRequest('/api/personality-insights');
      return response as PersonalityInsights;
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-800">Personality Reflection</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {insights ? (
        <div className="grid gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Style Analysis</h3>
            <p className="text-gray-700 leading-relaxed">{insights.communicationStyle}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Personality Insights</h3>
            <div className="space-y-3">
              {insights.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dominant Traits & Characteristics</h3>
            <div className="grid grid-cols-2 gap-3">
              {insights.dominantTraits.map((trait, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <span className="text-sm font-medium text-gray-800">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interests & Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {insights.interests.map((interest, index) => (
                <span key={index} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-32 rounded-2xl"></div>
          <div className="bg-gray-200 h-24 rounded-2xl"></div>
          <div className="bg-gray-200 h-20 rounded-2xl"></div>
        </div>
      )}
    </div>
  );
}

// Settings Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Information</h3>
        <div className="space-y-3 text-gray-600">
          <p><strong>Application:</strong> TraI - Mental Wellness & Therapy</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Purpose:</strong> Professional therapeutic support and mental wellness</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Voice-enabled conversations</li>
          <li>• Personality analysis and insights</li>
          <li>• Progress tracking</li>
          <li>• Daily reflections</li>
          <li>• Therapeutic support</li>
        </ul>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('daily');

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Heart, component: DailyReflection },
    { id: 'voice', label: 'Voice', icon: MessageSquare, component: ChatInterface },
    { id: 'progress', label: 'Progress', icon: BarChart3, component: ProgressTracking },
    { id: 'memory', label: 'Memory', icon: Brain, component: MemoryInsights },
    { id: 'reflect', label: 'Reflect', icon: User, component: ReflectionTab },
    { id: 'settings', label: 'Settings', icon: Settings, component: SettingsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DailyReflection;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ADD8E6' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">TraI</h1>
            </div>
            <div className="text-sm text-gray-600">Mental Wellness & Therapy</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}