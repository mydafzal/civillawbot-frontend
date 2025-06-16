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

const references = [
  { title: 'React Documentation', url: 'https://reactjs.org/' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
  { title: 'OpenAI API', url: 'https://platform.openai.com/docs/' },
];

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'This is a placeholder AI response.' }
      ]);
    }, 700);
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
            {chatHistory.map((item, idx) => (
              <li className={`sidebar-history-item${idx === 0 ? ' active' : ''}`} key={idx}>{item}</li>
            ))}
          </ul>
          <button className="clear-history-btn">Clear history</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">AI Chat Helper</header>
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
          />
          <button className="send-btn" onClick={handleSend}>Send</button>
        </footer>
      </main>
      <aside className="references-panel">
        <div className="references-header">References</div>
        <ul className="references-list">
          {references.map((ref, idx) => (
            <li className="reference-item" key={idx}>
              <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export default App;
