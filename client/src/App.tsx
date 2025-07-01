import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart, BarChart3, Gift, Headphones, Shield, X } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';
import TherapeuticJournal from './components/TherapeuticJournal';
import PersonalityReflection from './components/PersonalityReflection';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import WellnessRewards from './components/WellnessRewards';
import CommunitySupport from './components/CommunitySupport';
import AdaptiveLearning from './components/AdaptiveLearning';
import AdaptiveTherapyPlan from './components/AdaptiveTherapyPlan';
import AgentSystem from './components/AgentSystem';
import VRTherapy from './components/VRTherapy';
import HealthIntegration from './components/HealthIntegration';
import PrivacyCompliance from './components/PrivacyCompliance';
import TherapistPortal from './components/TherapistPortal';
import Horoscope from './components/Horoscope';
import DailyAffirmation from './components/DailyAffirmation';
import PWAManager from './components/PWAManager';
import MicroSession from './components/MicroSession';
import TherapeuticAnalytics from './components/TherapeuticAnalytics';
import { EHRIntegration } from './components/EHRIntegration';
import PrivacyPolicy from './components/PrivacyPolicy';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const traiLogo = '/TrAI-Logo.png';

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
  
  // Debug logging for activeSection changes
  useEffect(() => {
    console.log('Active section changed to:', activeSection);
  }, [activeSection]);

  const [isRecording, setIsRecording] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [input, setInput] = useState('');
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<string>('');
  const [showReflection, setShowReflection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('hope');
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState('hope');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState('Today is a new opportunity for growth and healing.');
  const [horoscopeText, setHoroscopeText] = useState<string>('');
  const [userZodiacSign, setUserZodiacSign] = useState<string>('aries');
  const [showMicroSession, setShowMicroSession] = useState(false);
  const [microSessionType, setMicroSessionType] = useState<'journal' | 'mood' | 'gratitude'>('journal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get('/api/user/current');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Keyboard support for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSettings]);

  useEffect(() => {
    fetchBotStats();
    fetchDailyAffirmation();
    fetchHoroscope();
    fetchWeeklySummary();
    loadZodiacData();
    
    if (user && user.hasCompletedOnboarding) {
      // User is onboarded, proceed with app
    } else {
      setShowOnboarding(true);
    }

    // PWA notification event handlers
    const handleMoodTracking = (event: any) => {
      setMicroSessionType('mood');
      setShowMicroSession(true);
    };

    const handleVoiceJournal = (event: any) => {
      setMicroSessionType('journal');
      setShowMicroSession(true);
    };

    const handleDailyAffirmation = (event: any) => {
      fetchDailyAffirmation();
      // Could also show affirmation modal here
    };

    window.addEventListener('openMoodTracking', handleMoodTracking);
    window.addEventListener('openVoiceJournal', handleVoiceJournal);
    window.addEventListener('showDailyAffirmation', handleDailyAffirmation);

    return () => {
      window.removeEventListener('openMoodTracking', handleMoodTracking);
      window.removeEventListener('openVoiceJournal', handleVoiceJournal);
      window.removeEventListener('showDailyAffirmation', handleDailyAffirmation);
    };
  }, [user]);

  const fetchBotStats = async () => {
    try {
      const response = await fetch('/api/bot-stats');
      if (response.ok) {
        const data = await response.json();
        setBotStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch bot stats:', error);
    }
  };

  const fetchDailyAffirmation = async () => {
    try {
      const response = await fetch('/api/daily-affirmation');
      if (response.ok) {
        const data = await response.json();
        setDailyAffirmation(data.affirmation || 'Stay positive and focused today.');
      }
    } catch (error) {
      console.error('Failed to fetch daily affirmation:', error);
      setDailyAffirmation('Today is a new opportunity to grow and learn.');
    }
  };

  const fetchHoroscope = async (sign: string = userZodiacSign) => {
    // Skip external API due to CORS restrictions, use OpenAI-generated horoscope directly
    try {
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sign })
      });

      if (response.ok) {
        const data = await response.json();
        setHoroscopeText(data.horoscope);
      } else {
        setHoroscopeText('Your stars are aligning for a day of growth and positive energy.');
      }
    } catch (error) {
      setHoroscopeText('Today brings opportunities for reflection and personal development.');
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch('/api/weekly-summary');
      if (response.ok) {
        const data = await response.json();
        setWeeklySummary(data.summary || 'Your therapeutic journey continues to evolve positively.');
      }
    } catch (error) {
      console.error('Failed to fetch weekly summary:', error);
      setWeeklySummary('Focus on your mental wellness and personal growth this week.');
    }
  };

  const loadZodiacData = async () => {
    try {
      const response = await fetch('/api/horoscope/aries');
      if (response.ok) {
        const data = await response.json();
        setWeeklySummary(data.horoscope || 'Today brings new opportunities for growth.');
      }
    } catch (error) {
      console.error('Failed to load horoscope:', error);
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          voice: selectedVoice
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          sender: 'bot',
          text: data.message,
          time: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, botMessage]);

        // Track emotional tone analytics
        try {
          await fetch('/api/analytics/emotional-tone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 1,
              message: input,
              sessionId: Date.now().toString()
            })
          });
        } catch (error) {
          console.error('Analytics tracking failed:', error);
        }

        // Check for potential agent handoff
        try {
          const handoffResponse = await fetch('/api/agents/analyze-handoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 1,
              message: input,
              conversationHistory: messages.slice(-5) // Send last 5 messages for context
            })
          });

          if (handoffResponse.ok) {
            const handoffData = await handoffResponse.json();
            
            if (handoffData.shouldHandoff && handoffData.confidence > 0.7 && handoffData.handoffMessage) {
              // Add agent handoff suggestion message
              const handoffMessage: Message = {
                sender: 'bot',
                text: handoffData.handoffMessage + "\n\n*Click 'Specialists' in the navigation to connect with this specialist.*",
                time: new Date().toLocaleTimeString()
              };
              
              setMessages(prev => [...prev, handoffMessage]);
            }
          }
        } catch (error) {
          console.error('Agent handoff analysis failed:', error);
        }

        // ElevenLabs Carla voice playback with aggressive activation
        if (data.audioUrl && data.audioUrl.length > 1000) {
          console.log(`ElevenLabs ${data.voiceUsed || 'Carla'} voice detected: ${data.audioUrl.length} characters`);
          
          const playElevenLabsAudio = async () => {
            try {
              // Create audio with proper MIME type
              const audioBlob = new Blob([
                Uint8Array.from(atob(data.audioUrl), c => c.charCodeAt(0))
              ], { type: 'audio/mpeg' });
              
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              // Configure audio for immediate playback
              audio.preload = 'auto';
              audio.volume = 0.8;
              
              // Play with multiple fallback attempts
              try {
                await audio.play();
                console.log('✓ ElevenLabs Carla voice played successfully');
                
                // Cleanup URL after playing
                audio.addEventListener('ended', () => {
                  URL.revokeObjectURL(audioUrl);
                });
                
              } catch (playError) {
                console.log('Direct play blocked, setting up click trigger...');
                
                // Show user that audio is ready
                const audioReadyMessage = {
                  sender: 'bot' as const,
                  text: '🔊 Audio ready - click anywhere to hear Carla voice',
                  time: new Date().toLocaleTimeString()
                };
                setMessages(prev => [...prev, audioReadyMessage]);
                
                // Single click anywhere triggers audio
                const playOnClick = async () => {
                  try {
                    await audio.play();
                    console.log('✓ ElevenLabs Carla voice played after user interaction');
                    
                    // Remove the audio ready message
                    setMessages(prev => prev.filter(msg => msg.text !== audioReadyMessage.text));
                    
                  } catch (err) {
                    console.error('Audio play failed even with user gesture:', err);
                  }
                  
                  document.removeEventListener('click', playOnClick);
                  URL.revokeObjectURL(audioUrl);
                };
                
                document.addEventListener('click', playOnClick, { once: true });
              }
              
            } catch (error) {
              console.error('ElevenLabs audio processing failed:', error);
            }
          };
          
          // Execute audio playback
          playElevenLabsAudio();
          
        } else {
          console.log('No ElevenLabs audio received or audio data too short');
          if (data.error) {
            console.error('Server audio error:', data.error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Enhanced mobile audio constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      };

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Microphone access granted');

      // Check for MediaRecorder support with different MIME types
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      console.log('Using MIME type:', mimeType);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('Audio blob created:', audioBlob.size, 'bytes');
          await sendAudioToWhisper(audioBlob);
        } else {
          console.log('No audio data recorded');
          alert('No audio was recorded. Please try again.');
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Recording error occurred. Please try again.');
      };

      // Start recording with data collection interval
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      console.log('Recording started');

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Auto-stopping recording after 30 seconds');
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      const err = error as any;
      if (err?.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow microphone access and try again.');
      } else if (err?.name === 'NotFoundError') {
        alert('No microphone found. Please check your device.');
      } else {
        alert('Could not access microphone: ' + (err?.message || 'Unknown error'));
      }
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
      console.log('Sending audio to Whisper API...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      console.log('Transcription response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Transcription result:', data);
        if (data.text && data.text.trim()) {
          setInput(data.text.trim());
          console.log('Input set to:', data.text.trim());
        } else {
          console.log('Empty transcription result');
          alert('No speech detected. Please try speaking louder or closer to the microphone.');
        }
      } else {
        const errorData = await response.text();
        console.error('Transcription failed:', response.status, errorData);
        alert('Transcription service unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please check your internet connection and try again.');
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        // Chat is handled separately in the main layout now
        return null;

      case 'daily':
        return <PersonalityReflection userId={1} />;

      case 'journal':
        return (
          <TherapeuticJournal 
            userId={1} 
            onEntryCreated={(entry) => {
              console.log('New journal entry created:', entry);
            }}
          />
        );

      case 'memory':
        return <MemoryDashboard />;

      case 'analytics':
        return <AnalyticsDashboard userId={1} />;

      case 'rewards':
        return <WellnessRewards />;

      case 'community':
        return <CommunitySupport />;

      case 'adaptive':
        return <AdaptiveLearning />;

      case 'therapy-plans':
        return <AdaptiveTherapyPlan userId={1} onPlanUpdate={(plan) => console.log('Plan updated:', plan)} />;

      case 'agents':
        return <AgentSystem userId={1} />;

      case 'vr':
        return <VRTherapy />;

      case 'health':
        return <HealthIntegration />;

      case 'privacy':
        return <PrivacyCompliance />;

      case 'therapist':
        return <TherapistPortal />;

      case 'outcomes':
        return <TherapeuticAnalytics userId={1} />;

      case 'ehr':
        return <EHRIntegration />;

      case 'privacy-policy':
        return <PrivacyPolicy />;

      case 'voice':
        return (
          <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#5c6bc0]/30 backdrop-blur-sm rounded-2xl p-8 border border-[#7986cb]/30 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Voice Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/90 text-lg font-medium mb-4">Select AI Voice Companion</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'hope', name: 'Hope', description: 'Warm and encouraging voice for daily support' },
                        { id: 'james', name: 'James', description: 'Professional and calming therapeutic voice' },
                        { id: 'charlotte', name: 'Charlotte', description: 'Gentle and empathetic companion voice' },
                        { id: 'bronson', name: 'Bronson', description: 'Confident and reassuring wellness guide' }
                      ].map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedVoice === voice.id
                              ? 'border-white bg-white/20 shadow-lg scale-105'
                              : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-semibold text-lg">{voice.name}</h3>
                            {selectedVoice === voice.id && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <p className="text-white/80 text-sm">{voice.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <p className="text-white/70 text-sm">
                      Current voice: <span className="font-semibold text-white">{selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}</span>
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                      Voice changes will apply to all AI responses and wellness features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'horoscope':
        return <Horoscope onBack={() => setActiveSection('chat')} />;

      case 'affirmation':
        return <DailyAffirmation onBack={() => setActiveSection('chat')} />;

      case 'logo':
        return (
          <div className="h-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#5c6bc0]/30 backdrop-blur-sm rounded-2xl p-8 border border-[#7986cb]/30 shadow-lg text-center">
                <div className="mb-8">
                  <img src={traiLogo} alt="TrAI" className="h-32 w-auto mx-auto mb-6" />
                  <h1 className="text-4xl font-bold text-white mb-4">TrAI Mental Wellness</h1>
                  <p className="text-xl text-white/90 mb-6">AI Wellness Companion</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30">
                    <h3 className="text-lg font-semibold text-white mb-3">AI Capabilities</h3>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li>• OpenAI GPT-4o powered conversations</li>
                      <li>• ElevenLabs voice synthesis</li>
                      <li>• Personality mirroring & learning</li>
                      <li>• Crisis detection & intervention</li>
                      <li>• Wellness journal analysis</li>
                    </ul>
                  </div>

                  <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30">
                    <h3 className="text-lg font-semibold text-white mb-3">Wellness Features</h3>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li>• Mood tracking & analytics</li>
                      <li>• VR therapeutic experiences</li>
                      <li>• Community peer support</li>
                      <li>• Wearable device integration</li>
                      <li>• Privacy-first architecture</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1a237e]/50 rounded-xl p-6 border border-[#3949ab]/30">
                  <h3 className="text-lg font-semibold text-white mb-3">Your Progress</h3>
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{botStats?.stage || 'Wellness Companion'}</div>
                      <div className="text-sm text-white/60">Level {botStats?.level || 3}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">95%</div>
                      <div className="text-sm text-white/60">Wellness Score</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-white/60">
                    Your trusted AI companion for mental wellness and personal growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wellness Goals</h2>
            <div className="space-y-4">
              {[
                { name: 'Daily Mindfulness', current: 12, target: 21, color: 'bg-green-500' },
                { name: 'Anxiety Management', current: 8, target: 14, color: 'bg-blue-500' },
                { name: 'Social Connection', current: 3, target: 7, color: 'bg-purple-500' }
              ].map((goal, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                    <span className="text-sm text-gray-600">{goal.current}/{goal.target} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${goal.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
            <p className="text-gray-600">Select a section to get started</p>
          </div>
        );
    }
  };

  const onOnboardingComplete = () => {
    console.log('Onboarding completed');
  };

  const handleCompleteOnboarding = () => {
    onOnboardingComplete();
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#E6E6FA] to-[#ADD8E6]">
        <OnboardingQuiz onComplete={handleCompleteOnboarding} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* Mobile-Optimized Header */}
      <div className="bg-[#0a0e1a] p-2 md:p-4">
        {/* Mobile: Compact Header */}
        <div className="block md:hidden">
          {/* Top Row: Logo and Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <img src={traiLogo} alt="TrAI" className="h-10 w-auto" />
              <div>
                <p className="text-white font-bold text-lg">TraI</p>
                <p className="text-white/70 text-xs">Mental Wellness</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="text-right">
              <p className="text-white/90 text-sm font-medium">Level {botStats?.level || 3}</p>
              <p className="text-white/60 text-xs">{botStats?.stage || 'Wellness Companion'}</p>
            </div>
          </div>
          
          {/* Bottom Row: Quick Access */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveSection('horoscope')}
              className="flex-1 bg-purple-700/80 rounded-lg p-2 hover:bg-purple-600 transition-colors"
            >
              <div className="flex items-center justify-center space-x-1">
                <span className="text-lg">⭐</span>
                <span className="text-xs text-white font-medium">Horoscope</span>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveSection('affirmation')}
              className="flex-1 bg-purple-700/80 rounded-lg p-2 hover:bg-purple-600 transition-colors"
            >
              <div className="flex items-center justify-center space-x-1">
                <span className="text-lg">✨</span>
                <span className="text-xs text-white font-medium">Affirmation</span>
              </div>
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="flex-1 bg-purple-700/80 rounded-lg p-2 hover:bg-purple-600 transition-colors"
            >
              <div className="flex items-center justify-center space-x-1">
                <span className="text-lg">⚙️</span>
                <span className="text-xs text-white font-medium">Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Desktop: Original Layout */}
        <div className="hidden md:flex justify-center">
          <div className="grid grid-cols-3 gap-4 w-[1152px] h-[200px] -ml-[88px]">
            {/* Horoscope Section - Expanded */}
            <button 
              onClick={() => setActiveSection('horoscope')}
              className="bg-purple-700 rounded-lg p-6 flex flex-col hover:bg-purple-600 transition-colors cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-white mb-4 underline">Horoscope</h3>
              <p className="text-base text-white text-left leading-relaxed flex-1">
                {horoscopeText ? horoscopeText.substring(0, 200) + '...' : "Today brings opportunities for reflection and personal development. The cosmic energies align to support your mental wellness journey..."}
              </p>
              <p className="text-sm text-white/70 mt-4 font-semibold">Click to expand</p>
            </button>
            
            {/* Logo Section - Center */}
            <button 
              onClick={() => setActiveSection('logo')}
              className="bg-[#0a0e1a] rounded-lg p-6 flex flex-col items-center justify-center border-2 border-white hover:border-purple-400 transition-colors cursor-pointer"
            >
              <img src={traiLogo} alt="TrAI" className="h-48 w-auto mb-4 -mt-2.5" />
              <p className="text-lg text-white/70 font-bold">TraI Mental Wellness</p>
              <p className="text-sm text-white/50 mt-2">Click for more info</p>
            </button>
            
            {/* Affirmation Section - Expanded */}
            <button 
              onClick={() => setActiveSection('affirmation')}
              className="bg-purple-700 rounded-lg p-6 flex flex-col hover:bg-purple-600 transition-colors cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-white mb-4 underline">Affirmation</h3>
              <p className="text-base text-white text-left leading-relaxed flex-1">
                {dailyAffirmation.substring(0, 200)}...
              </p>
              <p className="text-sm text-white/70 mt-4 font-semibold">Click to here</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Mobile Responsive */}
      <div className="flex-1 flex flex-col md:flex-row bg-[#0a0e1a]">
        {/* Mobile Navigation - Separated User Features & Internal Tools */}
        <div className="md:hidden bg-[#1a237e] border-b border-white/20">
          {/* User Features Section */}
          <div className="border-b border-white/10 pb-2">
            <div className="text-white/60 text-xs font-medium px-3 pt-2 pb-1">Wellness Features</div>
            <div className="grid grid-cols-4 gap-2 px-3">
              {[
                { id: 'chat', label: 'Home', icon: '🏠' },
                { id: 'daily', label: 'Reflect', icon: '🧠' },
                { id: 'journal', label: 'Journal', icon: '📝' },
                { id: 'memory', label: 'Memory', icon: '🎯' },
                { id: 'analytics', label: 'Analytics', icon: '📊' },
                { id: 'voice', label: 'Voice', icon: '🎤' },
                { id: 'rewards', label: 'Rewards', icon: '🎁' },
                { id: 'community', label: 'Community', icon: '👥' },
                { id: 'vr', label: 'VR Therapy', icon: '🥽' },
                { id: 'health', label: 'Health', icon: '💗' },
                { id: 'agents', label: 'Specialists', icon: '🧩' },
                { id: 'adaptive', label: 'AI Learn', icon: '🤖' },
                { id: 'therapy-plans', label: 'Plans', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl font-medium transition-all touch-target ${
                    activeSection === tab.id
                      ? 'bg-green-500 text-white shadow-lg transform scale-95 ring-2 ring-white'
                      : 'bg-purple-800/60 text-white/80 hover:bg-purple-700 active:scale-95'
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs leading-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Internal Tools Section */}
          <div className="pt-2">
            <div className="text-white/60 text-xs font-medium px-3 pb-1">Professional Tools</div>
            <div className="grid grid-cols-4 gap-2 px-3 pb-2">
              {[
                { id: 'therapist', label: 'Therapist', icon: '🩺' },
                { id: 'privacy', label: 'Privacy', icon: '🔒' },
                { id: 'outcomes', label: 'Outcomes', icon: '📈' },
                { id: 'ehr', label: 'EHR', icon: '🏥' },
                { id: 'privacy-policy', label: 'Legal', icon: '📜' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl font-medium transition-all touch-target ${
                    activeSection === tab.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-95 ring-2 ring-white'
                      : 'bg-orange-700/60 text-white/80 hover:bg-orange-600 active:scale-95'
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs leading-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Left Sidebar Navigation */}
        <div className="hidden md:flex w-72 flex-col justify-center py-8">
          {/* User Features Section */}
          <div className="mb-4">
            <div className="text-white/60 text-sm font-medium px-6 pb-2">Wellness Features</div>
            {[
              { id: 'chat', label: 'Home' },
              { id: 'daily', label: 'Reflection' },
              { id: 'journal', label: 'Journal' },
              { id: 'memory', label: 'Memory' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'voice', label: 'Voice Settings' },
              { id: 'rewards', label: 'Rewards' },
              { id: 'community', label: 'Community' },
              { id: 'adaptive', label: 'AI Learning' },
              { id: 'therapy-plans', label: 'Therapy Plans' },
              { id: 'agents', label: 'AI Specialists' },
              { id: 'vr', label: 'VR Therapy' },
              { id: 'health', label: 'Wearables' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full h-16 px-6 text-lg font-bold transition-colors ${
                  activeSection === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-green-600 text-white hover:bg-green-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Internal Tools Section */}
          <div className="border-t border-white/20 pt-4">
            <div className="text-white/60 text-sm font-medium px-6 pb-2">Professional Tools</div>
            {[
              { id: 'therapist', label: 'Therapist Portal' },
              { id: 'privacy', label: 'Privacy & Compliance' },
              { id: 'outcomes', label: 'Therapeutic Outcomes' },
              { id: 'ehr', label: 'EHR Integration' },
              { id: 'privacy-policy', label: 'Privacy Policy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full h-16 px-6 text-lg font-bold transition-colors ${
                  activeSection === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-600 text-white hover:bg-orange-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Content Area - Mobile Responsive */}
        <div className="flex-1 mobile-content" style={{ height: 'calc(100vh - 200px)' }}>
          {activeSection === 'chat' ? (
            /* Mobile-Optimized Chat Panel - Full Width */
            <div className="w-full h-full flex flex-col bg-[#3f51b5] overflow-hidden mobile-chat" style={{ maxHeight: '100%' }}>
              {/* Chat Header */}
              <div className="bg-[#2c3e83] text-white text-center py-3 border-b border-white/20">
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle size={20} />
                  <span className="font-bold text-lg">Chat with TraI</span>
                </div>
              </div>
              
              {/* Chat Messages Area - Mobile Optimized */}
              <div 
                ref={(el) => {
                  if (el && messages.length > 0) {
                    setTimeout(() => el.scrollTop = el.scrollHeight, 100);
                  }
                }}
                className="flex-1 overflow-y-auto p-4 pb-safe mobile-scroll" 
                style={{ minHeight: '0', maxHeight: 'calc(100vh - 280px)' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <MessageCircle size={48} className="mb-4 opacity-60" />
                    <p className="text-lg font-medium mb-2">Welcome to TraI</p>
                    <p className="mobile-text-sm opacity-80 text-center px-4">
                      Your AI companion for mental wellness. Start by sharing what's on your mind or use voice input.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl chat-bubble ${
                          message.sender === 'user' 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-purple-700 text-white rounded-bl-md'
                        }`}>
                          <p className="mobile-text-sm leading-relaxed">{message.text}</p>
                          <p className="mobile-text-xs mt-2 opacity-70">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {loading && (
                  <div className="flex justify-start mt-4">
                    <div className="bg-purple-700 text-white px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1 items-center">
                        <span className="text-xs mr-2">TraI is typing</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Chat Input Area */}
              <div className="bg-[#2c3e83] p-4 border-t border-white/20" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem) + 80px)' }}>
                {/* Recording Status Indicator */}
                {isRecording && (
                  <div className="mb-3 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full mobile-text-sm font-medium flex items-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-3"></div>
                      <span>Recording... Tap mic to stop</span>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Share what's on your mind..."
                      className="w-full px-5 py-4 bg-white/10 text-white border border-white/20 rounded-2xl text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent ios-input-fix"
                    />
                  </div>
                  
                  {/* Voice Input Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110 shadow-lg' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-110 shadow-md'
                    }`}
                    disabled={loading}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? <Square size={20} /> : <Mic size={20} />}
                  </button>
                  
                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-md"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Separate Full Panels for Other Sections */
            <div className="w-full h-full mx-2 md:mx-8 bg-[#3f51b5] rounded-lg border border-white overflow-hidden relative">
              {/* Return to Chat Button */}
              <button 
                onClick={() => setActiveSection('chat')}
                className="absolute top-2 right-2 z-10 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 shadow-lg"
              >
                <MessageCircle size={14} />
                <span>Chat</span>
              </button>
              
              <div className="bg-[#3f51b5] text-white text-center py-3 border-b border-white/30 font-bold text-lg">
                {activeSection === 'daily' && 'Personality Reflection'}
                {activeSection === 'journal' && 'Therapeutic Journal'}
                {activeSection === 'memory' && 'Memory Dashboard'}
                {activeSection === 'analytics' && 'Analytics & Reporting'}
                {activeSection === 'rewards' && 'Wellness Rewards'}
                {activeSection === 'community' && 'Community & Professional Support'}
                {activeSection === 'adaptive' && 'Adaptive Learning & Personalization'}
                {activeSection === 'therapy-plans' && 'Personalized Therapy Plans'}
                {activeSection === 'agents' && 'AI Therapeutic Specialists'}
                {activeSection === 'vr' && 'VR/AR Therapy'}
                {activeSection === 'health' && 'Health Integration'}
                {activeSection === 'privacy' && 'Privacy & Compliance'}
                {activeSection === 'horoscope' && 'Horoscope'}
                {activeSection === 'affirmation' && 'Daily Affirmation'}
                {activeSection === 'logo' && 'TraI Information'}
                {activeSection === 'goals' && 'Wellness Goals'}
                {activeSection === 'outcomes' && 'Therapeutic Outcomes'}
                {activeSection === 'ehr' && 'EHR Integration'}
                {activeSection === 'privacy-policy' && 'Privacy Policy & Terms'}
              </div>
              <div className="h-full bg-[#3f51b5] text-white p-6 overflow-y-auto mobile-scroll" style={{ minHeight: '0', maxHeight: 'calc(100vh - 200px)' }}>
                {renderActiveSection()}
              </div>
            </div>
          )}
        </div>

        {/* Right Stats Sidebar - Mobile Responsive */}
        <div className="hidden md:block w-96 py-8 px-8">
          <div className="text-white text-2xl font-bold mb-8 text-center underline">Stats or goal tracking</div>
          
          {/* Real Progress Tracking */}
          <div className="space-y-6">
            {/* Daily Journaling Progress */}
            <div className="bg-purple-700 rounded-lg p-6">
              <div className="text-white text-lg font-bold mb-3">Daily Journaling</div>
              <div className="bg-[#0a0e1a] rounded-full h-4 mb-3">
                <div className="bg-green-400 h-4 rounded-full" style={{width: '75%'}}></div>
              </div>
              <div className="text-white text-base">15/20 days this month</div>
            </div>

            {/* Weekly Chat Sessions */}
            <div className="bg-purple-700 rounded-lg p-6">
              <div className="text-white text-lg font-bold mb-3">Weekly Chat Goal</div>
              <div className="bg-[#0a0e1a] rounded-full h-4 mb-3">
                <div className="bg-blue-400 h-4 rounded-full" style={{width: '60%'}}></div>
              </div>
              <div className="text-white text-base">3/5 sessions this week</div>
            </div>

            {/* Mood Tracking Consistency */}
            <div className="bg-purple-700 rounded-lg p-6">
              <div className="text-white text-lg font-bold mb-3">Mood Tracking</div>
              <div className="bg-[#0a0e1a] rounded-full h-4 mb-3">
                <div className="bg-yellow-400 h-4 rounded-full" style={{width: '90%'}}></div>
              </div>
              <div className="text-white text-base">27/30 days tracked</div>
            </div>

            {/* App Usage Streak */}
            <div className="bg-purple-700 rounded-lg p-6">
              <div className="text-white text-lg font-bold mb-3">App Usage Streak</div>
              <div className="bg-[#0a0e1a] rounded-full h-4 mb-3">
                <div className="bg-purple-400 h-4 rounded-full" style={{width: '85%'}}></div>
              </div>
              <div className="text-white text-base">17 consecutive days</div>
            </div>

            {/* Overall Wellness Score */}
            <div className="bg-purple-700 rounded-lg p-6 text-center">
              <div className="text-white text-lg font-bold mb-3">Overall Wellness</div>
              <div className="text-white text-3xl font-bold">85%</div>
              <div className="text-white text-base">This month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          style={{ paddingTop: '60px', paddingBottom: '60px' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <div className="bg-[#1a237e] rounded-2xl p-6 w-full max-w-md border border-[#3949ab]/30 relative max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Voice Settings</h3>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg border-2 border-white mb-1"
                  aria-label="Close settings"
                  style={{ zIndex: 9999 }}
                >
                  <X size={24} />
                </button>
                <span className="text-xs text-white/70">Close</span>
              </div>
            </div>
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onVoiceChange={setSelectedVoice} 
              onClose={() => setShowSettings(false)}
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-[#7986cb] text-white rounded-lg hover:bg-[#9fa8da] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PWA Manager */}
      <PWAManager onNotificationPermissionChange={setNotificationsEnabled} />

      {/* Micro Session Modal */}
      <MicroSession
        isOpen={showMicroSession}
        onClose={() => setShowMicroSession(false)}
        sessionType={microSessionType}
        onComplete={(data) => {
          console.log('Micro session completed:', data);
          setShowMicroSession(false);
        }}
      />
    </div>
  );
};

const AppWithOnboarding = () => {
  return <AppLayout />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding />
    </QueryClientProvider>
  );
}