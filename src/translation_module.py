import requests

def translate(text, source_lang='zh', target_lang='en'):
    # Ensure the text is properly encoded
    encoded_text = text.encode('utf-8')
    response = requests.post('https://api.translation.service/translate',
                             data={'text': encoded_text, 'source': source_lang, 'target': target_lang})
    if response.status_code == 200:
        return response.json().get('translatedText', '')
    return 'Translation failed. Please try again later.'
