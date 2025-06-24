import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star } from 'lucide-react';
import axios from 'axios';

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
          level: res.data.stage === 'Therapist' ? 3 : res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : 5,
          stage: res.data.stage,
          wordsLearned: res.data.wordCount
        });
      })
      .catch(() => setBotStats({ level: 3, stage: 'Therapist', wordsLearned: 1000 }));

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
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
      
      // Auto-stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      console.error('Recording failed:', error);
      addMessage('bot', 'Microphone access denied. Please allow microphone permissions and try again.');
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
      addMessage('bot', 'Processing your voice message...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.text) {
        setInput(response.data.text);
        // Remove the processing message
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setMessages(prev => prev.slice(0, -1));
      addMessage('bot', 'Voice transcription is currently unavailable. Please check your API quota or type your message.');
    }
  };

  const addMessage = (sender: 'user' | 'bot', text: string) => {
    const newMessage: Message = {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
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
    addMessage('user', userMessageText);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: userMessageText,
        userId: 1,
        personalityMode: personalityMode
      });
      
      const botResponse = res.data.message || res.data.response;
      addMessage('bot', botResponse);
      
      // Update daily reflection based on this interaction
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
            
            try {
              await audio.play();
              setAudioEnabled(true);
            } catch (error) {
              // Fallback to browser TTS
              const utterance = new SpeechSynthesisUtterance(botResponse);
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              utterance.volume = 0.8;
              speechSynthesis.speak(utterance);
              setAudioEnabled(true);
            }
          }
        }
      } catch (voiceError) {
        console.log('Voice generation error:', voiceError);
      }
      
      setBotStats(prev => prev ? {
        ...prev,
        wordsLearned: prev.wordsLearned + userMessageText.split(' ').length
      } : null);
      
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('bot', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
    }
    
    setLoading(false);
  };

  const resetBot = async () => {
    try {
      await axios.post('/api/reset-bot?userId=1');
      setBotStats({ level: 1, stage: 'Infant', wordsLearned: 0 });
      setMessages([]);
      setDailyReflection('Your reflection will appear here as you interact with your TrAI.');
      addMessage('bot', 'Hello! I\'m your TrAI, ready to learn and grow with you. How can I help you today?');
    } catch (error) {
      console.error('Reset failed:', error);
      addMessage('bot', 'Reset failed. Please try again.');
    }
  };

  const renderChatSection = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#ADD8E6] p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#4A90E2]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Your TrAI Therapist</h3>
              {botStats && (
                <p className="text-sm text-white opacity-90">
                  {botStats.stage} • Level {botStats.level} • {botStats.wordsLearned} words learned
                </p>
              )}
            </div>
          </div>
          <button
            onClick={resetBot}
            className="p-2 bg-white bg-opacity-20 rounded-lg text-white hover:bg-opacity-30 transition-colors"
            title="Reset Bot Memory"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-[#ADD8E6]" />
            <p>Start a conversation with your TrAI therapist</p>
            <p className="text-sm mt-2">Press 'R' to use voice input</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user' 
                ? 'bg-[#4A90E2] text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-white">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message or press R to record..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] text-black"
              disabled={loading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isRecording ? 'Stop recording (or press R)' : 'Start recording (or press R)'}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDailySection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#ADD8E6] to-[#98FB98] p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Daily Reflection</h2>
        <p className="text-lg opacity-90">{dailyReflection}</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <Star className="w-6 h-6 text-yellow-500 mr-2" />
          Daily Affirmation
        </h3>
        <p className="text-gray-700 leading-relaxed">{dailyAffirmation}</p>
      </div>

      {dailyHoroscope && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Daily Horoscope {zodiacSign && `- ${zodiacSign}`}
          </h3>
          <p className="text-gray-700 leading-relaxed">{dailyHoroscope}</p>
        </div>
      )}
    </div>
  );

  const renderReflectSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Weekly Summary</h2>
        <p className="text-gray-700 leading-relaxed">{weeklySummary}</p>
      </div>
    </div>
  );

  const renderMemorySection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Bot Memory</h2>
        <p className="text-gray-600">Memory dashboard coming soon...</p>
      </div>
    </div>
  );

  const renderProgressSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Your Progress</h2>
        
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">{goal.name}</h3>
                <span className="text-sm text-gray-600">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-${goal.color}-500`}
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((goal.current / goal.target) * 100)}% complete
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVoiceSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Voice Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Voice
            </label>
            <select
              value={selectedReflectionVoice}
              onChange={(e) => setSelectedReflectionVoice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] text-black"
            >
              {voiceOptions.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personality Mode
            </label>
            <select
              value={personalityMode}
              onChange={(e) => setPersonalityMode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] text-black"
            >
              {personalityModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.emoji} {mode.name} - {mode.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zodiac Sign (for daily horoscope)
            </label>
            <select
              value={selectedZodiacSign}
              onChange={(e) => {
                setSelectedZodiacSign(e.target.value);
                localStorage.setItem('userZodiacSign', e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] text-black"
            >
              <option value="">Select your zodiac sign</option>
              <option value="aries">Aries</option>
              <option value="taurus">Taurus</option>
              <option value="gemini">Gemini</option>
              <option value="cancer">Cancer</option>
              <option value="leo">Leo</option>
              <option value="virgo">Virgo</option>
              <option value="libra">Libra</option>
              <option value="scorpio">Scorpio</option>
              <option value="sagittarius">Sagittarius</option>
              <option value="capricorn">Capricorn</option>
              <option value="aquarius">Aquarius</option>
              <option value="pisces">Pisces</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-2">App Information</h3>
            <p className="text-sm text-gray-600">
              TraI - Your Personal Therapeutic AI Companion
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Version 1.0.0 • Built with love for mental wellness
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return renderChatSection();
      case 'daily':
        return renderDailySection();
      case 'reflect':
        return renderReflectSection();
      case 'memory':
        return renderMemorySection();
      case 'progress':
        return renderProgressSection();
      case 'voice':
        return renderVoiceSection();
      case 'settings':
        return renderSettingsSection();
      default:
        return renderChatSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="h-screen flex flex-col pb-20">
        <div className="flex-1 overflow-y-auto p-4">
          {renderActiveSection()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSection(section.id);
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 ${
                  isActive 
                    ? 'bg-[#ADD8E6] text-white' 
                    : 'text-gray-600 hover:text-[#4A90E2] hover:bg-gray-100'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium truncate text-white">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}