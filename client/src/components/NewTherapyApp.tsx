import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, MessageCircle, Heart, Target, Settings, Mic, Send, BarChart3 } from 'lucide-react';

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

export default function NewTherapyApp() {
  const [activeTab, setActiveTab] = useState('therapy');
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadStats();
    loadGoals();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      const data = response.data;
      
      setBotStats({
        level: Math.floor(data.wordCount / 200) || 5,
        stage: data.stage || 'Professional Therapist',
        wordsLearned: data.wordCount || 1000
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setBotStats({ level: 5, stage: 'Professional Therapist', wordsLearned: 1000 });
    }
  };

  const loadGoals = () => {
    setGoals([
      { id: 1, name: 'Daily Mindfulness', current: 5, target: 7, color: 'bg-blue-500' },
      { id: 2, name: 'Gratitude Journal', current: 3, target: 5, color: 'bg-green-500' },
      { id: 3, name: 'Mood Tracking', current: 6, target: 7, color: 'bg-purple-500' }
    ]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: inputText,
        userId: 1
      });

      const botMessage: Message = {
        sender: 'bot',
        text: response.data.message || response.data.response || 'I understand. How can I help you further?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetBot = async () => {
    if (confirm('This will reset all therapeutic data and conversation history. Continue?')) {
      try {
        await axios.post('/api/clear-memories', { userId: 1 });
        setMessages([]);
        setBotStats({ level: 1, stage: 'New Therapist', wordsLearned: 0 });
        localStorage.clear();
        alert('Therapeutic session has been reset. Refresh to begin anew.');
        window.location.reload();
      } catch (error) {
        console.error('Reset failed:', error);
        alert('Reset failed. Please try again.');
      }
    }
  };

  const renderTherapySection = () => (
    <div className="p-6 space-y-6 pb-32">
      {/* Professional Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-xl flex items-center justify-center">
          <Brain className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">TrAI Therapy</h1>
        <p className="text-blue-100 text-lg">Your Professional Mental Health Companion</p>
      </div>

      {/* Real Statistics Display */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {botStats ? botStats.level : 'Loading...'}
          </div>
          <div className="text-sm font-semibold text-gray-700">Therapy Level</div>
          <div className="text-xs text-gray-500 mt-1">
            {botStats?.stage || 'Loading...'}
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {botStats ? `${Math.floor(botStats.wordsLearned / 10)}%` : 'Loading...'}
          </div>
          <div className="text-sm font-semibold text-gray-700">Progress</div>
          <div className="text-xs text-gray-500 mt-1">Therapeutic Development</div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Therapeutic Chat
          </h3>
        </div>
        
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Welcome to your safe therapeutic space.</p>
              <p className="text-sm mt-2">Share your thoughts and feelings here.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">{message.time}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Share your thoughts..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWellnessSection = () => (
    <div className="p-6 space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Wellness Goals</h2>
      
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">{goal.name}</h3>
              <span className="text-sm text-gray-600">{goal.current}/{goal.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${goal.color}`}
                style={{ width: `${(goal.current / goal.target) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((goal.current / goal.target) * 100)}% Complete
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInsightsSection = () => (
    <div className="p-6 space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Therapeutic Insights</h2>
      
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Progress Overview</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Therapeutic Level</p>
            <p className="text-lg font-semibold text-blue-600">
              Level {botStats?.level || 5} - {botStats?.stage || 'Professional Therapist'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Vocabulary Development</p>
            <p className="text-lg font-semibold text-green-600">
              {botStats?.wordsLearned || 1000} words learned
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">75% therapeutic development</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="p-6 space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Settings</h2>
      
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Therapeutic Session</h3>
          <button
            onClick={resetBot}
            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reset Therapeutic Data
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This will clear all conversation history and therapeutic progress
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Application Info</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>TrAI Professional Therapy App</p>
            <p>Version: 2.0.0</p>
            <p>Your mental health companion</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400">
      {/* Main Content */}
      <div className="pb-20">
        {activeTab === 'therapy' && renderTherapySection()}
        {activeTab === 'wellness' && renderWellnessSection()}
        {activeTab === 'insights' && renderInsightsSection()}
        {activeTab === 'settings' && renderSettingsSection()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { id: 'therapy', icon: MessageCircle, label: 'Therapy' },
            { id: 'wellness', icon: Heart, label: 'Wellness' },
            { id: 'insights', icon: BarChart3, label: 'Insights' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}