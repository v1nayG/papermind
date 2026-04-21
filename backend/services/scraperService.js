const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper Service
 * Fetches a URL, parses the HTML, and returns clean readable text.
 * Strips out nav bars, footers, scripts, and ads.
 *
 * @param {{ url: string, title: string }} source
 * @returns {{ url: string, title: string, text: string }}
 */
const scrapeUrl = async ({ url, title }) => {
  try {
    const response = await axios.get(url, {
      timeout: 8000, // 8 second timeout so slow pages don't hang the pipeline
      headers: {
        // Pretend to be a browser so sites don't block us
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove elements that are noise (not article content)
    $('script, style, nav, footer, header, iframe, img, .ad, .advertisement, .cookie').remove();

    // Extract clean paragraph text
    const paragraphs = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 60) { // skip short/empty paragraphs
        paragraphs.push(text);
      }
    });

    const text = paragraphs.join('\n\n');

    // If we got very little text, try grabbing all body text instead
    const finalText = text.length > 200 ? text : $('body').text().replace(/\s+/g, ' ').trim();

    // Cap at ~6000 chars to keep context window manageable before Summarizer Agent compresses it
    return { url, title, text: finalText.slice(0, 6000) };
  } catch (error) {
    // If scraping fails (site blocks us, timeout, etc.) return empty text
    // The Summarizer Agent will handle the empty case gracefully
    return { url, title, text: '' };
  }
};

module.exports = { scrapeUrl };
