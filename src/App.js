import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const chatHistory = [
  'Create welcome form',
  'Instructions',
  'Career',
  'Career',
  'Onboarding',
  'Onboarding',
];

// Generate or get a persistent user_id
function getOrCreateUserId() {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', userId);
  }
  return userId;
}

// Generate or get a persistent chat_id
function getOrCreateChatId() {
  let chatId = localStorage.getItem('chat_id');
  if (!chatId) {
    chatId = 'chat_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_id', chatId);
  }
  return chatId;
}

// Helper to get first 3 words of a string
function getShortTitle(text) {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= 3) return text;
  return words.slice(0, 3).join(' ') + ' ...';
}

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [references, setReferences] = useState([]);
  const chatEndRef = useRef(null);
  const userId = getOrCreateUserId();
  const chatId = getOrCreateChatId();
  const [chats, setChats] = useState([]); // [{ chatId, message }]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch(`http://localhost:8000/chats/${userId}`);
        const data = await res.json();
        const chatIds = data.chats || [];
        // Fetch the latest message for each chat
        const chatPreviews = await Promise.all(
          chatIds.map(async (chatId) => {
            try {
              const res = await fetch(`http://localhost:8000/chats/${userId}/${chatId}`);
              if (!res.ok) throw new Error('No response');
              const contentType = res.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Not JSON');
              }
              const chatData = await res.json();
              const messages = chatData.messages || [];
              const lastMsg = messages[messages.length - 1];
              return {
                chatId,
                message: lastMsg ? lastMsg.question : '(No messages yet)'
              };
            } catch {
              return { chatId, message: '(No messages yet)' };
            }
          })
        );
        setChats(chatPreviews);
      } catch (err) {
        setChats([]);
      }
    }
    fetchChats();
  }, [userId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { sender: 'ai', text: 'Thinking...' }]);
    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, chat_id: chatId, question: input })
      });
      const data = await response.json();
      console.log('Sending user_id:', userId, 'chat_id:', chatId);
      console.log('API response:', data);

      const lastMsg = data.message;

      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'ai', text: lastMsg?.answer || 'No response from AI.' }
      ]);

      if (Array.isArray(lastMsg?.sources)) {
        setReferences(prevRefs => {
          const newRefs = [...prevRefs];
          lastMsg.sources.forEach(src => {
            if (src.source && !newRefs.some(ref => ref.url === src.source)) {
              newRefs.push({ title: src.text || src.source, url: src.source });
            }
          });
          return newRefs;
        });
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'ai', text: 'Sorry, there was an error connecting to the AI.' }
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="mindmerge-app">
      <aside className="sidebar">
        <div className="sidebar-header">Civil Law Bot</div>
        <div className="sidebar-history">
          <div className="sidebar-history-header">Chat History <span className="history-count">{chatHistory.length}/50</span></div>
          <ul className="sidebar-history-list">
            {chats.length === 0 ? (
              <li className="sidebar-history-item">No chats yet</li>
            ) : (
              chats.map((chat, idx) => (
                <li className="sidebar-history-item" key={chat.chatId}>
                  {chat.message}
                </li>
              ))
            )}
          </ul>
          <button className="clear-history-btn">Clear history</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">AI Assistant</header>
        <section className="chat-section">
          <div className="chat-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </section>
        <footer className="footer">
          <input
            className="chat-input"
            placeholder="Start typing"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading}>Send</button>
        </footer>
      </main>
      <aside className="references-panel">
        <div className="references-header">References</div>
        <ul className="references-list">
          {references.map((ref, idx) => (
            <li className="reference-item" key={idx}>
              <a href={ref.url} target="_blank" rel="noopener noreferrer" title={ref.title}>
                {getShortTitle(ref.title)}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export default App;
