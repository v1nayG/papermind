const axios = require('axios');

/**
 * Search Service
 * Calls the Serper API with a query and returns top result URLs + titles.
 *
 * @param {string} query - A single search query string
 * @param {number} limit - How many results to return per query (default 3)
 * @returns {{ url: string, title: string }[]}
 */
const searchWeb = async (query, limit = 3) => {
  const response = await axios.post(
    'https://google.serper.dev/search',
    { q: query, num: limit },
    {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  const results = response.data.organic || [];

  // Return only the url and title for each result
  return results.slice(0, limit).map((r) => ({
    url: r.link,
    title: r.title,
  }));
};

/**
 * Image Search Service
 * Calls the Serper Images API and returns the top image results.
 *
 * @param {string} query - The search query for images
 * @param {number} limit - How many images to return (default 5)
 * @returns {{ imageUrl: string, title: string }[]}
 */
const searchImages = async (query, limit = 5) => {
  try {
    const response = await axios.post(
      'https://google.serper.dev/images',
      { q: query, num: limit },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const results = response.data.images || [];
    return results.slice(0, limit).map((r) => ({
      imageUrl: r.imageUrl,
      title: r.title,
    }));
  } catch (err) {
    console.error('[ImageSearch] Failed:', err.message);
    return [];
  }
};

module.exports = { searchWeb, searchImages };
