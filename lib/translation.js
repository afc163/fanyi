const fanyi = require('fanyi');

/**
 * Translates text to the specified target language.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code.
 * @returns {Promise<string>} - The translated text.
 */
async function translateText(text, targetLang) {
  try {
    const result = await fanyi(text, { to: targetLang });
    return result.text;
  } catch (error) {
    throw new Error('Translation failed');
  }
}

module.exports = { translateText };