import React, { useState, useEffect, useRef } from 'react';
import { Link, Route, useLocation } from 'wouter';
import { MessageSquare, Brain, BarChart3, RefreshCw, Settings, User, Mic, Send, MicOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
          reject('Voice transcription temporarily unavailable');
        } finally {
          setIsTranscribing(false);
          
          // Clean up media stream
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording
  };
}

// Chat Component
function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording();

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), userId: 1 })
      });

      if (response.message) {
        const botMessage: Message = {
          sender: 'bot',
          text: response.message,
          time: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Invalidate stats to refresh after conversation
        queryClient.invalidateQueries({ queryKey: ['/api/bot-stats'] });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        const transcription = await stopRecording();
        if (transcription) {
          await sendMessage(transcription);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Chat with TraI</h2>
        <p className="text-sm text-gray-600">Your personal mental wellness companion</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-blue-100 rounded-lg p-6 max-w-sm mx-auto">
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to TraI</h3>
              <p className="text-gray-600 text-sm">Start a conversation to begin your wellness journey. I'm here to listen and support you.</p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
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
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">TraI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isTranscribing ? "Transcribing..." : "Type your message..."}
              disabled={isLoading || isTranscribing}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading || isTranscribing}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isRecording 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || isTranscribing}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Stats Component
function StatsTab() {
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/bot-stats'],
    queryFn: () => apiRequest('/api/bot-stats?userId=1')
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest('/api/clear-memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/personality-insights'] });
    }
  });

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all bot progress? This will clear all memories and reset statistics to zero.')) {
      resetMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-green-50 to-white h-full">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Brain className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Bot Progress</h2>
          <p className="text-gray-600">Track your AI companion's learning journey</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.level || 1}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">{stats?.stage || 'Learning'}</div>
              <div className="text-sm text-gray-600">Development Stage</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.wordsLearned || 0}</div>
              <div className="text-sm text-gray-600">Words Learned</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`h-5 w-5 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{resetMutation.isPending ? 'Resetting...' : 'Reset Bot Progress'}</span>
        </button>
        
        {resetMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">Bot successfully reset to fresh state!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Insights Component
function InsightsTab() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/personality-insights'],
    queryFn: () => apiRequest('/api/personality-insights?userId=1')
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-purple-50 to-white h-full overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <User className="h-12 w-12 text-purple-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Personality Insights</h2>
          <p className="text-gray-600">Discover your communication patterns</p>
        </div>

        {insights ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Communication Style</h3>
              <p className="text-gray-600 capitalize">{insights.communicationStyle}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Key Insights</h3>
              <ul className="space-y-2">
                {insights.keyInsights?.map((insight: string, index: number) => (
                  <li key={index} className="text-gray-600 text-sm">• {insight}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Dominant Traits</h3>
              <div className="flex flex-wrap gap-2">
                {insights.dominantTraits?.map((trait: string, index: number) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {insights.interests?.map((interest: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Start chatting to generate personality insights</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat', component: ChatTab },
    { path: '/stats', icon: BarChart3, label: 'Stats', component: StatsTab },
    { path: '/insights', icon: User, label: 'Insights', component: InsightsTab }
  ];

  const currentTab = navItems.find(item => item.path === location) || navItems[0];
  const CurrentComponent = currentTab.component;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">TraI</span>
          </div>
          <div className="text-sm text-gray-600">Mental Wellness Companion</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <CurrentComponent />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg min-w-0 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}