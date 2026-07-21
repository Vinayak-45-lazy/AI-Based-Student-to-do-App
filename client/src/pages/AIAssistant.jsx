import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Clock, BrainCircuit, ListCollapse } from 'lucide-react';
import { api } from '../utils/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! I am your **StudyFlow AI Coach** 🎓. I can design custom revision lists, explain study methodologies (like **Feynman** or **Active Recall**), or offer daily focus ideas. What course or topic are we prepping for today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const presets = [
    { label: 'Explain Feynman Method', text: 'Explain the Feynman Technique in detail.' },
    { label: 'How to use Pomodoros', text: 'How do I set up Pomodoro focus blocks?' },
    { label: 'Explain Active Recall', text: 'How can I practice active recall while studying?' },
    { label: 'Generate Revision Plan', text: 'Create a 14-day revision schedule template for my upcoming exam.' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend || textToSend.trim() === '') return;

    // Add user message
    const updatedMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      // Map history for API
      const history = updatedMessages.slice(0, -1);
      
      const response = await api.ai.chat(textToSend, history);
      setMessages(prev => [...prev, { role: 'model', text: response.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: '⚠️ **Connection Error:** I was unable to connect to the AI scheduling hub. Please ensure the backend server is active or try checking your internet connection.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown-like block formatter for responses
  const renderMessageContent = (text) => {
    // Convert bold **text** to HTML strong tags
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points starting with * or - to lists
    const lines = formatted.split('\n');
    let insideList = false;
    const finalElements = [];

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      
      // Headers
      if (cleanLine.startsWith('### ')) {
        if (insideList) {
          finalElements.push('</ul>');
          insideList = false;
        }
        finalElements.push(`<h4 class="chat-h4">${cleanLine.replace('### ', '')}</h4>`);
      } else if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.match(/^\d+\.\s/)) {
        if (!insideList) {
          finalElements.push('<ul class="chat-ul">');
          insideList = true;
        }
        const bulletText = cleanLine.replace(/^(\*\s|-\s|\d+\.\s)/, '');
        finalElements.push(`<li class="chat-li">${bulletText}</li>`);
      } else if (cleanLine === '') {
        if (insideList) {
          finalElements.push('</ul>');
          insideList = false;
        }
        finalElements.push('<br/>');
      } else {
        if (insideList) {
          finalElements.push('</ul>');
          insideList = false;
        }
        finalElements.push(`<p class="chat-p">${cleanLine}</p>`);
      }
    });

    if (insideList) {
      finalElements.push('</ul>');
    }

    return (
      <div 
        className="message-formatted-text"
        dangerouslySetInnerHTML={{ __html: finalElements.join('') }}
      />
    );
  };

  return (
    <div className="assistant-container animate-fade-in">
      <div className="assistant-grid">
        {/* Chat window */}
        <div className="chat-window-panel glass-panel">
          <div className="chat-header">
            <Sparkles size={18} className="icon-glow" />
            <h3>StudyFlow AI Coach</h3>
          </div>

          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble-row ${m.role === 'user' ? 'user-row' : 'model-row'}`}>
                <div className="message-avatar">
                  {m.role === 'user' ? '👤' : '✨'}
                </div>
                <div className="message-text-bubble">
                  {renderMessageContent(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-bubble-row model-row">
                <div className="message-avatar">✨</div>
                <div className="message-text-bubble loading-bubble">
                  <span className="dot-pulse-1">●</span>
                  <span className="dot-pulse-2">●</span>
                  <span className="dot-pulse-3">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Ask anything about your studies..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              disabled={loading}
              className="form-input chat-input-field"
            />
            <button 
              onClick={() => handleSendMessage(inputText)} 
              disabled={loading || !inputText.trim()}
              className="btn btn-primary chat-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Suggestion Prompts */}
        <div className="chat-sidebar-panel">
          <div className="glass-panel presets-panel">
            <h4>Quick Templates</h4>
            <p className="presets-desc">Select a preset to guide your conversation:</p>
            <div className="presets-list">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  disabled={loading}
                  className="preset-btn-item"
                >
                  {idx === 0 && <BrainCircuit size={14} />}
                  {idx === 1 && <Clock size={14} />}
                  {idx === 2 && <BookOpen size={14} />}
                  {idx === 3 && <ListCollapse size={14} />}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .assistant-container {
          height: calc(100vh - 160px);
          min-height: 500px;
        }

        .assistant-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
          height: 100%;
        }

        .chat-window-panel {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          height: 100%;
          padding: 0;
          overflow: hidden;
        }

        .chat-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.01);
        }

        .icon-glow {
          color: var(--primary);
          filter: drop-shadow(0 0 4px var(--primary-glow));
        }

        .chat-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .chat-messages-container {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: rgba(0, 0, 0, 0.05);
        }

        .message-bubble-row {
          display: flex;
          gap: 0.75rem;
          max-width: 80%;
          align-self: flex-start;
        }

        .message-bubble-row.user-row {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--card-border);
          flex-shrink: 0;
        }

        .user-row .message-avatar {
          background: linear-gradient(135deg, var(--accent), var(--primary));
        }

        .message-text-bubble {
          padding: 0.85rem 1.25rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-primary);
        }

        .user-row .message-text-bubble {
          background: var(--sidebar-active);
          border-color: rgba(99, 102, 241, 0.25);
        }

        .loading-bubble {
          display: flex;
          gap: 4px;
          color: var(--text-muted);
          padding: 0.75rem 1.25rem;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .dot-pulse-1, .dot-pulse-2, .dot-pulse-3 {
          animation: pulseDot 1.2s infinite;
          font-size: 0.65rem;
        }
        .dot-pulse-2 { animation-delay: 0.2s; }
        .dot-pulse-3 { animation-delay: 0.4s; }

        /* Formatted Response Styles */
        .chat-h4 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }

        .chat-p {
          margin-bottom: 0.5rem;
        }

        .chat-ul {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .chat-li {
          margin-bottom: 0.25rem;
        }

        .chat-input-row {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--card-border);
          display: flex;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.01);
        }

        .chat-input-field {
          flex: 1;
        }

        .chat-send-btn {
          padding: 0 1.25rem;
        }

        /* Sidebar Presets */
        .chat-sidebar-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .presets-panel h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .presets-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .presets-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .preset-btn-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.65rem 0.85rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 10px;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .preset-btn-item:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--sidebar-active);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .assistant-grid {
            grid-template-columns: 1fr;
          }
          .chat-sidebar-panel {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
