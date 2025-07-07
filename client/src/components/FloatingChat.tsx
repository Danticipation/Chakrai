import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedVoice: string;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ isOpen, onToggle, selectedVoice }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: 'Hello! I\'m your TrAI wellness companion. How are you feeling today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: text.trim(),
        context: 'floating_chat'
      });

      const botMessage: Message = {
        sender: 'bot',
        text: response.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-play voice response if voice is enabled
      if (selectedVoice && response.data.response) {
        playVoiceResponse(response.data.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoiceResponse = async (text: string) => {
    if (!selectedVoice || isPlayingVoice) return;

    setIsPlayingVoice(true);
    try {
      const response = await axios.post('/api/text-to-speech', {
        text,
        voice: selectedVoice
      }, { responseType: 'blob' });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing voice:', error);
      setIsPlayingVoice(false);
    }
  };

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingVoice(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });

      const options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/wav';
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: options.mimeType });
        await sendAudioToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.text) {
        await sendMessage(response.data.text);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Chat bubble when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="theme-primary hover:theme-primary-dark theme-text p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse"
          style={{ 
            backdropFilter: 'blur(10px)',
            background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))`
          }}
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  // Floating chat box when open
  return (
    <div 
      className="fixed bottom-6 right-6 w-96 h-[500px] backdrop-blur-xl border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--theme-background), var(--theme-surface))`,
        borderColor: `var(--theme-accent)`
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))`
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <MessageCircle size={20} className="theme-text" />
          </div>
          <div>
            <h3 className="theme-text font-semibold">TrAI Companion</h3>
            <p className="theme-text-secondary text-xs">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="theme-text-secondary hover:theme-text transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] p-3 rounded-2xl theme-text"
              style={{
                background: message.sender === 'user'
                  ? `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))`
                  : `var(--theme-surface)`,
                border: message.sender === 'user' ? 'none' : `1px solid var(--theme-accent)`
              }}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs theme-text-secondary mt-1 block">{message.time}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: `var(--theme-surface)`,
                border: `1px solid var(--theme-accent)`
              }}
            >
              <div className="flex space-x-1">
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: `var(--theme-accent)` }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: `var(--theme-accent)`,
                    animationDelay: '0.1s'
                  }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: `var(--theme-accent)`,
                    animationDelay: '0.2s'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: `var(--theme-accent)` }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full rounded-xl px-4 py-2 theme-text theme-text-secondary focus:outline-none focus:ring-1"
              style={{
                backgroundColor: `var(--theme-surface)`,
                border: `1px solid var(--theme-accent)`,
                '&:focus': {
                  borderColor: `var(--theme-primary)`,
                  boxShadow: `0 0 0 1px var(--theme-primary)`
                }
              }}
              disabled={isLoading || isRecording}
            />
          </div>
          
          {/* Voice controls */}
          {selectedVoice && (
            <button
              onClick={isPlayingVoice ? stopVoice : undefined}
              className="p-2 rounded-xl transition-colors theme-text"
              style={{
                backgroundColor: isPlayingVoice 
                  ? '#ef4444' 
                  : `var(--theme-surface)`,
                border: `1px solid var(--theme-accent)`
              }}
              disabled={!isPlayingVoice}
            >
              {isPlayingVoice ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          {/* Microphone button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-xl transition-colors theme-text ${
              isRecording ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isRecording 
                ? '#ef4444'
                : `var(--theme-primary)`,
              border: `1px solid var(--theme-accent)`
            }}
            disabled={isLoading}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage(inputMessage)}
            className="p-2 rounded-xl transition-colors disabled:opacity-50 theme-text"
            style={{
              backgroundColor: `var(--theme-primary)`,
              border: `1px solid var(--theme-accent)`
            }}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        
        {isRecording && (
          <p className="text-xs mt-2 text-center animate-pulse" style={{ color: '#ef4444' }}>
            🎤 Recording... Tap microphone to stop
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingChat;