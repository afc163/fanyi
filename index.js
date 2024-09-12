const needle = require('needle');
const { Groq } = require('groq-sdk');
const print = require('./lib/print');
const parseString = require('xml2js').parseString;
const ora = require('ora');

module.exports = async (word, options) => {
  console.log('');
  const { iciba, groq, GROQ_API_KEY } = options;
  const endcodedWord = encodeURIComponent(word);

  // iciba
  if (isTrueOrUndefined(iciba)) {
    const ICIBA_URL =
      'http://dict-co.iciba.com/api/dictionary.php?key=D191EBD014295E913574E1EAF8E06666&w=';
    const spinner = ora('正在查询 iciba...').start();
    try {
      const response = await needle('get', `${ICIBA_URL}${endcodedWord}`, { parse: false });
      if (response.statusCode === 200) {
        const result = await new Promise((resolve, reject) => {
          parseString(response.body, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        spinner.stop();
        print.iciba(result.dict, options);
      }
    } catch (error) {
      spinner.fail('访问 iciba 失败，请检查网络');
    }
  }

  // groq ai
  if (isTrueOrUndefined(groq)) {
    const groqClient = new Groq({
      apiKey: GROQ_API_KEY || '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',
    });
    const model = 'llama3-groq-70b-8192-tool-use-preview';

    const spinner = ora('正在查询 Groq AI...').start();
    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `
你是一本专业的中英文双语词典。请按照以下要求提供翻译和解释：

1. 格式要求：
   [原词] [音标] ~ [翻译] [拼音]
   
   - [词性] [释义1]
   - [词性] [释义2]
   ...

   例句：
   1. [原文例句]
      [翻译]
   2. [原文例句]
      [翻译]
   ...

   ❤️
   [座右铭]
   -----

2. 翻译规则：
   - 英文输入翻译为中文，中文输入翻译为英文
   - 提供准确的音标（英文）或拼音（中文）
   - 列出所有常见词性及其对应的释义
   - 释义应简洁明了，涵盖词语的主要含义
   - 提供2-3个地道的例句，体现词语的不同用法和语境

3. 内容质量：
   - 确保翻译和释义的准确性和权威性
   - 例句应当实用、常见，并能体现词语的典型用法
   - 注意词语的语体色彩，如正式、口语、书面语等
   - 对于多义词，按照使用频率由高到低排列释义

4. 特殊情况：
   - 对于习语、谚语或特殊表达，提供对应的解释和等效表达
   - 注明词语的使用范围，如地域、行业特定用语等
   - 对于缩写词，提供完整形式和解释

请基于以上要求，为用户提供简洁、专业、全面且易于理解的词语翻译和解释。

---
最后使用这个词写一句简短的积极向上令人深思的英文座右铭。
`,
          },
          {
            role: 'user',
            content: `请翻译：${word}`,
          },
        ],
        model,
        temperature: 0.3,
        max_tokens: 1024,
        top_p: 0.8,
        stream: true,
        stop: null,
      });
      spinner.stop();
      for await (const chunk of chatCompletion) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
      }
    } catch (error) {
      spinner.fail('访问 Groq AI 失败，请检查网络或 API 密钥');
    }
  }
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
