const { callLLM } = require('../services/llmService');

/**
 * Summarizer Agent
 * Compresses a single scraped source into a short, dense summary.
 * Runs once per source — results are passed to the Synthesizer Agent.
 *
 * @param {{ url: string, title: string, text: string }} source
 * @returns {{ url: string, title: string, summary: string }}
 */
const summarizerAgent = async ({ url, title, text }) => {
  // If scraping failed and we got no text, return a note
  if (!text || text.length < 100) {
    return { url, title, summary: 'Could not extract readable content from this source.' };
  }

  const systemPrompt = `You are a research summarizer. Your job is to read a scraped web page and extract the most important factual information into a concise summary.

Rules:
- Write 3-5 dense sentences maximum
- Focus only on facts, data, arguments, and key points
- Do NOT add your own opinions
- Do NOT include phrases like "this article says" or "according to..."
- If the content is irrelevant or too thin, say: "Source did not contain relevant information."`;

  const userMessage = `Page Title: ${title}\n\nContent:\n${text}`;

  const summary = await callLLM(systemPrompt, userMessage);

  return { url, title, summary };
};

module.exports = { summarizerAgent };
