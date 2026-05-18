import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import ReportView from '../components/ReportView';

const ResearchPage = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('report');
  const [messages, setMessages] = useState([]);
  const [isResearching, setIsResearching] = useState(false);
  
  const { accessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sessionId || !isAuthenticated || isResearching) return;
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/research/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (cancelled || !data.session) return;
        const session = data.session;
        setMessages([
          { role: 'user', content: session.topic },
          { role: 'ai', sessionId: session._id, report: session.report, sources: session.sources,
            conflicts: session.conflicts, error: session.status === 'error' ? 'This research run did not complete.' : null },
        ]);
      } catch {
        if (!cancelled) setMessages([]);
      }
    };
    loadSession();
    return () => { cancelled = true; };
  }, [sessionId, accessToken, isAuthenticated]);

  // Auto-resize textarea
  const handleInput = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    setTopic(target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (!topic.trim() || isResearching) return;

    const currentTopic = topic.trim();
    setTopic('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message and initial AI loading message
    const newMessageList = [
      ...messages,
      { role: 'user', content: currentTopic },
      { role: 'ai', stage: 'searching', message: 'Starting research...', report: null, error: null }
    ];
    setMessages(newMessageList);
    setIsResearching(true);

    try {
      const response = await fetch('http://localhost:5000/api/research/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ topic: currentTopic, mode }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); 

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;
            try {
              const payload = JSON.parse(dataStr);
              
              setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                
                if (payload.sessionId && !payload.report) {
                  lastMsg.sessionId = payload.sessionId;
                  if (!sessionId) navigate(`/chat/${payload.sessionId}`, { replace: true });
                }
                if (payload.stage) {
                  lastMsg.stage = payload.stage;
                  lastMsg.message = payload.message || '';
                }
                if (payload.report) {
                  lastMsg.report = payload.report;
                  lastMsg.sources = payload.sources;
                  lastMsg.conflicts = payload.conflicts;
                  lastMsg.sessionId = payload.sessionId;
                  setIsResearching(false);
                }
                if (payload.message && !payload.stage && !payload.report) {
                  lastMsg.error = payload.message;
                  setIsResearching(false);
                }
                return newMsgs;
              });

            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].error = 'Connection failed. Make sure the backend server is running.';
        return newMsgs;
      });
      setIsResearching(false);
    }
  };

  return (
    <div className="chat-layout">
      {/* Messages Area */}
      <div className="chat-history">
        {messages.length === 0 && !isResearching ? (
          <div className="chat-empty">
            <div className="chat-empty-mark">✦</div>
            <h1 className="chat-empty-title">What would you like to research?</h1>
            <p className="chat-empty-subtitle">Ask PaperMind to search the web, read sources, and turn them into a cited report.</p>
          </div>
        ) : (
          <div className="chat-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
                {msg.role === 'user' ? (
                  <div className="chat-bubble-user">{msg.content}</div>
                ) : (
                  <div className="chat-bubble-ai">
                    {msg.error ? (
                      <div className="error-msg">{msg.error}</div>
                    ) : msg.report ? (
                      <ReportView
                        report={msg.report}
                        sources={msg.sources}
                        conflicts={msg.conflicts}
                        sessionId={msg.sessionId}
                        topic={messages[idx - 1]?.content}
                      />
                    ) : (
                      <div className="chat-ai-progress">
                        <ProgressBar currentStage={msg.stage} message={msg.message} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-wrapper">
        <form className="chat-input-box" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder="Message PaperMind"
            value={topic}
            onChange={handleInput}
            disabled={isResearching}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                if(topic.trim() && !isResearching) handleSubmit(e); 
              }
            }}
          />
          <button
            className="chat-submit-btn"
            type="submit"
            disabled={isResearching || !topic.trim()}
          >
            {isResearching ? (
              <div className="spinner-small" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
        <div className="chat-footer">
          PaperMind can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
