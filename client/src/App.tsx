import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart, FileText, UserCheck, Award, Users, Activity, Headphones, Gift, Zap, Shield, Lock, Home, Menu, BarChart, Settings, Lightbulb } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';
import MoodTracker from './components/MoodTracker';
import CrisisAlert from './components/CrisisAlert';
import JournalDashboard from './components/JournalDashboard';
import TherapistPortal from './components/TherapistPortal';
import AchievementDashboard from './components/AchievementDashboard';
import CommunityPortal from './components/CommunityPortal';
import HealthDashboard from './components/HealthDashboard';
import VRTherapyDashboard from './components/VRTherapyDashboard';
import EnhancedGamificationDashboard from './components/EnhancedGamificationDashboard';
import EmotionalIntelligenceDashboard from './components/EmotionalIntelligenceDashboard';
import AiPerformanceMonitoringDashboard from './components/AiPerformanceMonitoringDashboard';
import PrivacyComplianceDashboard from './components/PrivacyComplianceDashboard';

// Use the actual TrAI logo from public directory
const traiLogo = '/TrAI-Logo.png';

// DashboardHome Component - Mobile-optimized home dashboard
interface DashboardHomeProps {
  botStats: BotStats | null;
  goals: Goal[];
  dailyReflection: string;
  onNavigate: (section: string) => void;
}

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

