import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';

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

const AppLayout = () => {
  const [activeSection, setActiveSection] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
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
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState<string>('EkK5I93UQWFDigLMpZcX');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [dailyAffirmation, setDailyAffirmation] = useState<string>('');
  const [horoscope, setHoroscope] = useState<string>('');
  const [affirmationLoading, setAffirmationLoading] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sections = [
    { id: 'chat', icon: MessageCircle, label: 'Chat', emoji: '💬' },
    { id: 'reflect', icon: Brain, label: 'Reflect', emoji: '🔁' },
    { id: 'memory', icon: BookOpen, label: 'Memory', emoji: '📊' },
    { id: 'progress', icon: Target, label: 'Progress', emoji: '📈' },
    { id: 'voice', icon: Mic, label: 'Voice', emoji: '🎤' },
    { id: 'settings', icon: User, label: 'Settings', emoji: '⚙️' }
  ];

  const voiceOptions = {
    all: [
      { id: 'EkK5I93UQWFDigLMpZcX', name: 'James', description: 'Professional male voice' },
      { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Deep, resonant male voice' },
      { id: 'kdmDKE6EkgrWrrykO9Qt', name: 'Alexandra', description: 'Clear female voice' },
      { id: 'l32B8XDoylOsZKiSdfhE', name: 'Carla', description: 'Warm female voice' }
    ]
  };

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
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const newMessage: Message = {
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: input.trim(),
        userId: 1,
        personalityMode: personalityMode
      });
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Generate audio for bot response using current voice selection
      try {
        // Get current voice selection
        const currentVoiceResponse = await axios.get('/api/voice/current');
        const currentVoiceId = currentVoiceResponse.data.voice?.id;
        
        const audioResponse = await axios.post('/api/text-to-speech', { 
          text: res.data.response,
          voiceId: currentVoiceId
        }, {
          responseType: 'blob'
        });
        
        const audioBlob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastBotAudio(audioUrl);
        
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        
        const playPromise = audio.play();
        playPromise.then(() => {
          console.log('Audio playing successfully');
          setAudioEnabled(true);
        }).catch(error => {
          console.log('Audio blocked by browser:', error.message);
          setPendingAudio(audioUrl);
        });
      } catch (voiceError) {
        console.log('Voice synthesis unavailable');
      }
      
      setBotStats(prev => prev ? {
        ...prev,
        wordsLearned: res.data.wordsLearned || prev.wordsLearned,
        stage: res.data.stage || prev.stage,
        level: res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : 5
      } : null);
      
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
    setAudioEnabled(true);
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
      console.log('=== AUDIO TEST START ===');
      
      // Test browser audio capability
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
        console.log('Browser beep test completed');
      } catch (beepError: any) {
        console.error('Browser beep failed:', beepError);
      }
      
      // Test ElevenLabs API
      const response = await axios.post('/api/text-to-speech', { 
        text: 'Audio test successful' 
      }, {
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.volume = 1.0;
      audio.muted = false;
      
      audio.play().then(() => {
        console.log('ElevenLabs TTS test successful');
        setAudioEnabled(true);
      }).catch(error => {
        console.error('Audio playback blocked:', error);
        setPendingAudio(audioUrl);
      });
      
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
      // Get current voice selection
      const currentVoiceResponse = await axios.get('/api/voice/current');
      const currentVoiceId = currentVoiceResponse.data.voice?.id;
      
      const response = await axios.post('/api/text-to-speech', { 
        text,
        voiceId: currentVoiceId 
      }, {
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setLastBotAudio(audioUrl);
      
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.play().then(() => {
        console.log('Generated audio playing');
        setAudioEnabled(true);
      }).catch(error => {
        console.error('Generated audio blocked:', error);
        setPendingAudio(audioUrl);
      });
    } catch (error) {
      console.error('Audio generation failed:', error);
    }
  };

  const readReflection = async () => {
    if (!weeklySummary || isGeneratingAudio) return;
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    setIsGeneratingAudio(true);
    
    try {
      console.log('Generating audio with voice:', selectedReflectionVoice);
      
      const response = await axios.post('/api/text-to-speech', { 
        text: weeklySummary,
        voiceId: selectedReflectionVoice 
      }, {
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      console.log('Reflection audio playing with voice:', selectedReflectionVoice);
      setAudioEnabled(true);
      
    } catch (error) {
      console.error('Reflection audio generation failed:', error);
    } finally {
      setIsGeneratingAudio(false);
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

  const generateDailyContent = async () => {
    setAffirmationLoading(true);
    try {
      const response = await axios.post('/api/daily-content', { userId: 1 });
      setDailyAffirmation(response.data.affirmation);
      setHoroscope(response.data.horoscope);
    } catch (error) {
      console.error('Daily content generation failed:', error);
      setDailyAffirmation('Focus on progress, not perfection. Every small step forward is meaningful.');
      setHoroscope('Today brings opportunities for growth and learning.');
    } finally {
      setAffirmationLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex flex-col h-[100vh] lg:h-[calc(100vh-4rem)]">
            
            {/* Mobile: Simple Header with Quick Actions */}
            <div className="lg:hidden bg-zinc-800 border-b border-zinc-700 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-white">Reflectibot</h1>
                  {botStats && (
                    <p className="text-xs text-zinc-400">Level {botStats.level} • {botStats.wordsLearned}w</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateDailyContent}
                    disabled={affirmationLoading}
                    className="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-full flex items-center justify-center text-sm"
                    title="Daily Inspiration"
                  >
                    ✨
                  </button>
                  <button
                    onClick={replayLastMessage}
                    className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-sm"
                    title="Replay Audio"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="w-8 h-8 bg-zinc-600 hover:bg-zinc-700 rounded-full flex items-center justify-center text-sm"
                    title="Menu"
                  >
                    ⋯
                  </button>
                </div>
              </div>
              
              {/* Daily Affirmation Display - Mobile */}
              {(dailyAffirmation || horoscope) && (
                <div className="mt-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-xs text-purple-300 font-medium mb-1">Daily Affirmation</div>
                  {dailyAffirmation && (
                    <div className="text-sm text-white leading-relaxed mb-2">{dailyAffirmation}</div>
                  )}
                  {horoscope && (
                    <div className="text-xs text-purple-200 opacity-90">{horoscope}</div>
                  )}
                </div>
              )}
              
              {/* Mobile Menu Dropdown */}
              {showMobileMenu && (
                <div className="mt-3 bg-zinc-900 rounded-lg p-3 space-y-2">
                  <button
                    onClick={() => { setActiveSection('reflect'); setShowMobileMenu(false); }}
                    className="w-full text-left px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    🔁 Weekly Reflection
                  </button>
                  <button
                    onClick={() => { setActiveSection('memory'); setShowMobileMenu(false); }}
                    className="w-full text-left px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm"
                  >
                    🧠 Memory Dashboard
                  </button>
                  <button
                    onClick={() => { setActiveSection('voice'); setShowMobileMenu(false); }}
                    className="w-full text-left px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
                  >
                    🎤 Voice Settings
                  </button>
                  <button
                    onClick={() => { setActiveSection('settings'); setShowMobileMenu(false); }}
                    className="w-full text-left px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-sm"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              )}
              

            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Main Chat Container */}
              <div className="flex-1 flex flex-col bg-zinc-900 lg:bg-zinc-800 lg:max-w-4xl lg:mx-auto lg:rounded-lg lg:border lg:border-zinc-700 lg:shadow-lg lg:m-6 min-h-0">
                {/* Chat Header - Desktop Only */}
                <div className="hidden lg:block p-4 border-b border-zinc-700 bg-zinc-800 rounded-t-lg">
                  <h2 className="text-xl font-bold text-white">Chat with Reflectibot</h2>
                  {botStats && (
                    <p className="text-sm text-zinc-400">
                      Level {botStats.level} • {botStats.stage} • {botStats.wordsLearned} words learned
                    </p>
                  )}
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 bg-gradient-to-b from-zinc-900 to-zinc-800 min-h-0">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Welcome to Reflectibot!</h3>
                      <p className="text-zinc-400 text-sm max-w-sm">Start a conversation and I'll learn from you, growing smarter with each interaction.</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-zinc-700 text-zinc-100'
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                  
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

                {/* Input Area */}
                <div className="p-3 lg:p-4 border-t border-zinc-700 bg-zinc-800 lg:rounded-b-lg pb-safe">
                  {/* Mobile: Simple Input */}
                  <div className="lg:hidden flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 p-3 rounded-full bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    />
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-full flex-shrink-0 ${
                        isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-600 hover:bg-zinc-500'
                      }`}
                    >
                      {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="p-3 rounded-full flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Desktop: Full Input with All Actions */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 p-3 rounded-full bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-full ${
                        isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-600 hover:bg-zinc-500'
                      }`}
                    >
                      {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={replayLastMessage}
                      className={`p-3 rounded-full ${lastBotAudio ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 opacity-50'}`}
                      title={lastBotAudio ? "Replay last response" : "Replay button (will activate with audio)"}
                    >
                      🔄
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Sidebar - Hidden on Mobile */}
              <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:space-y-4">
                
                {/* Bot Progress Card */}
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Bot Development</h3>
                  {botStats && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Stage</span>
                          <span className="text-blue-400">{botStats.stage}</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(botStats.level / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Words Learned</span>
                        <span className="text-green-400">{botStats.wordsLearned}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Level</span>
                        <span className="text-purple-400">{botStats.level}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice Controls Card */}
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Voice Controls</h3>
                  <div className="space-y-2">
                    <button
                      onClick={replayLastMessage}
                      className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                    >
                      🔄 Replay Last Message
                    </button>
                    <button
                      onClick={enableAudio}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                    >
                      🔊 Enable Audio
                    </button>
                    <button
                      onClick={testAudio}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      🎵 Test Audio
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 p-2 bg-zinc-900 rounded">
                    Audio: {audioEnabled ? 'ON' : 'OFF'} | Last: {lastBotAudio ? 'Available' : 'None'}
                  </div>
                </div>

                {/* Daily Inspiration Card */}
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Daily Inspiration</h3>
                  <div className="space-y-2">
                    <button
                      onClick={generateDailyContent}
                      disabled={affirmationLoading}
                      className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded text-sm transition-colors"
                    >
                      {affirmationLoading ? '✨ Generating...' : '✨ Get Daily Content'}
                    </button>
                    {dailyAffirmation && (
                      <div className="bg-zinc-900 p-2 rounded text-xs text-zinc-300">
                        <div className="text-yellow-400 font-medium mb-1">Affirmation:</div>
                        {dailyAffirmation}
                      </div>
                    )}
                    {horoscope && (
                      <div className="bg-zinc-900 p-2 rounded text-xs text-zinc-300">
                        <div className="text-yellow-400 font-medium mb-1">Insight:</div>
                        {horoscope}
                      </div>
                    )}
                  </div>
                </div>

                {/* Personality Mode Card */}
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Personality Mode</h3>
                  <div className="text-sm text-zinc-300 mb-2">
                    Current: <span className="text-emerald-400 capitalize">{personalityMode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {personalityModes.slice(0, 6).map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setPersonalityMode(mode.id)}
                        className={`p-1 rounded text-left ${
                          personalityMode === mode.id 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                        }`}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );

      case 'reflect':
        return (
          <div className="flex flex-col h-full">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center p-3 bg-zinc-800 border-b border-zinc-700">
              <button
                onClick={() => setActiveSection('chat')}
                className="flex items-center text-white hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chat
              </button>
            </div>
            <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Weekly Reflection</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedReflectionVoice}
                    onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                    className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-white"
                  >
                    {voiceOptions.all.map(voice => (
                      <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={readReflection}
                    disabled={!weeklySummary || isGeneratingAudio}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⌚</span>
                        Generating...
                      </>
                    ) : (
                      '🔊 Read Aloud'
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-6 flex-1 overflow-y-auto">
                <div className="text-zinc-300 whitespace-pre-wrap">
                  {weeklySummary}
                </div>
              </div>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="flex flex-col h-full">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center p-3 bg-zinc-800 border-b border-zinc-700">
              <button
                onClick={() => setActiveSection('chat')}
                className="flex items-center text-white hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chat
              </button>
            </div>
            <div className="flex-1 p-3 lg:p-6 max-w-4xl mx-auto overflow-y-auto">
              <MemoryDashboard userId={1} />
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="flex flex-col h-full">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center p-3 bg-zinc-800 border-b border-zinc-700">
              <button
                onClick={() => setActiveSection('chat')}
                className="flex items-center text-white hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chat
              </button>
            </div>
            <div className="flex-1 p-3 lg:p-6 max-w-4xl mx-auto overflow-y-auto">
              <VoiceSelector />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex flex-col h-full">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center p-3 bg-zinc-800 border-b border-zinc-700">
              <button
                onClick={() => setActiveSection('chat')}
                className="flex items-center text-white hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chat
              </button>
            </div>
            <div className="flex-1 p-3 lg:p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Settings</h2>
            
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
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white overflow-hidden">
      {/* Sidebar - Hidden on Mobile */}
      <div className="hidden lg:flex w-20 bg-zinc-800 flex-col items-center py-6 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-3 rounded-lg transition-colors relative group ${
                activeSection === section.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
              title={section.label}
            >
              <Icon className="w-6 h-6" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-700 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {section.emoji} {section.label}
              </div>
            </button>
          );
        })}

        {/* Bot Stats in Sidebar */}
        {botStats && (
          <div className="mt-auto text-center text-xs">
            <div className="text-zinc-400">Level {botStats.level}</div>
            <div className="text-zinc-500">{botStats.stage}</div>
            <div className="text-zinc-500">{botStats.wordsLearned}w</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {renderActiveSection()}
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