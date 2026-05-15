import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReportView from '../components/ReportView';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await api.getHistory();
    setSessions(data.sessions || []);
    setLoading(false);
  };

  const openSession = async (id) => {
    setLoadingSession(true);
    setSelectedSession(null);
    const data = await api.getSession(id);
    setSelectedSession(data.session);
    setLoadingSession(false);
  };

  if (loading) {
    return (
      <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="page container">
      {selectedSession ? (
        <>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedSession(null)}
            style={{ marginBottom: 24 }}
          >
            ← Back to History
          </button>
          <ReportView
            report={selectedSession.report}
            sources={selectedSession.sources}
            conflicts={selectedSession.conflicts}
            sessionId={selectedSession._id}
            topic={selectedSession.topic}
          />
        </>
      ) : (
        <>
          <h2 style={{ marginBottom: 8 }}>Research History</h2>
          <p style={{ marginBottom: 24 }}>Click any session to view the full report</p>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <h3>No research sessions yet</h3>
              <p>Go back to the home page and research your first topic!</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
                Start Researching
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  className="card history-card"
                  onClick={() => openSession(s._id)}
                  id={`session-${s._id}`}
                >
                  <div>
                    <div className="history-topic">{s.topic}</div>
                    <div className="history-meta">
                      {new Date(s.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${s.mode}`}>{s.mode}</span>
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loadingSession && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <span className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
