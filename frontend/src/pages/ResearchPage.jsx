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
    if (!isAuthenticated || isResearching) return;
    
    if (!sessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadSession = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/research/session/${sessionId}`, {
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
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/research/start`, {
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
    <div className="flex flex-col h-full bg-hero-bg relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col scrollbar-thin">
        {messages.length === 0 && !isResearching ? (
          <div className="m-auto text-center max-w-2xl text-foreground px-4 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight font-space text-white">
              Research Intelligence
            </h1>
            <p className="text-muted-foreground font-light text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
              Enter any topic to begin. PaperMind will autonomously search the web, analyze sources, and synthesize a comprehensive report.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex w-full animate-fade-in">
                {msg.role === 'user' ? (
                  <div className="ml-auto bg-[#0a84ff] text-white px-5 py-3.5 rounded-3xl rounded-tr-md max-w-[85%] sm:max-w-[75%] shadow-lg text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="mr-auto w-full bg-background border border-border/50 rounded-2xl rounded-tl-md shadow-2xl overflow-hidden relative">
                    {msg.error ? (
                      <div className="p-5 text-destructive bg-destructive/10 text-sm font-semibold tracking-wide border-b border-destructive/20 uppercase">
                        {msg.error}
                      </div>
                    ) : msg.report ? (
                      <div className="p-0">
                        <ReportView
                          report={msg.report}
                          sources={msg.sources}
                          conflicts={msg.conflicts}
                          sessionId={msg.sessionId}
                          topic={messages[idx - 1]?.content}
                        />
                      </div>
                    ) : (
                      <div className="p-5 bg-white/5 border-b border-white/5">
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
      <div className="p-4 sm:p-6 bg-gradient-to-t from-hero-bg via-hero-bg to-transparent flex flex-col items-center flex-shrink-0 z-10">
        <form 
          className="w-full max-w-4xl bg-background/80 backdrop-blur-xl border border-border rounded-[2rem] flex items-end p-2 pl-6 shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
          onSubmit={handleSubmit}
        >
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none text-foreground resize-none text-[15px] leading-relaxed py-3.5 max-h-[200px] min-h-[24px] outline-none placeholder:text-muted-foreground/60 scrollbar-thin"
            rows={1}
            placeholder="Message PaperMind..."
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
            className="w-10 h-10 ml-2 mb-1 flex items-center justify-center rounded-full bg-foreground text-background hover:bg-primary transition-all disabled:opacity-30 disabled:hover:bg-foreground flex-shrink-0 cursor-pointer"
            type="submit"
            disabled={isResearching || !topic.trim()}
          >
            {isResearching ? (
              <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            )}
          </button>
        </form>
        <div className="mt-3 text-[11px] text-muted-foreground/50 tracking-wide font-light text-center">
          PaperMind can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
