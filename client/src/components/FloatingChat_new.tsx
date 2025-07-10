import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, Square, Volume2, VolumeX, Move, Maximize2 } from 'lucide-react';
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
  
  // Dragging and resizing state
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ width: 384, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    }
    if (isResizing) {
      const newWidth = Math.max(300, Math.min(800, resizeStart.width + (e.clientX - resizeStart.x)));
      const newHeight = Math.max(400, Math.min(700, resizeStart.height + (e.clientY - resizeStart.y)));
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDragging ? 'grabbing' : 'nw-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Load chat history when component opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      // Generate device fingerprint for anonymous user identification
      const deviceFingerprint = `browser_${navigator.userAgent.slice(0, 50)}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
      
      const response = await axios.get('/api/chat/history/1?limit=50', {
        headers: {
          'X-Device-Fingerprint': deviceFingerprint,
          'X-Session-Id': `session_${Date.now()}`
        }
      });
      const chatHistory = response.data.messages || [];
      
      console.log('Chat history loaded:', chatHistory.length, 'messages');
      
      if (chatHistory.length > 0) {
        setMessages(chatHistory);
      } else {
        // Only show greeting if no chat history exists
        setMessages([{
          sender: 'bot',
          text: 'Hello! I\'m Chakrai, How are you feeling today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to greeting message
      setMessages([{
        sender: 'bot',
        text: 'Hello! I\'m Chakrai, How are you feeling today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

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
      // Generate device fingerprint for anonymous user identification
      const deviceFingerprint = `browser_${navigator.userAgent.slice(0, 50)}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
      
      const response = await axios.post('/api/chat', {
        message: text.trim(),
        context: 'floating_chat',
        voice: selectedVoice,
        userId: 1,
        isAnonymous: true
      }, {
        headers: {
          'X-Device-Fingerprint': deviceFingerprint,
          'X-Session-Id': `session_${Date.now()}`
        }
      });

      const botMessage: Message = {
        sender: 'bot',
        text: response.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

      // Play voice if audio is available and voice is selected
      if (response.data.audio && selectedVoice) {
        try {
          const audioBlob = new Blob([Uint8Array.from(atob(response.data.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          setIsPlayingVoice(true);
          
          audio.onended = () => {
            setIsPlayingVoice(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
          };
          
          audio.onerror = () => {
            setIsPlayingVoice(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            console.error('Audio playback failed');
          };
          
          await audio.play();
        } catch (audioError) {
          console.error('Audio playback error:', audioError);
          setIsPlayingVoice(false);
        }
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

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingVoice(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await sendAudioToWhisper(audioBlob);
        }
      };
      
      recorder.start(1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', '1');
      
      // Generate device fingerprint for anonymous user identification
      const deviceFingerprint = `browser_${navigator.userAgent.slice(0, 50)}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
      
      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Device-Fingerprint': deviceFingerprint,
          'X-Session-Id': `session_${Date.now()}`
        }
      });
      
      if (response.data.transcription) {
        await sendMessage(response.data.transcription);
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

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border-2 border-silver"
        style={{
          backgroundColor: `var(--theme-primary)`,
          color: 'white',
          zIndex: 1000,
          right: `${position.x}px`,
          bottom: `${window.innerHeight - position.y - 60}px`
        }}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed rounded-2xl shadow-2xl flex flex-col border-2 border-silver select-none"
      style={{
        backgroundColor: `var(--theme-background)`,
        zIndex: 1000,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div 
        className="p-4 rounded-t-2xl flex items-center justify-between border-b drag-handle cursor-grab"
        style={{ 
          backgroundColor: `var(--theme-surface)`,
          borderColor: `var(--theme-accent)`
        }}
      >
        <div className="flex items-center space-x-2 drag-handle">
          <Move size={16} className="theme-text drag-handle opacity-50" />
          <MessageCircle size={20} className="theme-text drag-handle" />
          <h3 className="font-semibold theme-text drag-handle">Chakrai Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs theme-text-secondary">
            {size.width}x{size.height}
          </span>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/10 rounded theme-text"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'rounded-br-md' 
                  : 'rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.sender === 'user' 
                  ? `var(--theme-primary)` 
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
              className="w-full rounded-xl px-4 py-2 theme-text theme-text-secondary focus:outline-none focus:ring-1 floating-chat-input"
              style={{
                backgroundColor: `var(--theme-surface)`,
                border: `1px solid var(--theme-accent)`
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
              {isPlayingVoice ? <VolumeX size={18} /> : <Volume2 size={24} />}
            </button>
          )}

          {/* Microphone button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-xl transition-colors theme-text border-2 border-silver ${
              isRecording ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isRecording 
                ? '#ef4444'
                : `var(--theme-primary)`
            }}
            disabled={isLoading}
          >
            {isRecording ? <Square size={18} /> : <Mic size={24} />}
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage(inputMessage)}
            className="p-2 rounded-xl transition-colors disabled:opacity-50 theme-text border-2 border-silver"
            style={{
              backgroundColor: `var(--theme-primary)`
            }}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={24} />
          </button>
        </div>
        
        {isRecording && (
          <p className="text-xs mt-2 text-center animate-pulse" style={{ color: '#ef4444' }}>
            🎤 Recording... Tap the square to stop & send
          </p>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(-45deg, transparent 0%, transparent 30%, var(--theme-accent) 30%, var(--theme-accent) 35%, transparent 35%, transparent 65%, var(--theme-accent) 65%, var(--theme-accent) 70%, transparent 70%)`
        }}
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default FloatingChat;