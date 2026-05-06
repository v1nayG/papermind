import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

const ReportView = ({ report, sources = [], conflicts = [], sessionId, topic }) => {
  const handleDownload = async (url) => {
    const token = localStorage.getItem('accessToken'); // use updated key
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      alert('Export failed. Please try again.');
      return;
    }

    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = url.includes('pdf') ? 'report.pdf' : 'report.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <div>
          <h2>{topic}</h2>
          <p style={{ marginTop: 4, fontSize: '0.85rem' }}>
            {sources.length} sources synthesized
          </p>
        </div>
        {sessionId && (
          <div className="export-btns">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleDownload(api.getMarkdownUrl(sessionId))}
            >
              ↓ Markdown
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleDownload(api.getPdfUrl(sessionId))}
            >
              ↓ PDF
            </button>
          </div>
        )}
      </div>

      {/* Report Body */}
      <div className="report-body">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>

      {/* Conflicts */}
      {conflicts && conflicts.length > 0 && (
        <div className="conflicts-box">
          <h3>⚠️ Conflicts Detected Between Sources</h3>
          <ul>
            {conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="sources-section">
          <h3>📚 Sources ({sources.length})</h3>
          {sources.map((s, i) => (
            <div key={i} className="source-item">
              <div className="source-num">{i + 1}</div>
              <div className="source-content">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title || s.url}
                </a>
                <p>{s.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportView;
