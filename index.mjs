import OpenAI from 'openai';
import ora from 'ora';
import { printIciba } from './lib/iciba.mjs';
import { createShimmer } from './lib/shimmer.mjs';
import { createStreamColorizer } from './lib/streamColor.mjs';
import { printYoudao } from './lib/youdao.mjs';

// 默认代理（内置免费翻译，无需 API Key）
const PROXY_URL = 'https://fanyi-llm-proxy.ant-design-demo.workers.dev';

/**
 * 启动一个带灰白流光动画的 spinner。
 * @param {string} text 文案（不含尾部 ...）
 * @param {object} options CLI options（含 color）
 * @returns {{ spinner, stop: () => void }} stop 会清掉定时器
 */
function startShimmerSpinner(text, options) {
  const paint = createShimmer(options);
  const start = Date.now();
  const spinner = ora(`${text}...`).start();
  const timer = setInterval(() => {
    spinner.text = paint(`${text}...`, Date.now() - start);
  }, 80);
  return {
    spinner,
    stop: () => clearInterval(timer),
  };
}

const LLM_SETUP_GUIDE = `
  配置自己的 API Key 可获得更快更稳的翻译体验：

    fanyi config set LLM_API_KEY <your-key>
    fanyi config set LLM_API_BASE_URL <your-api-url>    (可选)
    fanyi config set LLM_MODEL_ID <model-id>             (可选)

  也可设置环境变量：export LLM_API_KEY=<your-key>
`;

const SYSTEM_PROMPT = `你是一本专业的中英文双语词典。英文输入翻译为中文，中文输入翻译为英文。

严格仿照下面这个示例的排版直接输出最终结果，不要输出任何方括号、占位符标签或本说明文字：

light /laɪt/ ~ 光 guāng ~ 💡

- n. 光；光线；光亮
- adj. 轻的；轻松的；浅色的
- v. 点燃；照亮

例句:
1. The light of the sun warms the earth.
   太阳的光温暖着大地。
2. She prefers light colors for her room.
   她喜欢用浅色装饰房间。
3. He lit a candle to light the dark room.
   他点了一根蜡烛照亮黑暗的房间。

Even the smallest light can pierce the deepest darkness.
再微弱的光也能刺破最深的黑暗。

要求：
- 第一行依次是：原词、空格、英文音标（用斜杠包裹）或中文拼音、空格、~、空格、对应翻译、空格、音标或拼音、空格、~、空格、一个贴切的 emoji。
- 列出所有常见词性，每行一条，以「- 词性. 释义」形式，释义用中文，多义按使用频率排序。
- 提供 2-3 个地道例句，英文/中文成对出现，中文例句缩进三个空格。
- 例句之后空一行，输出一句用该词写的、积极向上发人深省的英文格言，下一行给出中文翻译。不要出现「座右铭」「格言」等字样，也不要任何标题。
- 直接输出内容，不要解释、不要 Markdown 代码块、不要复述以上要求。`;

export default async (word, options) => {
  console.log('');
  const { iciba, youdao, llm, LLM_API_BASE_URL, LLM_API_KEY, LLM_MODEL_ID } = options;
  const endcodedWord = encodeURIComponent(word);

  // iciba
  if (isTrueOrUndefined(iciba)) {
    const ICIBA_URL =
      'https://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=10&is_need_mean=1&word=';
    const { spinner, stop } = startShimmerSpinner('正在请教 iciba', options);
    try {
      const response = await fetch(`${ICIBA_URL}${endcodedWord}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      stop();
      spinner.stop();
      printIciba(word, result?.message, options);
    } catch (error) {
      stop();
      spinner.fail('访问 iciba 失败，请检查网络');
    }
  }

  // youdao
  if (isTrueOrUndefined(youdao)) {
    const YOUDAO_URL = `http://dict.youdao.com/jsonapi?q=${endcodedWord}`;
    const { spinner, stop } = startShimmerSpinner('正在请教 youdao', options);
    try {
      const response = await fetch(YOUDAO_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      stop();
      spinner.stop();
      printYoudao(word, result, options);
    } catch (error) {
      stop();
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
    const model = LLM_MODEL_ID || process.env.LLM_MODEL_ID || 'glm-4-flash';

    // 走代理时用 OpenAI SDK 直接请求代理端点
    const openai = new OpenAI({
      baseURL,
      apiKey: apiKey || 'proxy',
    });

    const startTime = Date.now();
    const paintShimmer = createShimmer(options);
    // 流光由真实流逝时间驱动，持续顺滑流动；文案固定为「正在请教 LLM」不再切换
    const renderSpinner = () => {
      const tMs = Date.now() - startTime;
      const elapsed = Math.round(tMs / 1000);
      // 流光只作用于文案，秒数保持常态灰
      spinner.text = `${paintShimmer('正在请教 LLM...', tMs)} ${elapsed}s`;
    };
    const spinner = ora('正在请教 LLM... 0s').start();
    // 80ms 一帧让流光顺滑流动
    const timer = setInterval(renderSpinner, 80);

    // 流式着色器：按行结算上色，同时过滤占位符/指令泄漏
    const colorizer = createStreamColorizer(options);
    let started = false;
    // delta → 着色 → 输出；首次产出着色文本时停掉 spinner
    const writeDelta = (delta) => {
      const painted = colorizer.push(delta);
      if (painted) {
        if (!started) {
          clearInterval(timer);
          spinner.stop();
          started = true;
        }
        process.stdout.write(painted);
      }
    };
    const flushTail = () => {
      const tail = colorizer.end();
      if (tail) {
        if (!started) {
          clearInterval(timer);
          spinner.stop();
          started = true;
        }
        process.stdout.write(tail);
      }
    };

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
          // 流式响应：连接已建立，流光 spinner 继续转，直到首个着色文本产出
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
                  content += delta;
                  writeDelta(delta);
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }
          flushTail();
          if (content) console.log('');
        } else {
          // 非流式兜底
          const data = await response.json();
          content = data.choices?.[0]?.message?.content;
          if (!content) throw new Error('代理返回数据格式异常');
          clearInterval(timer);
          spinner.stop();
          writeDelta(content);
          flushTail();
          console.log('');
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

        // 连接已建立，流光 spinner 继续转，直到首个着色文本产出
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            content += delta;
            writeDelta(delta);
          }
        }
        flushTail();
        if (content) console.log('');
      }

      // 无内容时提示
      if (!content) {
        spinner.warn('LLM 返回了空内容');
      }
    } catch (error) {
      clearInterval(timer);
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
