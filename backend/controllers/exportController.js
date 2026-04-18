const Session = require('../models/Session');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

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

// ── Export as PDF ───────────────────────────────────────────
const exportPDF = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Build full markdown content
    const sourcesMarkdown = session.sources
      .map((s, i) => `**[${i + 1}] [${s.title}](${s.url})**  \n${s.summary}`)
      .join('\n\n');

    const conflictsMarkdown =
      session.conflicts && session.conflicts.length > 0
        ? `## Data Conflicts Detected\n\n${session.conflicts.map((c) => `- ${c}`).join('\n')}`
        : '';

    const fullMarkdown = `${session.report}\n\n---\n\n## Sources & Citations\n\n${sourcesMarkdown}\n\n${conflictsMarkdown}`;

    // Convert markdown to HTML
    const reportHtml = marked(fullMarkdown);

    // Build a fully styled HTML document
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${session.topic} — PaperMind Research Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.75;
      color: #1a1a2e;
      background: #fff;
      padding: 0;
    }

    /* ── Cover header ── */
    .cover {
      background: linear-gradient(135deg, #0d0d1a 0%, #0b1a2e 100%);
      color: #fff;
      padding: 52px 60px 40px;
      margin-bottom: 0;
    }
    .cover-label {
      font-size: 8pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #0b93f6;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .cover-title {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 26pt;
      font-weight: 700;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 20px;
      max-width: 680px;
    }
    .cover-meta {
      font-size: 9pt;
      color: rgba(255,255,255,0.5);
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .cover-meta span { display: flex; align-items: center; gap: 6px; }
    .cover-divider {
      height: 3px;
      background: linear-gradient(90deg, #0b93f6, transparent);
      margin-bottom: 0;
    }

    /* ── Body container ── */
    .body {
      padding: 48px 60px 60px;
      max-width: 820px;
      margin: 0 auto;
    }

    /* ── Typography ── */
    h1 {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 20pt;
      font-weight: 700;
      color: #0d0d1a;
      margin: 36px 0 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0b93f6;
    }
    h2 {
      font-family: 'Inter', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: #0d0d1a;
      margin: 28px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #1e293b;
      margin: 20px 0 8px;
    }
    p {
      margin-bottom: 14px;
      color: #1e293b;
    }

    /* ── Images ── */
    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 16px 0;
      display: block;
    }

    /* ── Inline citations ── */
    a {
      color: #0b93f6;
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }

    /* ── Blockquote ── */
    blockquote {
      border-left: 4px solid #0b93f6;
      padding: 10px 20px;
      margin: 20px 0;
      background: #f0f7ff;
      border-radius: 0 6px 6px 0;
      color: #334155;
      font-style: italic;
    }

    /* ── Code ── */
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5pt;
      color: #0b93f6;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px 20px;
      border-radius: 8px;
      overflow: auto;
      margin: 16px 0;
      font-size: 9.5pt;
      line-height: 1.6;
    }
    pre code { background: none; color: inherit; padding: 0; }

    /* ── Tables ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
    }
    th {
      background: #0b93f6;
      color: #fff;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 9.5pt;
    }
    td {
      padding: 9px 14px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:last-child td { border-bottom: none; }

    /* ── Lists ── */
    ul, ol {
      margin: 12px 0 16px 22px;
    }
    li { margin-bottom: 6px; color: #1e293b; }
    li::marker { color: #0b93f6; }

    /* ── Horizontal rule ── */
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 32px 0;
    }

    /* ── Sources section ── */
    .sources-section h2 {
      color: #0b93f6;
      border-bottom-color: #0b93f6;
    }

    /* ── Conflicts section ── */
    .conflicts-box {
      background: #fffbeb;
      border: 1px solid #f59e0b;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .conflicts-box h2 {
      color: #92400e;
      border: none;
      margin-top: 0;
      font-size: 12pt;
    }
    .conflicts-box li { color: #78350f; }

    /* ── Footer ── */
    .pdf-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    strong { font-weight: 600; }
    em { font-style: italic; }
  </style>
</head>
<body>

  <!-- Cover header -->
  <div class="cover">
    <div class="cover-label">PaperMind AI — Intelligence Report</div>
    <div class="cover-title">${session.topic}</div>
    <div class="cover-meta">
      <span>Generated: ${new Date(session.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      <span>${session.sources.length} sources synthesized</span>
      <span>Mode: ${session.mode}</span>
    </div>
  </div>
  <div class="cover-divider"></div>

  <!-- Report body -->
  <div class="body">
    ${reportHtml}

    <div class="pdf-footer">
      <span>PaperMind AI — papermind.ai</span>
      <span>Generated ${new Date().toLocaleDateString()}</span>
    </div>
  </div>

</body>
</html>`;

    // Launch headless browser and render PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    const filename = `papermind-${session.topic.slice(0, 30).replace(/\s+/g, '-')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF Export Error]', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportMarkdown, exportPDF };
