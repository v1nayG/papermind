const { callLLM } = require('../services/llmService');

/**
 * Synthesizer Agent
 * Takes all compressed source summaries and writes the final research output.
 * Detects conflicts between sources and includes citations.
 *
 * @param {string} topic - Original research topic
 * @param {{ url: string, title: string, summary: string }[]} sources - All summarized sources
 * @param {'report' | 'bullets'} mode - Output format
 * @returns {{ report: string, conflicts: string[] }}
 */
const synthesizerAgent = async (topic, sources, mode) => {
  // Format sources for the prompt with numbered citations
  const sourcesText = sources
    .map(
      (s, i) =>
        `[${i + 1}] Title: ${s.title}\nURL: ${s.url}\nSummary: ${s.summary}`
    )
    .join('\n\n');

  const formatInstruction =
    mode === 'bullets'
      ? 'Format the output as a clean bullet point list with clear section headers.'
      : 'Format the output as a structured research report with clear sections: Overview, Key Findings, Analysis, and Conclusion.';

  const systemPrompt = `You are an expert research synthesizer. You will be given summaries from multiple web sources about a topic. Your job is to:

1. Synthesize all information into a coherent, well-structured output
2. Include inline citations using [1], [2], etc. referencing the source numbers
3. Detect and explicitly flag any CONFLICTS or CONTRADICTIONS between sources
4. ${formatInstruction}

At the end of your response, add a section called "## Conflicts Detected" and list any contradictions you found between sources. If none, write "No significant conflicts detected."

Be thorough, factual, and cite every major claim.`;

  const userMessage = `Research Topic: "${topic}"\n\nSources:\n${sourcesText}`;

  // Use a more powerful model for the final synthesis step
  const fullResponse = await callLLM(
    systemPrompt,
    userMessage,
    'openai/gpt-oss-20b:free'
  );

  // Split report body from conflicts section
  const conflictsSplit = fullResponse.split('## Conflicts Detected');
  const report = conflictsSplit[0].trim();
  const conflictsRaw = conflictsSplit[1] ? conflictsSplit[1].trim() : '';

  // Parse conflict lines (skip "No significant conflicts" line)
  const conflicts = conflictsRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.toLowerCase().includes('no significant'));

  return { report, conflicts };
};

module.exports = { synthesizerAgent };
