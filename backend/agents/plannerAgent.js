const { callLLM } = require('../services/llmService');

/**
 * Planner Agent
 * Takes the user's topic and generates 3-5 targeted search queries.
 * Each query covers a different angle of the topic.
 *
 * @param {string} topic - The user's research topic
 * @returns {string[]}   - Array of search query strings
 */
const plannerAgent = async (topic) => {
  const systemPrompt = `You are a research planning expert. Your job is to take a research topic and generate 4 highly specific, diverse search queries that together will provide comprehensive coverage of the topic.

Rules:
- Generate exactly 4 queries
- Each query should cover a DIFFERENT angle (e.g., overview, recent developments, challenges, applications)
- Make queries specific and search-engine friendly
- Return ONLY a JSON array of strings, nothing else

Example output:
["query one here", "query two here", "query three here", "query four here"]`;

  const userMessage = `Research topic: "${topic}"`;

  const response = await callLLM(systemPrompt, userMessage);

  // Parse the JSON array from the LLM response
  // Strip any markdown code blocks if the model wraps it
  const cleaned = response.replace(/```json|```/g, '').trim();
  const queries = JSON.parse(cleaned);

  return queries;
};

module.exports = { plannerAgent };
