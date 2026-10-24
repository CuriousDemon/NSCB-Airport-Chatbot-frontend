import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
const API_URL = `${import.meta.env.VITE_API_URL}/api/chat/message`;

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to NSCBI Airport (Kolkata) Timing Assistant ✈️\n\nEnter your flight departure time (HH:MM) or pick an option below to plan your airport visit.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading) return;

    // 1. Append user message to state
    const newChatHistory = [...messages, { sender: 'user', text: userText }];
    setMessages(newChatHistory);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // 2. Send the message to the deployed Express backend
      const response = await axios.post(API_URL, {
        message: userText
      });

      // 3. Append bot response
      setMessages([...newChatHistory, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newChatHistory,
        { sender: 'bot', text: '⚠️ Unable to connect to airport server. Ensure the backend is running on port 5000.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="chat-container">
      {/* Airport Header */}
      <div className="chat-header">
        <div>
          <h2>NSCBI Airport Kolkata</h2>
          <p>Terminal Departure & Gate Schedule Bot</p>
        </div>
      </div>

      {/* Message Stream */}
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.sender}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg bot">Checking airport schedule rules...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Option Buttons */}
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => sendMessage('Domestic flight at 18:30')}>
          Domestic 18:30
        </button>
        <button className="quick-btn" onClick={() => sendMessage('International flight at 21:00')}>
          International 21:00
        </button>
        <button className="quick-btn" onClick={() => sendMessage('Domestic rules')}>
          Domestic Rules
        </button>
      </div>

      {/* Input Bar */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="e.g. My domestic flight is at 16:45..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
