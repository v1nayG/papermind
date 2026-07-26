const Session = require('../models/Session');

// ── Export as Markdown ──────────────────────────────────────
const exportMarkdown = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const lines = [
      `# Research Report: ${session.topic}`,
      `**Mode:** ${session.mode} | **Date:** ${new Date(session.createdAt).toLocaleDateString()}`,
      '',
      session.report,
      '',
      '---',
      '',
      '## Sources',
      ...session.sources.map(
        (s, i) => `**[${i + 1}] [${s.title}](${s.url})**\n${s.summary}`
      ),
    ];

    if (session.conflicts && session.conflicts.length > 0) {
      lines.push('', '## Conflicts Detected', ...session.conflicts.map((c) => `- ${c}`));
    }

    const markdownContent = lines.join('\n');
    const filename = `papermind-${session.topic.slice(0, 30).replace(/\s+/g, '-')}.md`;
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdownContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportMarkdown };
