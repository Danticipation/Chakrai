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

  const [allVoices, setAllVoices] = useState<any[]>([]);
  
  useEffect(() => {
    const loadAllVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        const data = await response.json();
        console.log('Loaded voices:', data.voices);
        console.log('Voice count:', data.voices?.length);
        setAllVoices(data.voices || []);
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };
    loadAllVoices();
  }, []);

  const voiceOptions = {
    male: allVoices.filter(v => v.gender === 'Male'),
    female: allVoices.filter(v => v.gender === 'Female')
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
      .catch(() => setWeeklySummary('No reflections available yet.'));

    // Global keyboard listener for Enter key
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && activeSection === 'chat') {
        const target = e.target as HTMLElement;
        // Only send message if Enter is pressed in the input field
        if (target.tagName === 'INPUT' && target.getAttribute('placeholder')?.includes('Say something')) {
          e.preventDefault();
          sendMessage();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSection, input]);

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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setInput(data.text || '');
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: newMessage.text, 
        userId: 1,
        personalityMode: personalityMode
      });
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      try {
        const audioResponse = await axios.post('/api/text-to-speech', { 
          text: res.data.response 
        }, {
          responseType: 'blob'
        });
        
        // Create audio blob and play it
        const audioBlob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Try to play audio - handle browser restrictions
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        
        console.log('🔊 Creating audio element:', {
          url: audioUrl,
          audioEnabled,
          browserUserAgent: navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'
        });
        
        // Attempt to play immediately
        const playPromise = audio.play();
        
        playPromise.then(() => {
          console.log('✅ Audio playing successfully');
          setAudioEnabled(true);
        }).catch(error => {
          console.log('❌ Audio blocked by browser:', error.name, error.message);
          
          // Always show unlock button when blocked
          setPendingAudio(audioUrl);
          
          // For debugging
          console.log('Setting pendingAudio to show unlock button');
        });
        
        audio.onended = () => {
          console.log('🔊 Audio playback ended');
          URL.revokeObjectURL(audioUrl);
        };
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
      console.log('Playing pending audio:', pendingAudio);
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
      
      // Add an alert to confirm the test is running
      alert('Starting audio test - check console for results');
      
      // First test: Browser audio capability with simple beep
      console.log('Testing browser audio with AudioContext...');
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A4 note
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
        console.log('✓ Browser beep test completed');
        alert('Browser beep test completed - did you hear a sound?');
      } catch (beepError) {
        console.error('✗ Browser beep failed:', beepError);
        alert('Browser beep test failed: ' + beepError.message);
      }
      
      // Second test: ElevenLabs API
      console.log('Testing ElevenLabs TTS API...');
      const response = await axios.post('/api/text-to-speech', { 
        text: 'Audio test successful' 
      }, {
        responseType: 'blob'
      });
      
      console.log('TTS Response received:', response.status, response.data.size, 'bytes');
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Add detailed event listeners
      audio.addEventListener('loadstart', () => console.log('Audio loading started'));
      audio.addEventListener('loadeddata', () => console.log('Audio data loaded'));
      audio.addEventListener('canplay', () => console.log('Audio can start playing'));
      audio.addEventListener('play', () => console.log('Audio play event fired'));
      audio.addEventListener('playing', () => console.log('Audio is playing'));
      audio.addEventListener('ended', () => console.log('Audio playback ended'));
      audio.addEventListener('error', (e) => console.error('Audio error:', e));
      
      console.log('Attempting to play TTS audio...');
      
      // Try multiple approaches
      audio.volume = 1.0; // Ensure volume is at maximum
      audio.muted = false; // Ensure not muted
      
      const playPromise = audio.play();
      
      playPromise.then(() => {
        console.log('✅ TTS audio playing successfully');
        alert('TTS audio should be playing now - do you hear speech?');
      }).catch(err => {
        console.error('❌ TTS audio failed:', err);
        alert(`TTS audio test failed: ${err.message}\nTrying alternative method...`);
        
        // Try alternative approach - create download link
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'test_audio.mp3';
        link.textContent = 'Download test audio';
        document.body.appendChild(link);
        alert('Added download link to page - try downloading and playing the audio file');
      });
      
    } catch (error) {
      console.error('❌ Audio test error:', error);
      alert(`Audio test error: ${(error as any).message}`);
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

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
            {/* Personality Mode Selector */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Personality Mode</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {personalityModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPersonalityMode(mode.id)}
                    className={`p-2 rounded-lg text-left transition-colors ${
                      personalityMode === mode.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{mode.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{mode.name}</div>
                        <div className="text-xs opacity-70 truncate">{mode.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Debug Controls - Always Visible */}
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
              <div className="text-sm text-red-200 mb-2">Audio Debug Panel</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={testAudio}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                >
                  Test Audio
                </button>
                {!audioEnabled && (
                  <button
                    onClick={enableAudio}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Enable Audio
                  </button>
                )}
                <span className="text-xs text-zinc-400">
                  Audio: {audioEnabled ? 'ON' : 'OFF'} | Pending: {pendingAudio ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 bg-zinc-800/50 rounded-lg p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 max-w-[75%] rounded-2xl shadow ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-zinc-700 text-white mr-auto'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs opacity-70">{msg.time}</span>
                </div>
              ))}
              {loading && (
                <div className="bg-zinc-700 text-white mr-auto p-3 max-w-[75%] rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Enable Notification */}
            {!audioEnabled && pendingAudio && (
              <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-200">
                    🔊 Click to enable audio responses
                  </span>
                  <button
                    onClick={enableAudio}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium"
                  >
                    Enable Audio
                  </button>
                </div>
              </div>
            )}

            {/* Audio Test Section */}
            <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Audio Testing & Control</span>
                <div className="flex items-center space-x-2">
                  {!audioEnabled && (
                    <button
                      onClick={enableAudio}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                      title="Enable audio responses"
                    >
                      🔊 Enable Audio
                    </button>
                  )}
                  <button
                    onClick={testAudio}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                    title="Test audio playback"
                  >
                    🎵 Test Audio
                  </button>
                  {audioEnabled && (
                    <span className="text-xs text-green-400">Audio Enabled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Test Section */}
            <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-200">Audio Debug</span>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.frequency.value = 440;
                        gain.gain.value = 0.1;
                        osc.start();
                        setTimeout(() => osc.stop(), 200);
                        console.log('Beep test completed');
                      } catch (e) {
                        console.error('Beep failed:', e);
                      }
                    }}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                  >
                    Beep Test
                  </button>
                  <button
                    onClick={testAudio}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                  >
                    Voice Test
                  </button>
                  {!audioEnabled && (
                    <button
                      onClick={enableAudio}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    >
                      Enable Audio
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Audio: {audioEnabled ? 'ON' : 'OFF'} | Pending: {pendingAudio ? 'YES' : 'NO'}
              </div>
              
              {/* Audio Unlock Button - Always show if not enabled */}
              {(!audioEnabled || pendingAudio) && (
                <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-yellow-200">
                      {pendingAudio ? 'Click to enable voice responses' : 'Audio disabled - click to enable'}
                    </div>
                    <button
                      onClick={enableAudio}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      🔊 Enable Audio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendMessage();
                    }
                    if (e.key === 'Escape') {
                      // Audio test shortcut
                      e.preventDefault();
                      testAudio();
                    }
                  }}
                  placeholder="Say something... (ESC to test audio)"
                  className="flex-1 p-3 rounded-2xl bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
        );

      case 'reflect':
        return (
          <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Weekly Reflection</h2>
            <div className="bg-zinc-800 rounded-lg p-6 flex-1 overflow-y-auto">
              <div className="text-zinc-300 whitespace-pre-wrap">
                {weeklySummary}
              </div>
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
          <div className="p-6 max-w-4xl mx-auto h-full flex flex-col space-y-6">
            <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
            
            {/* Goal Setting Section */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center">
                <span className="mr-2">🎯</span>
                Active Goals
              </h3>
              
              <div className="space-y-4">
                {/* Sample goals - these would be user-defined */}
                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Learn 50 new words this week</h4>
                    <span className="text-sm text-zinc-400">85% complete</span>
                  </div>
                  <div className="w-full bg-zinc-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">42 / 50 words learned</div>
                </div>

                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Daily reflection practice</h4>
                    <span className="text-sm text-zinc-400">7 day streak</span>
                  </div>
                  <div className="w-full bg-zinc-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Completed today ✓</div>
                </div>

                <div className="bg-zinc-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Creative project brainstorming</h4>
                    <span className="text-sm text-zinc-400">3 sessions this month</span>
                  </div>
                  <div className="w-full bg-zinc-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">3 / 5 sessions completed</div>
                </div>
              </div>
            </div>

            {/* Wellness Tracking */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400 flex items-center">
                <span className="mr-2">🌱</span>
                Wellness Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">7</div>
                  <div className="text-sm text-zinc-400">Mindful conversations</div>
                  <div className="text-xs text-zinc-500 mt-1">This week</div>
                </div>
                
                <div className="bg-zinc-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">5</div>
                  <div className="text-sm text-zinc-400">Stress management sessions</div>
                  <div className="text-xs text-zinc-500 mt-1">This month</div>
                </div>
              </div>
            </div>

            {/* Achievement Milestones */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center">
                <span className="mr-2">🏆</span>
                Recent Achievements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-zinc-700/50 rounded-lg">
                  <span className="text-2xl mr-3">🎯</span>
                  <div>
                    <div className="font-medium">Goal Setter</div>
                    <div className="text-sm text-zinc-400">Set your first personal goal</div>
                  </div>
                  <div className="ml-auto text-xs text-zinc-500">2 days ago</div>
                </div>
                
                <div className="flex items-center p-3 bg-zinc-700/50 rounded-lg">
                  <span className="text-2xl mr-3">🧠</span>
                  <div>
                    <div className="font-medium">Reflective Thinker</div>
                    <div className="text-sm text-zinc-400">Completed 5 reflection sessions</div>
                  </div>
                  <div className="ml-auto text-xs text-zinc-500">1 week ago</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'insights':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Insights & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Learning Progress</h3>
                <p className="text-zinc-400">Stage: {botStats?.stage || 'Loading...'}</p>
                <p className="text-zinc-400">Words: {botStats?.wordsLearned || 0}</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Conversation Stats</h3>
                <p className="text-zinc-400">Messages: {messages.length}</p>
              </div>
            </div>
          </div>
        );
      
      case 'knowledge':
        return (
          <div className="p-6">
            <MemoryDashboard userId={1} />
          </div>
        );
      
      case 'voice':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <VoiceSelector />
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Voice Selection</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Female Voices</p>
                    <div className="space-y-2">
                      {voiceOptions.female.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => selectVoice(voice.id)}
                          className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-sm text-zinc-400">{voice.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Male Voices</p>
                    <div className="space-y-2">
                      {voiceOptions.male.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => selectVoice(voice.id)}
                          className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-sm text-zinc-400">{voice.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">User Management</h4>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter new user name"
                  className="w-full p-3 rounded bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 mb-2"
                />
                <button
                  onClick={switchUser}
                  disabled={!newUserName.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded transition-colors"
                >
                  Switch User
                </button>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Bot Management</h4>
                <button
                  onClick={resetBot}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Reset Bot to Baby Stage
                </button>
                <p className="text-xs text-zinc-400 mt-1">
                  This will clear all memories and reset the bot to infant stage
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white relative">
      {/* Audio Debug Overlay - Always Visible */}
      <div className="fixed top-4 right-4 z-50 bg-red-900/90 border border-red-500 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs text-red-200 mb-2">Audio Debug</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={testAudio}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
          >
            Test Audio
          </button>
          {!audioEnabled && (
            <button
              onClick={enableAudio}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
            >
              Enable Audio
            </button>
          )}
          <div className="text-xs text-zinc-300">
            Audio: {audioEnabled ? 'ON' : 'OFF'}
          </div>
          {pendingAudio && (
            <div className="text-xs text-yellow-300">
              Pending: YES
            </div>
          )}
        </div>
      </div>
      <div className="w-20 bg-zinc-800 border-r border-zinc-700 flex flex-col items-center py-6 space-y-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
              activeSection === section.id
                ? 'bg-blue-600 shadow-lg shadow-blue-600/20'
                : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
            title={section.label}
          >
            <span className="text-2xl">{section.emoji}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Reflectibot</h1>
            <div className="text-sm text-zinc-400 capitalize">
              {sections.find(s => s.id === activeSection)?.label}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-zinc-400">Connected</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
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

// Audio debugging setup
setTimeout(() => {
  if (typeof window !== 'undefined') {
    (window as any).testReflectibotAudio = async () => {
      try {
        console.log('=== REFLECTIBOT AUDIO TEST ===');
        
        // Test browser audio capability
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
        console.log('✓ Browser audio test completed');
        
        // Test ElevenLabs API
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Audio test from console' })
        });
        
        if (!response.ok) {
          throw new Error(`API failed: ${response.status}`);
        }
        
        const audioBlob = await response.blob();
        console.log('✓ TTS API responded with', audioBlob.size, 'bytes');
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('play', () => console.log('✓ Audio playback started'));
        audio.addEventListener('ended', () => console.log('✓ Audio playback completed'));
        audio.addEventListener('error', (e) => console.error('✗ Audio error:', e));
        
        await audio.play();
        console.log('✓ Audio test successful');
        
      } catch (error) {
        console.error('✗ Audio test failed:', error);
      }
    };
    
    // Also add a simple beep test
    (window as any).testBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
      console.log('Beep test executed');
    };
    
    console.log('🎵 Audio Debug Commands Available:');
    console.log('- testReflectibotAudio() - Full audio test');
    console.log('- testBeep() - Simple beep test');
  }
}, 1000);