const DashboardHome: React.FC<DashboardHomeProps> = ({ botStats, goals, dailyReflection, onNavigate }) => {
  return (
    <div className="p-4 space-y-4 pb-32">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <img src={traiLogo} alt="TrAI Logo" className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome to TrAI</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          "Reflect. Refine. Rise."
        </p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--pale-green)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--soft-blue-dark)' }}>
            {botStats?.level || 3}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Current Level</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {botStats?.stage || 'Therapist'}
          </div>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--soft-blue)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--soft-blue-dark)' }}>
            {botStats?.wordsLearned || 1000}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Words Learned</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Growing vocabulary
          </div>
        </div>
      </div>

      {/* Today's Goals Section */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Today's Goals</h3>
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{goal.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(goal.current / goal.target) * 100}%`,
                    backgroundColor: goal.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('chat')}
          className="p-4 rounded-2xl text-left transition-all"
          style={{ backgroundColor: 'var(--soft-blue)' }}
        >
          <MessageCircle className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Chat Therapy</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Start conversation</div>
        </button>

        <button 
          onClick={() => onNavigate('mood')}
          className="p-4 rounded-2xl text-left transition-all"
          style={{ backgroundColor: 'var(--pale-green)' }}
        >
          <Heart className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mood Check</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Track emotions</div>
        </button>

        <button 
          onClick={() => onNavigate('journal')}
          className="p-4 rounded-2xl text-left transition-all"
          style={{ backgroundColor: 'var(--gentle-lavender)' }}
        >
          <FileText className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Journal</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reflect & write</div>
        </button>

        <button 
          onClick={() => onNavigate('reflect')}
          className="p-4 rounded-2xl text-left transition-all"
          style={{ backgroundColor: 'var(--soft-blue)' }}
        >
          <Brain className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Insights</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>View progress</div>
        </button>
      </div>

      {/* Daily Reflection Card */}
      {dailyReflection && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Today's Reflection</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {dailyReflection}
          </p>
        </div>
      )}
    </div>
  );
};

// Main App Component
function AppLayout() {
  // State management
  const [activeSection, setActiveSection] = useState('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [lastBotAudio, setLastBotAudio] = useState<string | null>(null);
  const [personalityMode, setPersonalityMode] = useState('Friend');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [dailyHoroscope, setDailyHoroscope] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [selectedZodiacSign, setSelectedZodiacSign] = useState('');
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, name: 'Daily Chat Goal', current: 7, target: 10, color: '#4A90E2' },
    { id: 2, name: 'Weekly Reflection', current: 4, target: 7, color: '#7ED321' },
    { id: 3, name: 'Voice Practice', current: 12, target: 15, color: '#F5A623' }
  ]);
  const [dailyReflection, setDailyReflection] = useState('');
  const [weeklySummary, setWeeklySummary] = useState('');
  const [personalityInsights, setPersonalityInsights] = useState<any>(null);
  const [crisisAlert, setCrisisAlert] = useState<any>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState('James');

  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Voice mode cycling
  const personalityModes = ['Friend', 'Counsel', 'Study', 'Diary', 'Goal-Setting', 'Wellness', 'Creative'];

  // Check for onboarding completion
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await axios.get('/api/user-profile');
        if (!response.data || response.data.length === 0) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.log('No existing profile found, showing onboarding');
        setShowOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load bot stats
        const statsRes = await axios.get('/api/stats');
        setBotStats(statsRes.data);

        // Load daily content
        const savedZodiac = localStorage.getItem('userZodiacSign') || '';
        const zodiacParam = savedZodiac ? `?zodiacSign=${savedZodiac}` : '';
        const contentRes = await axios.get(`/api/daily-content${zodiacParam}`);
        
        setDailyAffirmation(contentRes.data.affirmation);
        setDailyHoroscope(contentRes.data.horoscope);
        setZodiacSign(contentRes.data.zodiacSign || '');
        setSelectedZodiacSign(savedZodiac);

        // Load weekly summary for reflection
        const summaryRes = await axios.get('/api/weekly-summary');
        setWeeklySummary(summaryRes.data.summary);
        setDailyReflection(summaryRes.data.dailyReflection || 'Take a moment to reflect on your thoughts and feelings today.');

        // Load personality insights
        const insightsRes = await axios.get('/api/personality-insights');
        setPersonalityInsights(insightsRes.data);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    if (!showOnboarding) {
      loadInitialData();
    }
  }, [showOnboarding]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (activeSection === 'chat') {
          e.preventDefault();
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isRecording, activeSection]);

  // Enhanced mobile microphone functionality
  const startRecording = async () => {
    try {
      console.log('MOBILE MIC - Starting voice recording...');
      
      // Detect mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('MOBILE MIC - Mobile device detected:', isMobile);
      
      // Mobile-optimized audio settings
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: isMobile ? 22050 : 44100,
          channelCount: 1
        }
      };

      console.log('MOBILE MIC - Requesting microphone permission...');
      setInput('🎤 Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      console.log('MOBILE MIC - Microphone access granted');
      
      setInput('🎤 Recording...');
      setIsRecording(true);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('MOBILE MIC - Audio chunk received:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MOBILE MIC - Recording stopped. Total chunks:', chunksRef.current.length);
        
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { 
            type: options.mimeType || 'audio/webm' 
          });
          
          console.log('MOBILE MIC - Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          if (audioBlob.size > 500) {
            setInput('🎤 Processing speech...');
            sendAudioToWhisper(audioBlob);
          } else {
            console.log('MOBILE MIC - Audio blob too small');
            setInput('🎤 No speech detected. Please speak clearly and try again.');
            setTimeout(() => setInput(''), 3000);
          }
        } else {
          console.log('MOBILE MIC - No audio data captured');
          setInput('🎤 Recording failed. Please check microphone permissions.');
          setTimeout(() => setInput(''), 3000);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start(250);
      console.log('MOBILE MIC - Recording started successfully');
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('MOBILE MIC - Recording failed:', error);
      setIsRecording(false);
      
      if ((error as any).name === 'NotAllowedError') {
        setInput('🎤 Microphone permission denied. Please allow access and try again.');
      } else if ((error as any).name === 'NotFoundError') {
        setInput('🎤 No microphone found. Please check your device settings.');
      } else {
        setInput('🎤 Recording failed. Please refresh and try again.');
      }
      setTimeout(() => setInput(''), 4000);
    }
  };

  const stopRecording = () => {
    console.log('MOBILE MIC - Stopping recording...');
    setIsRecording(false);
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      console.log('MOBILE MIC - Sending audio to Whisper API...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('MOBILE MIC - Transcription received:', data.text);
        setInput(data.text || '');
      } else {
        console.error('MOBILE MIC - Transcription failed');
        setInput('🎤 Transcription failed. Please try typing your message.');
        setTimeout(() => setInput(''), 3000);
      }
    } catch (error) {
      console.error('MOBILE MIC - Transcription error:', error);
      setInput('🎤 Transcription service unavailable. Please try typing.');
      setTimeout(() => setInput(''), 3000);
    } finally {
      setLoading(false);
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
      const response = await axios.post('/api/chat', {
        message: input,
        personalityMode: personalityMode
      });

      // Check for crisis detection
      if (response.data.crisisDetected) {
        setCrisisAlert(response.data.crisisData);
        setShowCrisisAlert(true);
      }

      const botMessage: Message = {
        sender: 'bot',
        text: response.data.message,
        time: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Generate and play audio response
      if (audioEnabled && selectedReflectionVoice) {
        try {
          const audioResponse = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: response.data.message,
              voiceId: selectedReflectionVoice
            })
          });

          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setLastBotAudio(audioUrl);

            if (audioEnabled) {
              const audio = new Audio(audioUrl);
              audio.volume = 1.0;
              audio.play().catch(error => {
                console.log('Audio playback failed:', error);
                setPendingAudio(audioUrl);
              });
            } else {
              setPendingAudio(audioUrl);
            }
          }
        } catch (audioError) {
          console.error('Audio generation failed:', audioError);
        }
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
      setLoading(false);
    }
  };

  const enableAudio = () => {
    setAudioEnabled(true);
    
    if (pendingAudio) {
      const audio = new Audio(pendingAudio);
      audio.volume = 1.0;
      audio.play();
      setPendingAudio(null);
    }
  };

  const refreshPersonalityInsights = async () => {
    try {
      const response = await axios.get('/api/personality-insights');
      setPersonalityInsights(response.data);
    } catch (error) {
      console.error('Failed to refresh personality insights:', error);
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

  const resetBot = async () => {
    if (confirm('This will completely reset the bot and clear ALL data including your personality profile, memories, and conversation history. You will need to enter your name and retake the personality quiz. Continue?')) {
      try {
        // Clear server-side data
        await axios.post('/api/clear-memories', { userId: 1 });
        
        // Clear client-side data
        setMessages([]);
        setPersonalityInsights(null);
        setBotStats({ level: 1, stage: 'Infant', wordsLearned: 0 });
        localStorage.clear();
        
        // Trigger onboarding flow
        setShowOnboarding(true);
        setActiveSection('home');
      } catch (error) {
        console.error('Bot reset failed:', error);
        alert('Failed to reset bot. Please try again.');
      }
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <DashboardHome 
            botStats={botStats}
            goals={goals}
            dailyReflection={dailyReflection}
            onNavigate={handleSectionChange}
          />
        );

      case 'chat':
        return (
          <div className="flex flex-col h-full">
            {/* Compact Welcome Section for Mobile */}
            <div className="p-3 text-center mobile-welcome-shift" style={{ backgroundColor: 'var(--soft-blue)' }}>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <img src={traiLogo} alt="TrAI Logo" className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>TrAI</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                "Reflect. Refine. Rise."
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
                  <div className="max-w-[80%] p-3 rounded-2xl rounded-bl-md shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
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

            {/* Enhanced Mobile Chat Input */}
            <div className="border-t p-4" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--gentle-lavender-dark)' }}>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 pr-16 rounded-2xl border text-sm"
                    style={{ 
                      borderColor: 'var(--gentle-lavender-dark)',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      console.log('MOBILE MIC - Touch start detected');
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      console.log('MOBILE MIC - Touch end detected');
                      // Use a small delay to ensure the click handler doesn't interfere
                      setTimeout(() => {
                        if (isRecording) {
                          stopRecording();
                        } else {
                          startRecording();
                        }
                      }, 50);
                    }}
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all touch-manipulation"
                    style={{ 
                      backgroundColor: isRecording ? '#EF4444' : 'var(--soft-blue-dark)',
                      color: 'white',
                      animation: isRecording ? 'pulse 1s infinite' : 'none',
                      minWidth: '40px',
                      minHeight: '40px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    title={isRecording ? "Stop Recording" : "Start Voice Recording"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-2xl transition-all disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--soft-blue-dark)',
                    color: 'white'
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'reflect':
        return (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Personality Insights</h2>
              <button
                onClick={refreshPersonalityInsights}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh insights"
              >
                <RotateCcw className="w-5 h-5" style={{ color: 'var(--soft-blue-dark)' }} />
              </button>
            </div>
            
            {personalityInsights ? (
              <div className="space-y-4">
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Communication Style</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {personalityInsights.communicationStyle || 'Analyzing your communication patterns...'}
                  </p>
                </div>

                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Insights</h3>
                  <div className="space-y-2">
                    {personalityInsights.insights && personalityInsights.insights.length > 0 ? (
                      personalityInsights.insights.map((insight: any, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--soft-blue-dark)' }}></div>
                          <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Continue conversations to discover more insights about yourself.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Personality Traits</h3>
                  <div className="space-y-2">
                    {personalityInsights.traits && personalityInsights.traits.length > 0 ? (
                      personalityInsights.traits.map((trait: any, index: number) => (
                        <div key={index} className="inline-block">
                          <span className="px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2 inline-block" 
                                style={{ backgroundColor: 'var(--pale-green)', color: 'var(--text-primary)' }}>
                            {trait}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your unique traits will appear as we learn more about you.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Interests & Values</h3>
                  <div className="space-y-2">
                    {personalityInsights.interests && personalityInsights.interests.length > 0 ? (
                      personalityInsights.interests.map((interest: any, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 mt-0.5" style={{ color: 'var(--soft-blue-dark)' }} />
                          <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{interest}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share more about what matters to you to see your interests reflected here.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--soft-blue-dark)' }} />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Building Your Profile</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Start chatting to help me learn about your unique personality
                </p>
              </div>
            )}
          </div>
        );

      case 'daily':
        return (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Wellness</h2>

            {/* Zodiac Selection */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Personalize Your Experience</h3>
              <select
                value={selectedZodiacSign}
                onChange={(e) => handleZodiacChange(e.target.value)}
                className="w-full p-3 rounded-lg border text-sm"
                style={{ 
                  borderColor: 'var(--gentle-lavender-dark)',
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">Select Your Zodiac Sign</option>
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

            {/* Daily Affirmation */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--pale-green)' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Sun className="w-5 h-5" style={{ color: 'var(--soft-blue-dark)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Affirmation</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {dailyAffirmation || 'Loading your daily affirmation...'}
              </p>
            </div>

            {/* Daily Horoscope */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5" style={{ color: 'var(--soft-blue-dark)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {zodiacSign ? `${zodiacSign} Horoscope` : 'Daily Horoscope'}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {dailyHoroscope || 'Select your zodiac sign to see your personalized horoscope.'}
              </p>
            </div>
          </div>
        );

      case 'mood':
        return <MoodTracker />;
      case 'memory':
        return <MemoryDashboard />;
      case 'journal':
        return <JournalDashboard userId="1" />;
      case 'therapist':
        return <TherapistPortal userId="1" />;
      case 'achievements':
        return <AchievementDashboard userId="1" />;
      case 'community':
        return <CommunityPortal userId="1" />;
      case 'health':
        return <HealthDashboard />;
      case 'vr':
        return <VRTherapyDashboard />;
      case 'wellness-rewards':
        return <EnhancedGamificationDashboard />;
      case 'ai-intelligence':
        return <EmotionalIntelligenceDashboard />;
      case 'ai-performance':
        return <AiPerformanceMonitoringDashboard />;
      case 'privacy':
        return <PrivacyComplianceDashboard />;
      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>
            
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Voice & Audio</h3>
                <VoiceSelector
                  selectedVoice={selectedReflectionVoice}
                  onVoiceChange={(voice) => setSelectedReflectionVoice(voice)}
                  audioEnabled={audioEnabled}
                  onEnableAudio={enableAudio}
                />
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Profile Management</h3>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full p-3 rounded-lg text-left transition-colors"
                  style={{ backgroundColor: 'var(--pale-green)', color: 'var(--text-primary)' }}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Retake Personality Quiz</div>
                      <div className="text-sm opacity-75">Update your personality profile</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (confirm('This will clear all conversation history. Continue?')) {
                        setMessages([]);
                        localStorage.clear();
                      }
                    }}
                    className="w-full p-3 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: 'var(--gentle-lavender)', color: 'var(--text-primary)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Clear Chat History</div>
                        <div className="text-sm opacity-75">Clear conversations only</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={resetBot}
                    className="w-full p-3 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: 'var(--surface-danger)', color: 'white' }}
                  >
                    <div className="flex items-center space-x-3">
                      <RotateCcw className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Reset Bot Completely</div>
                        <div className="text-sm opacity-75">Start fresh with new name and personality quiz</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>App Information</h3>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Build:</strong> Therapeutic AI Assistant</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <DashboardHome 
            botStats={botStats}
            goals={goals}
            dailyReflection={dailyReflection}
            onNavigate={handleSectionChange}
          />
        );
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-primary)' }}>
        <OnboardingQuiz onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-primary)' }}>
      <div className="flex-1 overflow-hidden">
        {renderActiveSection()}
      </div>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="grid grid-cols-4 border-t" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--gentle-lavender-dark)' }}>
          {/* Therapy Category */}
          <div className="p-2">
            <button
              onClick={() => setActiveSection('chat')}
              className={`w-full p-3 rounded-xl transition-all text-center ${
                activeSection === 'chat' ? 'scale-105' : ''
              }`}
              style={{ 
                backgroundColor: activeSection === 'chat' ? 'var(--soft-blue-dark)' : 'transparent',
                color: activeSection === 'chat' ? 'white' : 'var(--text-primary)'
              }}
            >
              <MessageCircle className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Therapy</span>
            </button>
          </div>

          {/* Wellness Category */}
          <div className="p-2">
            <button
              onClick={() => setActiveSection('mood')}
              className={`w-full p-3 rounded-xl transition-all text-center ${
                activeSection === 'mood' ? 'scale-105' : ''
              }`}
              style={{ 
                backgroundColor: activeSection === 'mood' ? 'var(--soft-blue-dark)' : 'transparent',
                color: activeSection === 'mood' ? 'white' : 'var(--text-primary)'
              }}
            >
              <Heart className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Wellness</span>
            </button>
          </div>

          {/* Community Category */}
          <div className="p-2">
            <button
              onClick={() => setActiveSection('journal')}
              className={`w-full p-3 rounded-xl transition-all text-center ${
                activeSection === 'journal' ? 'scale-105' : ''
              }`}
              style={{ 
                backgroundColor: activeSection === 'journal' ? 'var(--soft-blue-dark)' : 'transparent',
                color: activeSection === 'journal' ? 'white' : 'var(--text-primary)'
              }}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Journal</span>
            </button>
          </div>

          {/* Advanced Category */}
          <div className="p-2">
            <button
              onClick={() => setActiveSection('reflect')}
              className={`w-full p-3 rounded-xl transition-all text-center ${
                activeSection === 'reflect' ? 'scale-105' : ''
              }`}
              style={{ 
                backgroundColor: activeSection === 'reflect' ? 'var(--soft-blue-dark)' : 'transparent',
                color: activeSection === 'reflect' ? 'white' : 'var(--text-primary)'
              }}
            >
              <Brain className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crisis Alert Modal */}
      {showCrisisAlert && crisisAlert && (
        <CrisisAlert
          alert={crisisAlert}
          onClose={() => setShowCrisisAlert(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}