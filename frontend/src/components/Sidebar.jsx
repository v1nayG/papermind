import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from './ui/button';
import { LogOut, Plus, MessageSquare, PanelLeftClose } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();

  useEffect(() => { if (user) fetchHistory(); }, [user, location.pathname]);

  const fetchHistory = async () => {
    setLoading(true);
    try { setSessions((await api.getHistory()).sessions || []); }
    catch (error) { console.error('Failed to fetch history:', error); }
    finally { setLoading(false); }
  };

  const handleNewChat = () => { navigate('/chat'); if (onClose && window.innerWidth < 768) onClose(); };
  const handleSelectSession = (id) => { navigate(`/chat/${id}`); if (onClose && window.innerWidth < 768) onClose(); };

  if (!user) return null;

  return (
    <aside className="w-full h-full bg-background border-r border-border flex flex-col p-4 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <button 
          className="p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" 
          onClick={onClose} 
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
        <Button onClick={handleNewChat} className="flex-1 font-semibold tracking-wide uppercase text-xs">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2 scrollbar-thin">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-bold px-2">
          Recent Research
        </div>
        {loading && !sessions.length ? (
          <div className="px-2 text-xs text-muted-foreground font-light">Loading...</div>
        ) : !sessions.length ? (
          <div className="px-2 text-xs text-muted-foreground font-light">Your research will appear here.</div>
        ) : (
          sessions.map((session) => (
            <button 
              key={session._id} 
              className={`flex items-center gap-3 w-full p-3 rounded-md text-sm font-light text-left transition-all border-l-2 cursor-pointer ${
                sessionId === session._id 
                  ? 'bg-white/10 text-foreground border-primary' 
                  : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
              onClick={() => handleSelectSession(session._id)} 
              title={session.topic}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${sessionId === session._id ? 'text-primary' : 'text-muted-foreground/50'}`} />
              <span className="truncate">{session.topic}</span>
            </button>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2 rounded-md overflow-hidden bg-black/20 border border-border/30">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
            {user.email[0].toUpperCase()}
          </div>
          <span className="text-xs text-muted-foreground truncate flex-1 font-light">{user.email}</span>
        </div>
        <button 
          onClick={() => { logout(); navigate('/auth'); }} 
          className="flex items-center justify-center gap-2 w-full p-2.5 rounded-md text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
