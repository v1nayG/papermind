import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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

  const handleNewChat = () => { navigate('/chat'); if (onClose) onClose(); };
  const handleSelectSession = (id) => { navigate(`/chat/${id}`); if (onClose) onClose(); };

  if (!user) return null;

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-top-row">
        {/* Hamburger on the left — closes the sidebar */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Chat
        </button>
      </div>
      <div className="sidebar-history-list">
        <div className="sidebar-section-title">Recent</div>
        {loading && !sessions.length ? <div className="sidebar-loading">Loading…</div>
          : !sessions.length ? <div className="sidebar-empty">Your research will appear here.</div>
          : sessions.map((session) => (
            <button key={session._id} className={`sidebar-history-item ${sessionId === session._id ? 'active' : ''}`}
              onClick={() => handleSelectSession(session._id)} title={session.topic}>
              <span className="history-item-icon">✦</span><span className="truncate-text">{session.topic}</span>
            </button>
          ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user-info"><div className="user-avatar">{user.email[0].toUpperCase()}</div><span className="user-email truncate-text">{user.email}</span></div>
        <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-logout-btn">Log out</button>
      </div>
    </aside>
  );
};

export default Sidebar;
