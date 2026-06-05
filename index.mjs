import OpenAI from 'openai';
import ora from 'ora';
import { printIciba } from './lib/iciba.mjs';
import { printYoudao } from './lib/youdao.mjs';

// 默认代理（内置免费翻译，无需 API Key）
const PROXY_URL = 'https://llmapi.fanyi-cli.deno.net';

const LLM_SETUP_GUIDE = `
  配置自己的 API Key 可获得更快更稳的翻译体验：

    fanyi config set LLM_API_KEY <your-key>
    fanyi config set LLM_API_BASE_URL <your-api-url>    (可选)
    fanyi config set LLM_MODEL_ID <model-id>             (可选)

  也可设置环境变量：export LLM_API_KEY=<your-key>
`;

const SYSTEM_PROMPT = `
你是一本专业的中英文双语词典。请按照以下要求提供翻译和解释：

1. 格式要求：
   [原词] [音标] ~ [翻译] [拼音] ~ [EMOJI]

   - [词性] [释义1]
   - [词性] [释义2]
   ...

   例句：
   1. [原文例句]
      [翻译]
   2. [原文例句]
      [翻译]
   ...

  [EMOJI] [座右铭]
   -----

2. 翻译规则：
   - 英文输入翻译为中文，中文输入翻译为英文
   - 提供准确的音标（英文）或拼音（中文）
   - 列出所有常见词性及其对应的释义
   - 释义应简洁明了，涵盖词语的主要含义，使用中文
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

5. 格式中的 [EMOJI] 指的是一个 emoji 表情符号，请根据词性、释义、例句等选择合适的表情符号。

请基于以上要求，为用户提供简洁、专业、全面且易于理解的词语翻译和解释。

---
最后使用这个词写一句简短的积极向上令人深思的英文座右铭，并提供中文翻译。但回复中不要包含"座右铭"三个字
`;

export default async (word, options) => {
  console.log('');
  const { iciba, youdao, llm, LLM_API_BASE_URL, LLM_API_KEY, LLM_MODEL_ID } = options;
  const endcodedWord = encodeURIComponent(word);

  // iciba
  if (isTrueOrUndefined(iciba)) {
    const ICIBA_URL =
      'https://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=10&is_need_mean=1&word=';
    const spinner = ora('正在请教 iciba...').start();
    try {
      const response = await fetch(`${ICIBA_URL}${endcodedWord}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      spinner.stop();
      printIciba(word, result?.message, options);
    } catch (error) {
      spinner.fail('访问 iciba 失败，请检查网络');
    }
  }

  // youdao
  if (isTrueOrUndefined(youdao)) {
    const YOUDAO_URL = `http://dict.youdao.com/jsonapi?q=${endcodedWord}`;
    const spinner = ora('正在请教 youdao...').start();
    try {
      const response = await fetch(YOUDAO_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      spinner.stop();
      printYoudao(word, result, options);
    } catch (error) {
      spinner.fail('访问 youdao 失败，请检查网络');
    }
  }

  // llm
  if (isTrueOrUndefined(llm)) {
    // 优先级：用户配置 > 环境变量 > 内置代理
    const apiKey = LLM_API_KEY || process.env.LLM_API_KEY;
    const useProxy = !apiKey;

    const baseURL =
      LLM_API_BASE_URL ||
      process.env.LLM_API_BASE_URL ||
      (useProxy ? PROXY_URL : 'https://api.deepseek.com');
    const model = LLM_MODEL_ID || process.env.LLM_MODEL_ID || 'glm-4.7-flash';

    // 走代理时用 OpenAI SDK 直接请求代理端点
    const openai = new OpenAI({
      baseURL,
      apiKey: apiKey || 'proxy',
    });

    const spinner = ora(useProxy ? '正在请教 LLM（代理）...' : `正在请教 ${model}...`).start();
    try {
      let content = '';

      if (useProxy) {
        // 代理模式：流式请求代理端点
        const response = await fetch(`${PROXY_URL}?word=${endcodedWord}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `代理请求失败 (HTTP ${response.status})`);
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream')) {
          // 流式响应
          spinner.stop();
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  process.stdout.write(delta);
                  content += delta;
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }
          if (content) console.log('');
        } else {
          // 非流式兜底
          const data = await response.json();
          content = data.choices?.[0]?.message?.content;
          if (!content) throw new Error('代理返回数据格式异常');
          spinner.stop();
          console.log(content);
        }
      } else {
        // 直连模式：流式请求
        const stream = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `请翻译：${word}` },
          ],
          model,
          temperature: 1.0,
          stream: true,
        });

        spinner.stop();
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            process.stdout.write(delta);
            content += delta;
          }
        }
        if (content) console.log('');
      }

      // 无内容时提示
      if (!content) {
        spinner.warn('LLM 返回了空内容');
      }
    } catch (error) {
      if (useProxy) {
        spinner.fail(`LLM 代理暂不可用，可配置自己的 API Key 解决：${LLM_SETUP_GUIDE}`);
      } else if (error.status === 401 || error.status === 403) {
        spinner.fail('API Key 无效或已过期，请重新配置：fanyi config set LLM_API_KEY <your-key>');
      } else {
        spinner.fail(`访问 ${model} 失败，请检查网络或 API 密钥`);
      }
    }
  }
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
