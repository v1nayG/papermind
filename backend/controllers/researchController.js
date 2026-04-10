const Session = require('../models/Session');
const { plannerAgent } = require('../agents/plannerAgent');
const { summarizerAgent } = require('../agents/summarizerAgent');
const { synthesizerAgent } = require('../agents/synthesizerAgent');
const { searchWeb } = require('../services/searchService');
const { scrapeUrl } = require('../services/scraperService');

/**
 * SSE helper — sends a progress event to the connected client
 */
const sendEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// ── Start Research (SSE streaming endpoint) ─────────────────
const startResearch = async (req, res) => {
  const { topic, mode = 'report' } = req.body;
  console.log(`[Research] Request received! Topic: "${topic}", Mode: "${mode}"`);

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Set SSE headers — keeps the connection open and streams data
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Create a session record in MongoDB (status: searching)
  const session = await Session.create({
    userId: req.user._id,
    topic,
    mode,
    status: 'searching',
  });

  // Send the session ID immediately so the frontend can track it
  sendEvent(res, 'session_created', { sessionId: session._id });

  try {
    // ── Stage 1: Planner Agent ──────────────────────────────
    sendEvent(res, 'progress', { stage: 'searching', message: 'Planning search queries...' });
    const queries = await plannerAgent(topic);
    session.queries = queries;
    await session.save();
    sendEvent(res, 'progress', { stage: 'searching', message: `Generated ${queries.length} search queries`, queries });

    // ── Stage 2+3: Per-query pipeline (Search → Scrape → Summarize in parallel) ──
    // Each query runs its own full pipeline simultaneously — no waiting for all
    // searches to finish before summarizing starts. Concurrency limited to 3 LLM
    // calls at once to avoid rate limits.
    sendEvent(res, 'progress', { stage: 'reading', message: 'Searching, reading & summarizing sources...' });

    // Simple semaphore: limits concurrent LLM summarizations to 3 at a time
    let activeLLM = 0;
    const waitForSlot = () => new Promise(resolve => {
      const check = () => {
        if (activeLLM < 3) { activeLLM++; resolve(); }
        else setTimeout(check, 200);
      };
      check();
    });

    let totalSources = 0;
    let doneCount = 0;

    // Run all query pipelines in parallel
    const allSummarizedSources = (await Promise.all(
      queries.map(async (query) => {
        // 1. Search
        const results = await searchWeb(query, 3);

        // 2. Scrape all results for this query in parallel
        const scraped = await Promise.all(results.map(r => scrapeUrl(r)));

        // 3. Summarize each scraped source — throttled to 3 concurrent LLM calls
        const summarized = await Promise.all(
          scraped.map(async (source) => {
            await waitForSlot();
            try {
              const result = await summarizerAgent(source);
              doneCount++;
              sendEvent(res, 'progress', {
                stage: 'summarizing',
                message: `Summarized ${doneCount} of ${totalSources} sources...`
              });
              return result;
            } finally {
              activeLLM--;
            }
          })
        );

        return summarized;
      })
    )).flat();

    // Deduplicate by URL
    const seenUrls = new Set();
    const summarizedSources = allSummarizedSources.filter(s => {
      if (!s?.url || seenUrls.has(s.url)) return false;
      seenUrls.add(s.url);
      totalSources++;
      return true;
    });

    session.sources = summarizedSources;
    await session.save();
    sendEvent(res, 'progress', { stage: 'summarizing', message: `Summarized ${summarizedSources.length} sources` });

    // ── Stage 4: Synthesizer Agent ──────────────────────────
    sendEvent(res, 'progress', { stage: 'synthesizing', message: 'Writing final report...' });
    session.status = 'synthesizing';
    await session.save();

    const { report, conflicts } = await synthesizerAgent(topic, summarizedSources, mode);

    // Save completed session
    session.report = report;
    session.conflicts = conflicts;
    session.status = 'done';
    await session.save();

    // Send final result
    sendEvent(res, 'done', {
      sessionId: session._id,
      report,
      conflicts,
      sources: summarizedSources,
    });
  } catch (error) {
    console.error('Research pipeline error:', error.message);
    console.error('Error details:', error.response?.data || error.stack);
    session.status = 'error';
    await session.save();
    sendEvent(res, 'error', { message: error.message });
  } finally {
    res.end(); // close the SSE connection
  }
};

// ── Get Research History ────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('topic mode status createdAt') // only return summary fields
      .sort({ createdAt: -1 }); // newest first

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get Single Session ──────────────────────────────────────
const getSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id, // ensure user can only see their own sessions
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { startResearch, getHistory, getSession };
