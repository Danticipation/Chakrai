import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MessageCircle, Brain, BookOpen, Mic, User, Square, Send, Target, RotateCcw, Sun, Star, Heart } from 'lucide-react';
import axios from 'axios';
import MemoryDashboard from './components/MemoryDashboard';
import VoiceSelector from './components/VoiceSelector';
import OnboardingQuiz from './components/OnboardingQuiz';

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
  const [personalityMode, setPersonalityMode] = useState('friend');
  const [selectedReflectionVoice, setSelectedReflectionVoice] = useState('carla');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [selectedZodiacSign, setSelectedZodiacSign] = useState('');
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [dailyHoroscope, setDailyHoroscope] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const personalityModes = [
    'friend', 'counsel', 'study', 'diary', 'goal-setting', 'wellness', 'creative'
  ];

  useEffect(() => {
    fetchBotStats();
    fetchDailyAffirmation();
    fetchWeeklySummary();
    loadZodiacData();
  }, []);

  const fetchBotStats = async () => {
    try {
      const response = await fetch('/api/bot-stats');
      if (response.ok) {
        const stats = await response.json();
        setBotStats(stats);
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
        setDailyHoroscope(data.horoscope || 'Today brings new opportunities for growth.');
        setZodiacSign('aries');
      }
    } catch (error) {
      console.error('Failed to load horoscope:', error);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessageText = input.trim();
    const userMessage: Message = {
      sender: 'user',
      text: userMessageText,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/chat', { 
        message: userMessageText,
        userId: 1
      });
      
      const botResponse = res.data.message || res.data.response || 'No response received';

      const newMessage: Message = {
        sender: 'bot',
        text: botResponse,
        time: getCurrentTime()
      };

      setMessages(prev => [...prev, newMessage]);
      
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
          voice: selectedReflectionVoice,
          emotionalContext: 'calming'
        })
      });
        
      console.log('Audio response status:', audioResponse.status);
      
      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        console.log('CARLA AUDIO RECEIVED:', { audioUrlExists: !!audioData.audioUrl, audioLength: audioData.audioUrl?.length });
        
        if (audioData.audioUrl) {
          console.log('PLAYING CORRECT CARLA VOICE NOW');
          console.log('Audio URL length:', audioData.audioUrl.length);
          
          // Kill all existing audio completely
          document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            audio.remove();
          });
          
          // Force stop any browser TTS
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            speechSynthesis.pause();
          }
          
          // Create single audio element for Carla
          const carlaAudio = new Audio(audioData.audioUrl);
          carlaAudio.volume = 1.0;
          carlaAudio.preload = 'auto';
          
          // FORCE CARLA AUDIO PLAYBACK NOW
          carlaAudio.play().then(() => {
            console.log('AUTHENTIC CARLA VOICE PLAYING - SUCCESS!');
          }).catch((error) => {
            console.log('Browser autoplay blocked - audio will play on next interaction');
            console.log('CLICK ANYWHERE TO HEAR AUTHENTIC CARLA VOICE');
            
            // Store audio for immediate click playback
            (window as any).pendingCarlaAudio = carlaAudio;
            
            // Global click handler for immediate audio permission
            const playCarlaOnClick = () => {
              if ((window as any).pendingCarlaAudio) {
                (window as any).pendingCarlaAudio.play().then(() => {
                  console.log('AUTHENTIC CARLA VOICE NOW PLAYING!');
                  (window as any).pendingCarlaAudio = null;
                }).catch((err: any) => {
                  console.error('Final Carla playback failed:', err);
                });
              }
              document.removeEventListener('click', playCarlaOnClick);
            };
            
            document.addEventListener('click', playCarlaOnClick, { once: true });
          });
          
        } else {
          console.log('NO AUDIO URL RECEIVED');
        }
      } else {
        console.log('AUDIO REQUEST FAILED:', audioResponse.status);
      }
      
      setBotStats(prev => prev ? {
        ...prev,
        wordsLearned: res.data.wordsLearned || prev.wordsLearned,
        stage: res.data.stage || prev.stage,
        level: res.data.stage === 'Infant' ? 1 : res.data.stage === 'Toddler' ? 2 : res.data.stage === 'Child' ? 3 : res.data.stage === 'Adolescent' ? 4 : 5
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      
      // Test ElevenLabs API with selected voice
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `Testing ${selectedReflectionVoice} voice from ElevenLabs`,
          voice: selectedReflectionVoice
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
      console.log('Audio test failed:', error.message);
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting voice recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await sendAudioToWhisper(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
        setAudioChunks([]);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log('Recording started successfully');
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access denied. Please allow microphone permissions and try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping recording...');
      mediaRecorder.stop();
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
      
      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.text || data.transcription || '';
        
        if (transcribedText.trim()) {
          console.log('Transcription successful:', transcribedText);
          setInput(transcribedText);
        } else {
          console.log('No speech detected in audio');
        }
      } else {
        const errorData = await response.json();
        console.error('Transcription failed:', response.status, errorData);
        if (response.status === 401) {
          alert('OpenAI API key required for voice transcription. Please configure your API key.');
        } else if (response.status === 429) {
          alert('Voice transcription temporarily unavailable due to high demand. Please try again later.');
        } else {
          alert('Voice transcription failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Voice transcription error. Please check your connection.');
    }
  };

  const handleProfileSave = () => {
    if (newUserName.trim()) {
      console.log('Profile updated:', newUserName);
      setMessages([]);
      setNewUserName('');
      setShowSettings(false);
      
      setBotStats({
        level: 1,
        stage: 'Therapist',
        wordsLearned: 1000
      });
    }
  };

  const handleClearMemory = () => {
    setMessages([]);
    setBotStats(null);
    setShowSettings(false);
    console.log('Memory cleared');
  };

  const handleCreateJournalEntry = async () => {
    try {
      const title = prompt("Journal Entry Title (optional):");
      const content = prompt("What's on your mind today?");
      
      if (content && content.trim()) {
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            title: title || '',
            content: content.trim(),
            mood: 'neutral',
            moodIntensity: 5
          })
        });
        
        if (response.ok) {
          console.log('Journal entry created successfully');
          fetchWellnessData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const handleMoodSelection = async (mood: string, intensity: number) => {
    try {
      const response = await fetch('/api/mood/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          mood,
          intensity,
          notes: `Quick mood check: ${mood}`
        })
      });
      
      if (response.ok) {
        console.log('Mood entry created successfully');
        fetchWellnessData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create mood entry:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            {/* Welcome Header */}
            <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-white">Welcome to TraI</h2>
              <p className="text-gray-400 text-sm">Your therapeutic AI companion</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70">{message.time}</span>
                    <span className="text-xs opacity-70">{message.time}</span>
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

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white shadow-lg disabled:opacity-50`}
                  title={isRecording ? 'Stop recording (auto-stops in 30s)' : 'Start voice recording'}
                  disabled={loading}
                >
                  {isRecording ? <Square size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'journal':
        return (
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Therapeutic Journal</h2>
            
            {/* New Entry Button */}
            <button 
              onClick={() => handleCreateJournalEntry()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 mb-4 flex items-center justify-center space-x-2"
            >
              <span>✍️</span>
              <span>New Journal Entry</span>
            </button>

            {/* Quick Mood Check */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">How are you feeling?</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { emoji: '😊', label: 'Happy', color: 'bg-green-500' },
                  { emoji: '😐', label: 'Neutral', color: 'bg-gray-500' },
                  { emoji: '😔', label: 'Sad', color: 'bg-blue-500' },
                  { emoji: '😰', label: 'Anxious', color: 'bg-red-500' }
                ].map((mood, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleMoodSelection(mood.label.toLowerCase(), 5)}
                    className={`${mood.color} hover:opacity-80 text-white rounded-lg p-3 text-center transition-colors`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Entries</h3>
              <div className="space-y-3">
                {[
                  { date: 'Today', preview: 'Feeling more optimistic about my progress...', mood: '😊' },
                  { date: 'Yesterday', preview: 'Had a challenging day but used breathing techniques...', mood: '😐' },
                  { date: '2 days ago', preview: 'Grateful for small victories and support...', mood: '😊' }
                ].map((entry, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-700 rounded-r-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">{entry.date}</span>
                      <span className="text-lg">{entry.mood}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{entry.preview}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">AI Insights</h3>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <p className="text-blue-200 text-sm">
                  Your recent entries show improved emotional regulation. Consider exploring the mindfulness exercises when feeling overwhelmed.
                </p>
              </div>
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Community Support</h2>
            
            {/* Support Groups */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Support Groups</h3>
              <div className="space-y-3">
                {[
                  { name: 'Anxiety Support', members: 234, active: true },
                  { name: 'Depression Recovery', members: 156, active: false },
                  { name: 'Mindfulness Practice', members: 89, active: true },
                  { name: 'Crisis Support', members: 67, active: true, priority: true }
                ].map((group, index) => (
                  <div key={index} className={`p-3 rounded-lg ${group.priority ? 'bg-red-900/30 border border-red-700' : 'bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{group.name}</h4>
                        <p className="text-sm text-gray-400">{group.members} members</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${group.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peer Check-ins */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Peer Check-ins</h3>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 mb-3">
                Send Daily Check-in
              </button>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">SafeSpace22 checked in</span>
                  <span className="text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">HopeSeeker sent support</span>
                  <span className="text-gray-400">4h ago</span>
                </div>
              </div>
            </div>

            {/* Anonymous Forum */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Anonymous Forum</h3>
              <div className="space-y-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">"Finally had a breakthrough with my therapist today..."</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>KindHeart123</span>
                    <span>💙 12</span>
                    <span>3 replies</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">"Looking for advice on managing work stress..."</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>StrongTree45</span>
                    <span>💙 8</span>
                    <span>7 replies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">AI Insights & Analytics</h2>
            
            {/* Emotional Patterns */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Emotional Patterns</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">Mon</div>
                  <div className="text-sm text-gray-400">Most Positive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">Thu</div>
                  <div className="text-sm text-gray-400">Needs Support</div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-300 text-sm">
                  Your mood tends to improve after mindfulness sessions. Consider scheduling them on challenging days.
                </p>
              </div>
            </div>

            {/* Coping Strategies */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Effective Coping Strategies</h3>
              <div className="space-y-3">
                {[
                  { strategy: 'Deep Breathing', effectiveness: 89, usage: 'High' },
                  { strategy: 'Journaling', effectiveness: 76, usage: 'Medium' },
                  { strategy: 'Exercise', effectiveness: 82, usage: 'Low' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-white">{item.strategy}</span>
                      <span className="text-sm text-gray-400 ml-2">({item.usage} usage)</span>
                    </div>
                    <div className="text-green-400 font-bold">{item.effectiveness}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Report */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Monthly Wellness Report</h3>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 mb-3">
                Generate Full Report
              </button>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-400">+23%</div>
                  <div className="text-sm text-gray-400">Mood Improvement</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">18</div>
                  <div className="text-sm text-gray-400">Active Days</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Daily Reflection</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Daily Affirmation</h3>
              <p className="text-gray-300 mb-4">{dailyAffirmation}</p>
              <button
                onClick={() => testAudio()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                🔊 Read Aloud
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Voice Selection</h3>
              <select
                value={selectedReflectionVoice}
                onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              >
                <option value="james">James (Male American)</option>
                <option value="brian">Brian (Deep Male American)</option>
                <option value="alexandra">Alexandra (Female American)</option>
                <option value="carla">Carla (Warm Female American)</option>
              </select>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Progress & Analytics</h2>
            
            {/* Wellness Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">78%</div>
                <div className="text-sm text-blue-200">Wellness Score</div>
                <div className="text-xs text-blue-300 mt-1">↗ +5% this week</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-green-200">Day Streak</div>
                <div className="text-xs text-green-300 mt-1">Daily check-ins</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-sm text-purple-200">Goals Active</div>
                <div className="text-xs text-purple-300 mt-1">3 completed this month</div>
              </div>
            </div>

            {/* Mood Tracking */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Mood Tracking</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Today's Mood</span>
                <div className="flex space-x-2">
                  {['😢', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                    <button key={index} className="text-2xl p-2 rounded-lg hover:bg-gray-700 transition-colors">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Weekly Trend</div>
                <div className="h-8 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded opacity-60"></div>
              </div>
            </div>

            {/* Therapeutic Goals */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Active Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Daily Mindfulness (10 min)</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Anxiety Management Skills</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Social Connection</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Achievements</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-3xl mb-1">🎯</div>
                  <div className="text-xs text-gray-400">First Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">💚</div>
                  <div className="text-xs text-gray-400">Weekly Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🧘</div>
                  <div className="text-xs text-gray-400">Mindful</div>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-3xl mb-1">🌟</div>
                  <div className="text-xs text-gray-400">Next Goal</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Voice Settings</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Voice Selection</h3>
              <select
                value={selectedReflectionVoice}
                onChange={(e) => setSelectedReflectionVoice(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600 mb-3"
              >
                <option value="james">James (Male American)</option>
                <option value="brian">Brian (Deep Male American)</option>
                <option value="alexandra">Alexandra (Female American)</option>
                <option value="carla">Carla (Warm Female American)</option>
              </select>
              
              <button
                onClick={testAudio}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                🔊 Test Selected Voice
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Audio Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-white">ElevenLabs Audio</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-green-500">
                  Active
                </span>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Profile</h3>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600 mb-3"
              />
              <button
                onClick={handleProfileSave}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save Profile
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Personality Mode</h3>
              <select
                value={personalityMode}
                onChange={(e) => setPersonalityMode(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              >
                {personalityModes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Data Management</h3>
              <button
                onClick={handleClearMemory}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Clear Memory
              </button>
            </div>
          </div>
        );

      default:
        return <div className="p-4 text-white">Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={traiLogo} alt="TraI Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold">TraI</h1>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-gray-400 hover:text-white"
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Navigation */}
      <div className="bg-gray-800/50 backdrop-blur border-t border-gray-700 p-4">
        <div className="flex justify-around">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'journal', icon: BookOpen, label: 'Journal' },
            { id: 'progress', icon: Target, label: 'Progress' },
            { id: 'community', icon: Heart, label: 'Community' },
            { id: 'insights', icon: Brain, label: 'Insights' },
            { id: 'voice', icon: Mic, label: 'Voice' },
            { id: 'settings', icon: User, label: 'Settings' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded transition-colors ${
                activeSection === id ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>



      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50">
          <OnboardingQuiz 
            onComplete={() => setShowOnboarding(false)} 
          />
        </div>
      )}
    </div>
  );
};

function AppWithOnboarding() {
  // Skip onboarding for now and go directly to main app
  const onboardingStatus = { isComplete: true };
  const onboardingLoading = false;

  // Show main application
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding />
    </QueryClientProvider>
  );
}