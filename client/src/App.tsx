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

// Navigation Categories and Sections
const navigationCategories = [
  { id: 'home', label: 'Home', icon: Home, color: 'var(--soft-blue-dark)' },
  { id: 'wellness', label: 'Wellness', icon: Heart, color: 'var(--pale-green-dark)' },
  { id: 'progress', label: 'Progress', icon: Target, color: 'var(--gentle-lavender-dark)' },
  { id: 'tools', label: 'Tools', icon: Brain, color: 'var(--soft-blue-dark)' },
  { id: 'more', label: 'More', icon: Menu, color: 'var(--text-secondary)' }
];

const navigationSections = {
  home: [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
  ],
  wellness: [
    { id: 'daily', label: 'Daily', icon: Sun },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'journal', label: 'Journal', icon: FileText }
  ],
  progress: [
    { id: 'progress', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Badges', icon: Award },
    { id: 'analytics', label: 'Reports', icon: BarChart }
  ],
  tools: [
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'reflect', label: 'Reflect', icon: Lightbulb },
    { id: 'voice', label: 'Voice', icon: Mic }
  ],
  more: [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'therapist', label: 'Therapist', icon: UserCheck }
  ]
};

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
            {botStats?.level || 1}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Current Level</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {botStats?.stage || 'Infant'}
          </div>
        </div>
        
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--soft-blue-dark)' }}>
            {botStats?.wordsLearned || 0}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Words Learned</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Growing vocabulary
          </div>
        </div>
      </div>

      {/* Quick Goals Overview */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'var(--surface-secondary)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Today's Goals</h3>
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => {
            const percentage = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {goal.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: goal.color === 'blue' ? 'var(--soft-blue-dark)' : 
                                       goal.color === 'green' ? 'var(--pale-green-dark)' : 
                                       'var(--gentle-lavender-dark)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => onNavigate('progress')}
          className="w-full mt-3 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--soft-blue-dark)',
            color: 'white'
          }}
        >
          View All Goals
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate('chat')}
          className="rounded-2xl p-4 text-left transition-all"
          style={{ backgroundColor: 'var(--soft-blue-light)' }}
        >
          <MessageCircle className="w-8 h-8 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Start Chat</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Begin conversation</div>
        </button>

        <button
          onClick={() => onNavigate('mood')}
          className="rounded-2xl p-4 text-left transition-all"
          style={{ backgroundColor: 'var(--pale-green-light)' }}
        >
          <Heart className="w-8 h-8 mb-2" style={{ color: 'var(--pale-green-dark)' }} />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Track Mood</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>How are you feeling?</div>
        </button>

        <button
          onClick={() => onNavigate('journal')}
          className="rounded-2xl p-4 text-left transition-all"
          style={{ backgroundColor: 'var(--gentle-lavender-light)' }}
        >
          <FileText className="w-8 h-8 mb-2" style={{ color: 'var(--gentle-lavender-dark)' }} />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Journal</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Write your thoughts</div>
        </button>

        <button
          onClick={() => onNavigate('daily')}
          className="rounded-2xl p-4 text-left transition-all"
          style={{ backgroundColor: 'var(--soft-blue-light)' }}
        >
          <Sun className="w-8 h-8 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daily</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Inspiration & horoscope</div>
        </button>
      </div>

      {/* Daily Reflection */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
        <div className="flex items-center mb-3">
          <Brain className="w-5 h-5 mr-2" style={{ color: 'var(--soft-blue-dark)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Reflection</h3>
        </div>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          {dailyReflection}
        </p>
        <button
          onClick={() => onNavigate('reflect')}
          className="w-full px-4 py-2 rounded-xl text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--gentle-lavender-dark)',
            color: 'white'
          }}
        >
          View Full Reflection
        </button>
      </div>
    </div>
  );
};


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
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('home');
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
  
  // Crisis detection state
  const [crisisAlert, setCrisisAlert] = useState<any>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  
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

  // Grouped navigation categories for better mobile UX
  const navigationCategories = [
    {
      id: 'therapy',
      label: 'Therapy',
      icon: MessageCircle,
      color: 'var(--soft-blue-dark)',
      sections: [
        { id: 'chat', icon: MessageCircle, label: 'Chat' },
        { id: 'mood', icon: Heart, label: 'Mood' },
        { id: 'journal', icon: FileText, label: 'Journal' },
        { id: 'therapist', icon: UserCheck, label: 'Therapist' }
      ]
    },
    {
      id: 'wellness',
      label: 'Wellness',
      icon: Sun,
      color: 'var(--pale-green-dark)',
      sections: [
        { id: 'daily', icon: Sun, label: 'Daily' },
        { id: 'vr-therapy', icon: Headphones, label: 'VR Therapy' },
        { id: 'health', icon: Activity, label: 'Health' },
        { id: 'reflect', icon: Brain, label: 'Reflect' }
      ]
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      color: 'var(--gentle-lavender-dark)',
      sections: [
        { id: 'community', icon: Users, label: 'Community' },
        { id: 'achievements', icon: Award, label: 'Achievements' },
        { id: 'wellness-rewards', icon: Gift, label: 'Rewards' },
        { id: 'progress', icon: Target, label: 'Progress' }
      ]
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Zap,
      color: 'var(--soft-blue-dark)',
      sections: [
        { id: 'emotional-intelligence', icon: Zap, label: 'AI Intelligence' },
        { id: 'ai-monitoring', icon: Shield, label: 'AI Monitor' },
        { id: 'privacy', icon: Lock, label: 'Privacy' },
        { id: 'memory', icon: BookOpen, label: 'Memory' },
        { id: 'settings', icon: User, label: 'Settings' }
      ]
    }
  ];

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Get current sections from selected category
  const getCurrentSections = () => {
    const category = navigationCategories.find(cat => cat.id === selectedCategory);
    return category ? category.sections : navigationCategories[0].sections;
  };

  // Update category when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Auto-update category based on section
    for (const category of navigationCategories) {
      if (category.sections.some(s => s.id === section)) {
        setSelectedCategory(category.id);
        break;
      }
    }
  };

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
      console.log('🎤 Starting audio recording...');
      
      // Request microphone with basic settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Create audio context for better audio handling
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      
      console.log('Audio context sample rate:', audioContext.sampleRate);
      console.log('Microphone track settings:', stream.getAudioTracks()[0].getSettings());
      
      // Use the most compatible format
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('📡 Audio chunk received:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped. Total chunks:', chunksRef.current.length);
        
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { 
            type: options.mimeType || 'audio/webm' 
          });
          
          console.log('🎵 Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type,
            durationEstimate: Math.round(audioBlob.size / 16000) + 's'
          });
          
          if (audioBlob.size > 500) {
            sendAudioToWhisper(audioBlob);
          } else {
            console.log('⚠️ Audio blob too small, likely no speech');
            setInput('No speech detected. Please speak clearly into your microphone.');
            setTimeout(() => setInput(''), 3000);
          }
        } else {
          console.log('❌ No audio data captured');
          setInput('Recording failed. Please check microphone permissions and try again.');
          setTimeout(() => setInput(''), 3000);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start(250); // Smaller chunks for better responsiveness
      setIsRecording(true);
      console.log('✅ Recording started successfully');
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('❌ Recording failed:', error);
      
      if ((error as any).name === 'NotAllowedError') {
        setInput('Microphone permission denied. Please allow microphone access and try again.');
      } else if ((error as any).name === 'NotFoundError') {
        setInput('No microphone found. Please check your device settings.');
      } else {
        setInput('Recording failed. Please refresh the page and try again.');
      }
      setTimeout(() => setInput(''), 4000);
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
      console.log('=== AUDIO CAPTURE ANALYSIS ===');
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      
      // Check if we actually captured meaningful audio data
      if (audioBlob.size < 1000) {
        console.log('⚠️ Audio blob too small - no speech detected');
        setInput('No audio captured. Please speak louder or hold the microphone button longer.');
        setTimeout(() => setInput(''), 3000);
        return;
      }
      
      // Show loading state
      setInput('Transcribing audio...');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Handle both successful transcriptions and graceful fallbacks
      if (response.data.text) {
        setInput(response.data.text);
        
        // If it's a fallback message, clear it after a moment so user can type
        if (response.data.fallback) {
          setTimeout(() => {
            setInput('');
          }, 3000);
        }
      } else {
        setInput('No speech detected. Please try again or type your message.');
        setTimeout(() => setInput(''), 3000);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      
      // Handle any remaining error cases with graceful messages
      setInput('Voice input received. Please type your message or try again.');
      setTimeout(() => setInput(''), 3000);
    } finally {
      setLoading(false);
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
        personalityMode: personalityMode,
        sessionId: `chat-${Date.now()}`
      });
      
      const botResponse = res.data.response;
      const botMessage = {
        sender: 'bot' as const,
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Handle crisis detection response
      if (res.data.crisisAnalysis && res.data.crisisAnalysis.riskLevel !== 'none' && res.data.crisisAnalysis.riskLevel !== 'low') {
        setCrisisAlert(res.data.crisisAnalysis);
        setShowCrisisAlert(true);
      }
      
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

            {/* Chat Input - Fixed at bottom */}
            <div className="border-t p-4" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--gentle-lavender-dark)' }}>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 pr-12 rounded-2xl border text-sm"
                    style={{ 
                      borderColor: 'var(--gentle-lavender-dark)',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all"
                    style={{ 
                      backgroundColor: isRecording ? '#EF4444' : 'var(--soft-blue-dark)',
                      color: 'white',
                      animation: isRecording ? 'pulse 1s infinite' : 'none'
                    }}
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

      case 'journal':
        return (
          <div className="h-full">
            <JournalDashboard userId={1} />
          </div>
        );

      case 'therapist':
        return (
          <div className="h-full">
            <TherapistPortal userId="1" />
          </div>
        );

      case 'community':
        return (
          <div className="h-full">
            <CommunityPortal userId={1} />
          </div>
        );

      case 'achievements':
        return (
          <div className="p-4">
            <AchievementDashboard userId={1} />
          </div>
        );

      case 'health':
        return (
          <div className="h-full">
            <HealthDashboard />
          </div>
        );

      case 'vr-therapy':
        return (
          <div className="h-full">
            <VRTherapyDashboard userId={1} />
          </div>
        );

      case 'wellness-rewards':
        return (
          <div className="h-full">
            <EnhancedGamificationDashboard />
          </div>
        );

      case 'emotional-intelligence':
        return (
          <div className="h-full">
            <EmotionalIntelligenceDashboard />
          </div>
        );

      case 'ai-monitoring':
        return (
          <div className="h-full">
            <AiPerformanceMonitoringDashboard />
          </div>
        );

      case 'privacy':
        return (
          <div className="h-full">
            <PrivacyComplianceDashboard />
          </div>
        );

      case 'memory':
        return (
          <div className="p-4">
            <MemoryDashboard userId={1} />
          </div>
        );

      case 'mood':
        return (
          <div className="p-4">
            <MoodTracker userId={1} />
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

      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>
            
            {/* Profile Management */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Profile</h3>
              <button
                onClick={() => {
                  localStorage.removeItem('onboardingCompleted');
                  window.location.reload();
                }}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm"
                style={{ 
                  backgroundColor: 'var(--soft-blue-dark)',
                  color: 'white'
                }}
              >
                Retake Personality Quiz
              </button>
            </div>

            {/* Data Management */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data Management</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMessages([]);
                  }}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: '#F59E0B',
                    color: 'white'
                  }}
                >
                  Clear Chat History
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.post('/api/clear-memories', { userId: 1 });
                      setMessages([]);
                    } catch (error) {
                      console.error('Failed to clear memories:', error);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: '#EF4444',
                    color: 'white'
                  }}
                >
                  Reset Bot Memory
                </button>
              </div>
            </div>

            {/* App Information */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>About TraI</h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your AI companion for mental wellness and self-reflection.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Version 2.0 - Enhanced with crisis detection and emotional intelligence
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col h-full">
            {/* Mobile-Optimized Dashboard Home */}
            <div className="flex-1 overflow-y-auto">
              <DashboardHome 
                botStats={botStats} 
                goals={goals} 
                dailyReflection={dailyReflection}
                onNavigate={handleSectionChange}
              />
            </div>
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
        <div className="fixed bottom-20 left-0 right-0 bg-white shadow-lg z-50 border-t mobile-input-shift" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
          {/* Voice Selector */}
          <div className="px-2 pt-2 pb-1 mobile-voice-shift">
            <select
              value={selectedReflectionVoice}
              onChange={(e) => setSelectedReflectionVoice(e.target.value)}
              className="w-full px-2 py-1 bg-white border rounded-lg text-xs font-medium"
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
          <div className="flex items-stretch gap-1 pl-0 pr-1 pb-3">
            <div className="flex-1 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                className="w-full p-2 text-sm rounded-l-lg border-r-0 border focus:outline-none focus:ring-0"
                style={{ 
                  borderColor: 'var(--gentle-lavender-dark)',
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-3 border-l-0 border border-r-0 bg-blue-100 flex items-center justify-center transition-all ${
                  isRecording ? 'animate-pulse bg-red-500' : ''
                }`}
                style={{ 
                  borderColor: 'var(--gentle-lavender-dark)',
                  backgroundColor: isRecording ? '#EF4444' : '#E0F2FE',
                  color: isRecording ? 'white' : '#0369A1'
                }}
                title={isRecording ? "Stop Recording" : "Start Voice Recording"}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-3 rounded-r-lg border transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: '#4F46E5',
                  borderColor: '#4338CA',
                  color: 'white'
                }}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Grouped categories */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg mobile-nav z-50" style={{ borderTop: '1px solid var(--gentle-lavender)' }}>
          {/* Category Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--gentle-lavender)' }}>
            {navigationCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isActiveCategory = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex-1 flex flex-col items-center py-2 px-1 transition-all"
                  style={{
                    backgroundColor: isActiveCategory ? 'var(--soft-blue-light)' : 'transparent',
                    color: isActiveCategory ? category.color : 'var(--text-secondary)'
                  }}
                >
                  <CategoryIcon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Section Buttons for Selected Category */}
          <div className="flex justify-center py-2 px-2">
            <div className="flex w-full max-w-7xl">
              {getCurrentSections().map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className="flex-1 flex flex-col items-center py-2 px-2 rounded-xl transition-all mx-1"
                    style={{
                      backgroundColor: isActive ? 'var(--soft-blue-light)' : 'transparent',
                      color: isActive ? 'var(--soft-blue-dark)' : 'var(--text-secondary)',
                      minWidth: '0'
                    }}
                  >
                    <IconComponent className="w-6 h-6 mb-1 flex-shrink-0" />
                    <span className="text-xs font-medium truncate w-full text-center">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Crisis Alert Modal */}
        {showCrisisAlert && crisisAlert && (
          <CrisisAlert
            crisisAnalysis={crisisAlert}
            onClose={() => setShowCrisisAlert(false)}
            onGetHelp={() => {
              // Open mental health resources or crisis support
              window.open('https://www.mentalhealth.gov/get-help/immediate-help', '_blank');
              setShowCrisisAlert(false);
            }}
          />
        )}
      </div>
    </QueryClientProvider>
  );
};

export default function App() {
  return <AppLayout />;
}