const { callLLM } = require('../services/llmService');

/**
 * Synthesizer Agent
 * Takes all compressed source summaries and writes the final research output.
 * Detects conflicts between sources and includes citations.
 * Embeds relevant images at logical points throughout the report.
 *
 * @param {string} topic - Original research topic
 * @param {{ url: string, title: string, summary: string }[]} sources - All summarized sources
 * @param {'report' | 'bullets'} mode - Output format
 * @param {{ imageUrl: string, title: string }[]} images - Relevant images to embed
 * @returns {{ report: string, conflicts: string[] }}
 */
const synthesizerAgent = async (topic, sources, mode, images = []) => {
  // Format sources for the prompt with numbered citations
  const sourcesText = sources
    .map(
      (s, i) =>
        `[${i + 1}] Title: ${s.title}\nURL: ${s.url}\nSummary: ${s.summary}`
    )
    .join('\n\n');

  // Format images for injection into the report
  const imagesText = images.length > 0
    ? images
        .map((img, i) => `[IMG${i + 1}] Alt: "${img.title}" | URL: ${img.imageUrl}`)
        .join('\n')
    : 'No images available.';

  const formatInstruction =
    mode === 'bullets'
      ? 'Format the output as a detailed bullet point list with clear section headers. Each section should be thorough with multiple bullet points.'
      : 'Format the output as a comprehensive, in-depth research report with the following sections: Overview, Background & Context, Key Findings, In-Depth Analysis, Implications & Future Outlook, and Conclusion.';

  const systemPrompt = `You are an expert research analyst and science journalist. You have been given summaries from multiple authoritative web sources and a set of relevant images. Your task is to produce a COMPREHENSIVE, DETAILED, and RICHLY ILLUSTRATED research report.

CRITICAL REQUIREMENTS:
1. LENGTH: The report MUST be comprehensive and detailed. Write extensively — aim for at least 800-1200 words of substantive content. Do not summarize briefly; elaborate on every point.
2. CITATIONS: Include inline citations using [1], [2], etc. after every major claim. Every paragraph should cite at least one source.
3. IMAGES: You have been given a list of images (IMG1, IMG2, etc.). Embed them naturally throughout the report at logical, relevant points using this exact Markdown syntax: ![Alt Text](imageUrl). Place images where they enhance understanding — after introducing a concept, alongside a key finding, etc. Use at least 2-3 images if available.
4. STRUCTURE: ${formatInstruction}
5. DEPTH: Do not just list facts. Analyze, compare, contrast, and explain the significance of information. Add context.
6. CONFLICTS: At the end, add a "## Conflicts Detected" section. List any contradictions between sources as a simple bulleted list of plain text sentences. DO NOT use markdown tables or pipes (|) in this section. If none, write "No significant conflicts detected."

Available Images (embed these using Markdown ![]() syntax):
${imagesText}

Be thorough, analytical, and insightful. A reader should feel they have read a proper research paper after reading your report.`;

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
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter((line) => line.length > 0 && !line.toLowerCase().includes('no significant'));

  return { report, conflicts };
};

module.exports = { synthesizerAgent };
