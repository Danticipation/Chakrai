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
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState<string>('iCrDUkL56s3C8sCRl7wb');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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
      { id: 'iCrDUkL56s3C8sCRl7wb', name: 'Hope', description: 'Warm, soothing female voice' },
      { id: 'FA6HhUjVmxBGQLlzA8WZ', name: 'Ophelia', description: 'Calm, articulate British female' },
      { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Brian', description: 'Deep, resonant male voice' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded male voice' }
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
      
      // Generate audio for bot response
      try {
        const audioResponse = await axios.post('/api/text-to-speech', { 
          text: res.data.response 
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
      const response = await axios.post('/api/text-to-speech', { text }, {
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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-zinc-900 to-zinc-800">
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

            {/* Voice Controls Debug Panel - FORCE VISIBLE */}
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
              <div className="text-sm text-red-200 mb-2">Voice Debug Panel (Force Visible)</div>
              <div className="flex gap-2">
                <button
                  onClick={replayLastMessage}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                >
                  🔄 Replay Last
                </button>
                <button
                  onClick={enableAudio}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                >
                  🔊 Enable Audio
                </button>
                <button
                  onClick={testAudio}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  🎵 Test Audio
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Audio: {audioEnabled ? 'ON' : 'OFF'} | Last Audio: {lastBotAudio ? 'Available' : 'None'}
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (or press 'r' to record)"
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
        );

      case 'reflect':
        return (
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
        );

      case 'memory':
        return (
          <div className="p-6 max-w-4xl mx-auto">
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
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <div className="w-20 bg-zinc-800 flex flex-col items-center py-6 space-y-4">
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
      <div className="flex-1 flex flex-col">
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