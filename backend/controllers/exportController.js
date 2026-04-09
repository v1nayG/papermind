const Session = require('../models/Session');
const PDFDocument = require('pdfkit');

// ── Export as Markdown ──────────────────────────────────────
const exportMarkdown = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Build markdown content
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

    // Send as downloadable .md file
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

    const doc = new PDFDocument({ margin: 50 });
    const filename = `papermind-${session.topic.slice(0, 30).replace(/\s+/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text(`Research Report`, { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(session.topic, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('grey').text(
      `Mode: ${session.mode} | Generated: ${new Date(session.createdAt).toLocaleDateString()}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Report body
    doc.fontSize(12).fillColor('black').font('Helvetica').text(session.report, {
      lineGap: 4,
    });
    doc.moveDown(2);

    // Sources
    doc.fontSize(14).font('Helvetica-Bold').text('Sources');
    doc.moveDown(0.5);
    session.sources.forEach((s, i) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`[${i + 1}] ${s.title}`);
      doc.fontSize(9).fillColor('blue').text(s.url, { link: s.url });
      doc.fontSize(10).fillColor('black').font('Helvetica').text(s.summary);
      doc.moveDown(0.5);
    });

    // Conflicts
    if (session.conflicts && session.conflicts.length > 0) {
      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').fillColor('red').text('Conflicts Detected');
      doc.moveDown(0.5);
      session.conflicts.forEach((c) => {
        doc.fontSize(10).fillColor('black').font('Helvetica').text(`• ${c}`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportMarkdown, exportPDF };
