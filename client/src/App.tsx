import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';
// Use the actual TrAI logo from public directory
const traiLogo = '/TrAI-Logo.png';


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
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState<string>('james'); // James - default voice
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
    { id: 'james', name: 'James', description: 'Professional male voice', gender: 'Male', default: true },
    { id: 'brian', name: 'Brian', description: 'Deep, resonant male voice', gender: 'Male' },
    { id: 'alexandra', name: 'Alexandra', description: 'Clear female voice', gender: 'Female' },
    { id: 'carla', name: 'Carla', description: 'Warm female voice', gender: 'Female' }
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
    axios.get('/api/stats/1')
      .then(res => {
        setBotStats({
          level: res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : res.data.stage === 'Therapist' ? 3 : 5,
          stage: res.data.stage,
          wordsLearned: res.data.wordsLearned || res.data.wordCount || 1000
        });
      })
      .catch(() => setBotStats({ level: 3, stage: 'Therapist', wordsLearned: 1000 }));

    axios.get('/api/weekly-summary')
      .then(res => setWeeklySummary(res.data.summary))
      .catch(() => setWeeklySummary('Your reflection will appear here as you interact with your TrAI.'));

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    } catch (error) {
      console.error('Recording failed:', error);
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
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.text) {
        setInput(response.data.text);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setInput('Could not transcribe audio - please try again or type your message');
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
    
    // Enable audio context immediately on user interaction
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }
    } catch (e) {}
    
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
      console.log('=== SENDING CHAT REQUEST ===');
      console.log('Message:', userMessageText);
      console.log('URL: /api/chat');
      
      const res = await axios.post('/api/chat', { 
        message: userMessageText,
        userId: 1
      });
      
      console.log('=== RECEIVED RESPONSE ===');
      console.log('Status:', res.status);
      console.log('Full response:', res.data);
      
      const botResponse = res.data.message || res.data.response || 'No response received';
      // Add bot message without triggering screen readers
      const botMessage = {
        sender: 'bot' as const,
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Update daily reflection based on this interaction
      updateDailyReflection(userMessageText, botResponse);
      
      // Generate audio for bot response - SINGLE SOURCE ONLY
      // FORCE CARLA VOICE PLAYBACK
      console.log('=== FORCING CARLA VOICE ===');
      console.log('Bot response text:', botResponse.substring(0, 50) + '...');
      
      // Kill all browser TTS
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        speechSynthesis.pause();
      }
      
      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: botResponse,
          voice: 'carla',
          emotionalContext: 'calming'
        })
      });
        
      console.log('Audio response status:', audioResponse.status);
      
      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        console.log('CARLA AUDIO RECEIVED:', { audioUrlExists: !!audioData.audioUrl, audioLength: audioData.audioUrl?.length });
        
        if (audioData.audioUrl) {
          console.log('PLAYING CARLA VOICE NOW');
          
          // Clear all existing audio
          document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.remove();
          });
          
          // Create and play Carla audio immediately
          const audio = new Audio(audioData.audioUrl);
          audio.volume = 1.0;
          
          // Force play with fallback
          audio.play().then(() => {
            console.log('CARLA VOICE PLAYING SUCCESSFULLY');
          }).catch(() => {
            console.log('Auto-play blocked - audio will play on next user interaction');
            // Store for next click
            const playOnClick = () => {
              audio.play().then(() => {
                console.log('CARLA VOICE PLAYING AFTER INTERACTION');
                document.removeEventListener('click', playOnClick);
              });
            };
            document.addEventListener('click', playOnClick);
          });
          
          return;
        } else {
          console.log('NO AUDIO URL RECEIVED');
        }
      } else {
        console.log('AUDIO REQUEST FAILED:', audioResponse.status);
      }
      
      setBotStats(prev => prev ? {
        ...prev,
        wordsLearned: data.wordsLearned || prev.wordsLearned,
        stage: data.stage || prev.stage,
        level: data.stage === 'Infant' ? 1 : data.stage === 'Toddler' ? 2 : data.stage === 'Child' ? 3 : data.stage === 'Adolescent' ? 4 : 5
      } : null);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I encountered an issue. Please try again.',
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
      
    } catch (err) {
      console.error('Chat failed', err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const enableAudio = () => {
    // Disable all browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      speechSynthesis.pause();
    }
    
    // Stop any existing audio elements
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      audio.pause();
      audio.remove();
    });
    
    setAudioEnabled(true);
    console.log('ElevenLabs-only audio enabled, all browser TTS disabled');
    
    if (pendingAudio) {
      const audio = new Audio(pendingAudio);
      audio.play().then(() => {
        console.log('Pending audio playing successfully');
      }).catch(err => {
        console.error('Failed to play pending audio:', err);
      });
      audio.onended = () => {
        URL.revokeObjectURL(pendingAudio);
        setPendingAudio(null);
      };
    }
  };

  const testAudio = async () => {
    try {
      console.log('=== ELEVENLABS AUDIO TEST ===');
      
      // Disable browser TTS completely
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        speechSynthesis.pause();
      }
      
      // Test ElevenLabs API only
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: 'ElevenLabs Carla voice test',
          voice: 'carla'
        })
      });
      
      if (response.ok) {
        const audioData = await response.json();
        console.log('ElevenLabs test response:', audioData.audioUrl ? 'SUCCESS' : 'FAILED');
        
        if (audioData.audioUrl) {
          const audio = new Audio(audioData.audioUrl);
          audio.volume = 1.0;
          
          audio.play().then(() => {
            console.log('ElevenLabs TTS test successful');
            setAudioEnabled(true);
          }).catch(error => {
            console.log('Audio playback blocked:', error);
          });
        }
      }
      
      console.log('=== AUDIO TEST COMPLETE ===');
    } catch (error: any) {
      console.error('Audio test failed:', error);
    }
  };

  const replayLastMessage = () => {
    console.log('Replay requested - lastBotAudio:', lastBotAudio);
    if (lastBotAudio) {
      const audio = new Audio(lastBotAudio);
      audio.volume = 1.0;
      audio.play().then(() => {
        console.log('Replay successful');
        setAudioEnabled(true);
      }).catch(error => {
        console.error('Replay failed:', error);
        setPendingAudio(lastBotAudio);
      });
    } else {
      // Generate audio for the last bot message
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
      if (lastBotMessage) {
        generateAudioForText(lastBotMessage.text);
      }
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
        console.log('Test audio blob size:', audioBlob.size);
        
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          setLastBotAudio(audioUrl);
          
          const audio = new Audio(audioUrl);
          audio.volume = 1.0;
          
          audio.play().then(() => {
            console.log('ElevenLabs test audio playing successfully');
            setAudioEnabled(true);
          }).catch(error => {
            console.log('Test audio playback failed:', error.message);
            setPendingAudio(audioUrl);
          });
        } else {
          console.log('Empty test audio blob received');
        }
      } else {
        console.log('Test audio API request failed:', response.status);
      }
    } catch (error) {
      console.log('Test audio generation error:', error);
    }
  };

  const handleZodiacChange = async (newZodiacSign: string) => {
    setSelectedZodiacSign(newZodiacSign);
    localStorage.setItem('userZodiacSign', newZodiacSign);
    
    // Refresh daily content with new zodiac sign
    try {
      const zodiacParam = newZodiacSign ? `?zodiacSign=${newZodiacSign}` : '';
      const res = await axios.get(`/api/daily-content${zodiacParam}`);
      setDailyAffirmation(res.data.affirmation);
      setDailyHoroscope(res.data.horoscope);
      setZodiacSign(res.data.zodiacSign || '');
    } catch (error) {
      console.error('Failed to refresh daily content:', error);
    }
  };

  const readReflection = async () => {
    if (!weeklySummary) return;
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: weeklySummary,
          voiceId: selectedReflectionVoice 
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('Reflection audio blob size:', audioBlob.size);
        
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audio.volume = 1.0;
          audio.play().then(() => {
            console.log('Reflection audio playing successfully');
            setAudioEnabled(true);
          }).catch(error => {
            console.log('Reflection audio playback failed:', error.message);
            setPendingAudio(audioUrl);
          });
        }
      }
    } catch (error) {
      console.log('Reflection audio generation error:', error);
    }
  };

  const switchUser = async () => {
    if (!newUserName.trim()) return;
    
    try {
      await axios.post('/api/user/switch', { name: newUserName.trim() });
      setMessages([]);
      setNewUserName('');
      setShowSettings(false);
      
      const statsRes = await axios.get('/api/stats?userId=1');
      setBotStats({
        level: statsRes.data.stage === 'Infant' ? 1 : statsRes.data.stage === 'Toddler' ? 2 : statsRes.data.stage === 'Child' ? 3 : statsRes.data.stage === 'Adolescent' ? 4 : 5,
        stage: statsRes.data.stage,
        wordsLearned: statsRes.data.wordCount
      });
      
    } catch (error) {
      console.error('User switch failed:', error);
    }
  };

  const selectVoice = async (voiceId: string) => {
    try {
      await axios.post('/api/voice/set', { voiceId });
      setShowSettings(false);
    } catch (error) {
      console.error('Voice selection failed:', error);
    }
  };

  const resetBot = async () => {
    try {
      await axios.post('/api/bot/reset');
      setMessages([]);
      setBotStats({ level: 1, stage: 'Infant', wordsLearned: 0 });
      setShowSettings(false);
    } catch (error) {
      console.error('Bot reset failed:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--surface-primary)' }}>
            {/* Messages Area - Mobile optimized */}
            <div className="flex-1 h-full overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <img 
                    src={traiLogo}
                    alt="TraI Logo" 
                    className="w-24 h-24 mb-6 rounded-full shadow-lg object-cover"
                  />
                  <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Welcome to TraI</h2>
                  <p className="text-base mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Your therapeutic companion for mental wellness and self-reflection. Start sharing your thoughts below.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
                      <Mic className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Voice Input</p>
                    </div>
                    <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
                      <Brain className="w-6 h-6 mb-2" style={{ color: 'var(--soft-blue-dark)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Memory</p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
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
                      <p className="break-words">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{message.time}</p>
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          </div>
        );

      case 'reflect':
        return (
          <div className="p-4 h-full flex flex-col">
            {/* Mobile-optimized header */}
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

            {/* Mobile-optimized content */}
            <div className="flex-1 overflow-y-auto rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {weeklySummary}
              </div>
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="p-4 h-full flex flex-col space-y-4">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Daily Inspiration</h2>
            
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
        );

      case 'memory':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <MemoryDashboard userId={1} />
          </div>
        );

      case 'progress':
        return (
          <div className="p-4 h-full flex flex-col">
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
          <div className="p-4 h-full flex flex-col space-y-4">
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

            {/* Voice Controls - Mobile optimized */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Voice Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Voice Recording</span>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm ${isRecording ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: isRecording ? '#EF4444' : 'var(--soft-blue-dark)',
                      color: 'white'
                    }}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Press 'R' key in chat to quickly toggle voice recording
                </div>
              </div>
            </div>

            {/* Voice Selection - Mobile optimized */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--gentle-lavender)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Voice Selection</h3>
              <VoiceSelector selectedVoice={selectedReflectionVoice} onVoiceChange={setSelectedReflectionVoice} />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">User Management</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Switch User</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Enter new username"
                      className="flex-1 p-2 rounded bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400"
                    />
                    <button
                      onClick={switchUser}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                      Switch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Personality Mode</h3>
              <div className="grid gap-3">
                {personalityModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPersonalityMode(mode.id)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      personalityMode === mode.id 
                        ? 'bg-green-600/20 border border-green-500' 
                        : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{mode.emoji}</span>
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-sm text-zinc-400">{mode.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
              <button
                onClick={resetBot}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
              >
                Reset Bot Memory
              </button>
              <p className="text-sm text-zinc-400 mt-2">This will clear all learned words and personality traits.</p>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };



  return (
    <div className="h-screen text-slate-700" style={{ backgroundColor: 'var(--soft-blue)' }}>
      {/* Mobile Layout */}
      <div className="md:hidden h-full flex flex-col">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--gentle-lavender)' }}>
          <img 
            src={traiLogo}
            alt="TraI Vision Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>TraI</h1>
          {botStats && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Level {botStats.level}
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '200px' }}>
          {renderActiveSection()}
        </div>

        {/* Mobile Chat Input - Always visible and floating */}
        <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg z-50 border-t" style={{ borderColor: 'var(--gentle-lavender-dark)' }}>
          {/* Voice Selector */}
          <div className="px-4 pt-3 pb-2">
            <select
              value={selectedReflectionVoice}
              onChange={(e) => setSelectedReflectionVoice(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium"
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
          <div className="flex items-center gap-2 px-4 pb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              className="flex-1 p-3 text-base rounded-2xl border-2 focus:outline-none focus:ring-0"
              style={{ 
                borderColor: 'var(--gentle-lavender-dark)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-2xl min-w-[48px] min-h-[48px] flex items-center justify-center shadow-lg transition-all ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{ 
                backgroundColor: isRecording ? '#EF4444' : 'var(--pale-green)',
                color: isRecording ? 'white' : 'var(--text-primary)'
              }}
              title={isRecording ? "Stop Recording" : "Start Voice Recording"}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-3 rounded-2xl min-w-[48px] min-h-[48px] flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--soft-blue-dark)',
                color: 'white'
              }}
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Fixed position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg mobile-nav z-50" style={{ borderTop: '1px solid var(--gentle-lavender)' }}>
          <div className="flex justify-around py-3 px-2 safe-area-inset-bottom">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center p-3 min-w-[60px] rounded-xl transition-all duration-200 ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--soft-blue-dark)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-sm' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout - 3 Panel Design */}
      <div className="hidden md:flex h-full">
        {/* Left Panel - Daily Reflection & Horoscope */}
        <div className="w-1/4 flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
          {/* Daily Reflection Section */}
          <div className="h-1/2 p-6" style={{ borderBottom: '1px solid var(--gentle-lavender-dark)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
                ❤️
              </div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Reflection</h2>
            </div>
            <div className="rounded-2xl p-5 h-48 overflow-y-auto shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="mb-4">
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Today's Affirmation</h3>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  {dailyAffirmation}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Daily Reflection</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {dailyReflection}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <select
                value={selectedReflectionVoice}
                onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm border shadow-sm"
                style={{ 
                  backgroundColor: 'var(--surface-elevated)',
                  borderColor: 'var(--gentle-lavender-dark)',
                  color: 'var(--text-primary)'
                }}
              >
                {voiceOptions.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
              <button
                onClick={readReflection}
                disabled={!weeklySummary}
                className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 disabled:opacity-50 bg-purple-200 text-gray-800"
                onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#B8B8DC'}
                onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#E6E6FA'}
              >
                🔊 Read
              </button>
            </div>
          </div>
          
          {/* Horoscope Section */}
          <div className="h-1/2 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-purple-200">
                ⭐
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Daily Horoscope</h2>
            </div>
            <div className="rounded-2xl p-5 h-48 overflow-y-auto shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div className="mb-4">
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your Sign</h3>
                <select
                  value={selectedZodiacSign}
                  onChange={(e) => handleZodiacChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--gentle-lavender-dark)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Random Sign</option>
                  <option value="aries">♈ Aries</option>
                  <option value="taurus">♉ Taurus</option>
                  <option value="gemini">♊ Gemini</option>
                  <option value="cancer">♋ Cancer</option>
                  <option value="leo">♌ Leo</option>
                  <option value="virgo">♍ Virgo</option>
                  <option value="libra">♎ Libra</option>
                  <option value="scorpio">♏ Scorpio</option>
                  <option value="sagittarius">♐ Sagittarius</option>
                  <option value="capricorn">♑ Capricorn</option>
                  <option value="aquarius">♒ Aquarius</option>
                  <option value="pisces">♓ Pisces</option>
                </select>
              </div>
              <div>
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Today's Reading</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {dailyHoroscope}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <select
                value={selectedReflectionVoice}
                onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm border shadow-sm"
                style={{ 
                  backgroundColor: 'var(--surface-elevated)',
                  borderColor: 'var(--gentle-lavender-dark)',
                  color: 'var(--text-primary)'
                }}
              >
                {voiceOptions.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
              <button
                onClick={() => generateAudioForText(dailyHoroscope)}
                disabled={!dailyHoroscope}
                className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--gentle-lavender)',
                  color: 'var(--text-primary)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--gentle-lavender-dark)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--gentle-lavender)'}
              >
                🔊 Read
              </button>
            </div>
          </div>
        </div>

        {/* Center Panel - Therapeutic Chat Interface */}
        <div className="w-1/2 flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
          <div className="h-full flex flex-col border-l border-r border-purple-300">
            <div className="p-6 flex items-center justify-center border-b border-purple-300">
              <img 
                src={traiLogo}
                alt="TraI Vision Logo" 
                className="w-36 h-36 rounded-2xl shadow-lg object-cover"
              />
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Welcome to TraI</h2>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    I'm here to listen and support you. Share what's on your mind.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-sm px-5 py-3 rounded-2xl shadow-sm"
                      style={{
                        backgroundColor: message.sender === 'user' 
                          ? 'var(--pale-green)' 
                          : 'var(--surface-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <p className="leading-relaxed">{message.text}</p>
                      <p className="text-xs mt-2 opacity-70">{message.time}</p>
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-6" style={{ borderTop: '1px solid var(--gentle-lavender-dark)', backgroundColor: 'var(--surface-secondary)' }}>
              <div className="mb-4 flex gap-3">
                <select
                  value={selectedReflectionVoice}
                  onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm border shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--gentle-lavender-dark)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {voiceOptions.map(voice => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    const currentIndex = personalityModes.findIndex(mode => mode.id === personalityMode);
                    const nextIndex = (currentIndex + 1) % personalityModes.length;
                    setPersonalityMode(personalityModes[nextIndex].id);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--gentle-lavender)',
                    color: 'var(--text-primary)'
                  }}
                  title={`Current: ${personalityModes.find(mode => mode.id === personalityMode)?.name || personalityMode} - Click to cycle`}
                >
                  {personalityModes.find(mode => mode.id === personalityMode)?.emoji || '🤖'} {personalityModes.find(mode => mode.id === personalityMode)?.name || personalityMode}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--gentle-lavender)',
                    color: 'var(--text-primary)'
                  }}
                  title="Settings"
                >
                  ⚙️
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts..."
                  className="flex-1 p-4 rounded-2xl border shadow-sm transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--gentle-lavender-dark)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isRecording ? '#FF9999' : 'var(--pale-green)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-4 rounded-2xl shadow-sm transition-all duration-200 disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--pale-green)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Wellness Goals */}
        <div className="w-1/4 flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
          {/* Goal Tracking Section */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: 'var(--pale-green)' }}>
                ✓
              </div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Wellness Goals</h2>
            </div>
            
            {/* Customizable Goal Progress Widgets */}
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-2xl p-5 group shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{goal.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{goal.current}/{goal.target}</span>
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setShowGoalEditor(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2 py-1 rounded-lg"
                        style={{ backgroundColor: 'var(--gentle-lavender)', color: 'var(--text-primary)' }}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-3 shadow-inner" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                        backgroundColor: goal.color === 'blue' ? 'var(--soft-blue-darker)' :
                          goal.color === 'green' ? 'var(--pale-green-dark)' :
                          goal.color === 'purple' ? 'var(--gentle-lavender-dark)' :
                          goal.color === 'red' ? '#FFB6B6' :
                          goal.color === 'yellow' ? '#FFE4B5' :
                          'var(--soft-blue-darker)'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {goal.current >= goal.target ? 'Goal completed! 🎉' : `${goal.target - goal.current} to go`}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setShowGoalEditor(true);
                }}
                className="w-full rounded-2xl p-5 text-center text-sm transition-all duration-200 border-2 border-dashed shadow-sm"
                style={{ 
                  borderColor: 'var(--gentle-lavender-dark)',
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                + Add New Wellness Goal
              </button>
            </div>
            
            {/* Bot Progress */}
            {botStats && (
              <div className="mt-8 pt-6 border-t border-zinc-700">
                <h3 className="font-medium mb-4 text-zinc-300">Bot Progress</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{botStats.level}</div>
                    <div className="text-xs text-zinc-400">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-400">{botStats.stage}</div>
                    <div className="text-xs text-zinc-400">Stage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{botStats.wordsLearned}</div>
                    <div className="text-xs text-zinc-400">Words</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Quiz Overlay for Profile Updates */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50">
          <OnboardingQuiz 
            onComplete={(responses) => {
              console.log('Onboarding completed:', responses);
              setShowOnboarding(false);
            }} 
          />
        </div>
      )}

      {/* Therapeutic Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 w-96 max-w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: 'var(--gentle-lavender)', color: 'var(--text-primary)' }}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Voice Settings */}
              <div>
                <h4 className="text-lg font-medium mb-3 text-blue-400">Voice Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Voice</label>
                    <select
                      value={selectedReflectionVoice}
                      onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                    >
                      {voiceOptions.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} - {voice.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-zinc-300">
                    Currently selected: <span className="font-medium text-purple-400">
                      {voiceOptions.find(v => v.id === selectedReflectionVoice)?.name || 'James'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audio Status</span>
                    <span className={`px-2 py-1 rounded text-xs ${audioEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                      {audioEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        // Enable audio context first
                        try {
                          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                          if (audioContext.state === 'suspended') {
                            await audioContext.resume();
                          }
                          setAudioEnabled(true);
                          console.log('Audio context enabled');
                        } catch (error) {
                          console.log('Audio context enable failed:', error);
                        }
                        
                        // Then test the voice
                        generateAudioForText("Hello! This is how I will sound in our conversations.");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white w-full"
                    >
                      Enable Audio & Test Voice
                    </button>
                    <button
                      onClick={async () => {
                        const response = await fetch('/api/text-to-speech', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            text: 'Direct audio test with visible controls',
                            voiceId: selectedReflectionVoice
                          })
                        });
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        audio.controls = true;
                        audio.style.width = '100%';
                        document.body.appendChild(audio);
                        console.log('Audio element added to page with controls');
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white w-full"
                    >
                      Direct Audio Test (With Controls)
                    </button>
                    <button
                      onClick={async () => {
                        const response = await fetch('/api/text-to-speech', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            text: 'Download test - this file should play the selected voice when downloaded',
                            voiceId: selectedReflectionVoice
                          })
                        });
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `elevenlabs-voice-test-${Date.now()}.mp3`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        console.log('Audio file downloaded');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white w-full"
                    >
                      Download Audio Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Personality Settings */}
              <div>
                <h4 className="text-lg font-medium mb-3 text-purple-400">Personality</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Mode</label>
                    <div className="grid gap-2">
                      {personalityModes.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setPersonalityMode(mode.id)}
                          className={`p-2 rounded text-left transition-colors text-sm ${
                            personalityMode === mode.id 
                              ? 'bg-purple-600/20 border border-purple-500' 
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{mode.emoji}</span>
                            <div>
                              <div className="font-medium text-xs">{mode.name}</div>
                              <div className="text-xs text-zinc-400">{mode.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h4 className="text-lg font-medium mb-3 text-yellow-400">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clear Chat History</span>
                    <button
                      onClick={() => {
                        setMessages([]);
                        setShowSettings(false);
                      }}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reset All Goals</span>
                    <button
                      onClick={() => {
                        setGoals([]);
                        setShowSettings(false);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retake Personality Quiz</span>
                    <button
                      onClick={() => {
                        setShowOnboarding(true);
                        setShowSettings(false);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div>
                <h4 className="text-lg font-medium mb-3 text-green-400">App Information</h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Version</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Messages</span>
                    <span>{messages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Goals</span>
                    <span>{goals.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Editor Modal */}
      {showGoalEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            
            <GoalEditor
              goal={editingGoal}
              onSave={(goalData) => {
                if (editingGoal) {
                  setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
                } else {
                  const newGoal = {
                    id: Math.max(...goals.map(g => g.id)) + 1,
                    ...goalData
                  };
                  setGoals([...goals, newGoal]);
                }
                setShowGoalEditor(false);
                setEditingGoal(null);
              }}
              onCancel={() => {
                setShowGoalEditor(false);
                setEditingGoal(null);
              }}
              onDelete={editingGoal ? () => {
                setGoals(goals.filter(g => g.id !== editingGoal!.id));
                setShowGoalEditor(false);
                setEditingGoal(null);
              } : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Goal Editor Component
interface GoalEditorProps {
  goal: Goal | null;
  onSave: (goalData: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function GoalEditor({ goal, onSave, onCancel, onDelete }: GoalEditorProps) {
  const [name, setName] = useState(goal?.name || '');
  const [current, setCurrent] = useState(goal?.current || 0);
  const [target, setTarget] = useState(goal?.target || 10);
  const [color, setColor] = useState(goal?.color || 'blue');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), current, target, color });
  };

  const colors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Goal Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Read 30 minutes daily"
          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Progress</label>
          <input
            type="number"
            value={current}
            onChange={(e) => setCurrent(parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Progress Bar Color</label>
        <div className="flex gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => setColor(colorOption.value)}
              className={`w-8 h-8 rounded-full ${colorOption.class} ${
                color === colorOption.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-800' : ''
              }`}
              title={colorOption.name}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Delete Goal
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm"
          >
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}

function AppWithOnboarding() {
  // Skip onboarding for now and go directly to main app
  const onboardingStatus = { isComplete: true };
  const onboardingLoading = false;

  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TraI...</p>
        </div>
      </div>
    );
  }

  // Show onboarding quiz for new users or when manually requested
  if ((!onboardingStatus?.isComplete && !onboardingComplete)) {
    return (
      <OnboardingQuiz 
        onComplete={() => setOnboardingComplete(true)} 
      />
    );
  }

  // Show main application for users who completed onboarding
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding />
    </QueryClientProvider>
  );
}