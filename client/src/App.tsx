import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send } from 'lucide-react';
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sections = [
    { id: 'chat', icon: MessageCircle, label: 'Chat', emoji: '💬' },
    { id: 'reflect', icon: Brain, label: 'Reflect', emoji: '🔁' },
    { id: 'memory', icon: BookOpen, label: 'Memory', emoji: '📊' },
    { id: 'voice', icon: Mic, label: 'Voice', emoji: '🎤' },
    { id: 'settings', icon: User, label: 'Settings', emoji: '⚙️' }
  ];

  const voiceOptions = {
    male: [
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep and mature' },
      { id: 'iCrDUkL56s3C8sCRl7wb', name: 'Hope', description: 'Warm and encouraging' }
    ],
    female: [
      { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Gentle and caring' },
      { id: 'FA6HhUjVbervLw2rNl8M', name: 'Ophelia', description: 'Expressive and dynamic' }
    ]
  };

  const personalityModes = [
    { id: 'friend', name: 'Friend Mode', emoji: '😊', description: 'Casual conversation and friendly banter' },
    { id: 'counsel', name: 'Counsel Mode', emoji: '🧭', description: 'Advice and guidance for decisions' },
    { id: 'study', name: 'Study Mode', emoji: '📚', description: 'Research and learning assistance' },
    { id: 'diary', name: 'Diary Mode', emoji: '💭', description: 'Listening and emotional support' }
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
  }, []);

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
        await axios.post('/api/text-to-speech', { text: res.data.response });
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
              <div className="grid grid-cols-2 gap-2">
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
                      <div>
                        <div className="font-medium text-sm">{mode.name}</div>
                        <div className="text-xs opacity-70">{mode.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
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

            {/* Input Area */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Say something..."
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
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Weekly Reflection</h2>
            <div className="bg-zinc-800 rounded-lg p-6">
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
    <div className="flex h-screen bg-zinc-900 text-white">
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