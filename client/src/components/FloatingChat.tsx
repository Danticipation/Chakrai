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
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  // Floating chat box when open
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">TrAI Companion</h3>
            <p className="text-white/80 text-xs">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-700/80 text-white border border-gray-600/50'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700/80 border border-gray-600/50 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
              disabled={isLoading || isRecording}
            />
          </div>
          
          {/* Voice controls */}
          {selectedVoice && (
            <button
              onClick={isPlayingVoice ? stopVoice : undefined}
              className={`p-2 rounded-xl transition-colors ${
                isPlayingVoice 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}
              disabled={!isPlayingVoice}
            >
              {isPlayingVoice ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          {/* Microphone button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-xl transition-colors ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            disabled={isLoading}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage(inputMessage)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        
        {isRecording && (
          <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
            🎤 Recording... Tap microphone to stop
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingChat;