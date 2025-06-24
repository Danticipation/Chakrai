import React, { useState } from 'react';
import axios from 'axios';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');

    try {
      const response = await axios.post('/api/chat', {
        message: messageText,
        userId: 1
      });
      
      const botMessage: Message = {
        sender: 'bot',
        text: response.data.message || 'Error: No response',
        time: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: `Connection failed: ${error}`,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>TraI Chat Test</h1>
      
      <div style={{ 
        height: '400px', 
        border: '1px solid #333', 
        padding: '10px', 
        overflowY: 'scroll',
        backgroundColor: '#2a2a2a',
        marginBottom: '10px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: msg.sender === 'user' ? '#0066cc' : '#333',
            borderRadius: '8px'
          }}>
            <strong>{msg.sender}:</strong> {msg.text}
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{msg.time}</div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px'
          }}
        />
        <button 
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}