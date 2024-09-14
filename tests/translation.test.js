const { translateText } = require('../lib/translation');

describe('Translation Module', () => {
  test('should translate text to the target language', async () => {
    const text = 'Hello';
    const targetLang = 'es';
    const translatedText = await translateText(text, targetLang);
    expect(translatedText).toBe('Hola');
  });

  test('should throw an error for unsupported language', async () => {
    const text = 'Hello';
    const targetLang = 'xx';
    await expect(translateText(text, targetLang)).rejects.toThrow('Translation failed');
  });

  test('should throw an error for empty text', async () => {
    const text = '';
    const targetLang = 'es';
    await expect(translateText(text, targetLang)).rejects.toThrow('Translation failed');
  });
});
