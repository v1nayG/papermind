const axios = require('axios');

/**
 * Single reusable LLM call function.
 * All 3 agents (Planner, Summarizer, Synthesizer) use this.
 *
 * @param {string} systemPrompt - Instructions that define the agent's role
 * @param {string} userMessage  - The actual input for this specific call
 * @param {string} model        - OpenRouter model string (defaults to a fast, capable model)
 * @returns {string}            - The LLM's text response
 */
const callLLM = async (
  systemPrompt,
  userMessage,
  model = 'mistralai/mistral-7b-instruct:free'
) => {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://papermind-px5v.onrender.com',
        'X-Title': 'PaperMind',
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};

module.exports = { callLLM };
