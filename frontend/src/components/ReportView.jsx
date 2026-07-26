import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { FileText, AlertTriangle, Link2 } from 'lucide-react';

const ReportView = ({ report, sources = [], conflicts = [], sessionId, topic }) => {
  const handleDownload = async (url) => {
    const token = localStorage.getItem('accessToken');
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
    <div className="w-full flex flex-col text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/10 bg-white/5">
        <div>
          <h2 className="text-xl font-bold font-space text-white">{topic || 'Intelligence Report'}</h2>
          <p className="text-xs text-primary mt-1 font-semibold uppercase tracking-widest">
            {sources.length} sources synthesized
          </p>
        </div>
        {sessionId && (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
              onClick={() => handleDownload(api.getMarkdownUrl(sessionId))}
            >
              <FileText className="w-3.5 h-3.5" />
              Export MD
            </button>
          </div>
        )}
      </div>

      {/* Conflicts */}
      {conflicts && conflicts.length > 0 && (
        <div className="m-6 p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-center gap-2 text-amber-500 font-bold mb-3 uppercase text-xs tracking-widest font-space">
            <AlertTriangle className="w-4 h-4" />
            Data Conflicts Detected
          </div>
          <ul className="space-y-2">
            {conflicts.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-500/80 leading-relaxed font-light">
                <span className="text-amber-500 mt-1">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Body */}
      <div className="p-6 md:p-8">
        <div className="prose prose-invert prose-green max-w-none prose-headings:font-space prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white prose-p:leading-relaxed prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-white/10 prose-td:p-3 overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="p-6 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground font-space uppercase tracking-widest text-xs font-bold mb-4">
            <Link2 className="w-4 h-4" />
            Citations & Sources
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer block"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {s.title || s.url}
                    </div>
                    {s.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {s.summary}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportView;
