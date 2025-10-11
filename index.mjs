import { spawn } from 'node:child_process';
import { Chalk } from 'chalk';
import { XMLParser } from 'fast-xml-parser';
import gradient from 'gradient-string';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import ora from 'ora';
import stripAnsi from 'strip-ansi';
import { printIciba } from './lib/iciba.mjs';

const gradients = [
  'cristal',
  'teen',
  'mind',
  'morning',
  'vice',
  'passion',
  'fruit',
  'instagram',
  'atlas',
  'retro',
  'summer',
  'pastel',
  'rainbow',
];

export default async (word, options) => {
  console.log('');
  const { iciba, deepseek, openai, LLM_API_KEY, OPENAI_API_KEY, OPENAI_API_HOST, pager, color } =
    options;
  const endcodedWord = encodeURIComponent(word);

  // iciba
  if (isTrueOrUndefined(iciba)) {
    const ICIBA_URL =
      'https://dict-co.iciba.com/api/dictionary.php?key=D191EBD014295E913574E1EAF8E06666&w=';
    const spinner = ora('正在请教 iciba...').start();
    try {
      const response = await fetch(`${ICIBA_URL}${endcodedWord}`);
      const xml = await response.text();
      const parser = new XMLParser();
      const result = parser.parse(xml);
      spinner.stop();
      printIciba(result.dict, options);
    } catch (error) {
      spinner.fail('访问 iciba 失败，请检查网络');
    }
  }

  // deepseek (disabled by default; enable with `deepseek: true`)
  if (deepseek === true) {
    const openaiClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: LLM_API_KEY || 'sk-a6325c2f3d2044968e6a83f249cc1541',
    });

    const model = 'deepseek-chat';

    const spinner = ora(`正在请教 ${model}...`).start();
    try {
      const chatCompletion = await openaiClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `
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

5. 同义词与对比（使用表格）：
   - 列出2-4个常用同义词，并用8-15字解释细微差别
   - 输出“同义词对比表”（Markdown 表格）：
     | 词汇 | 差异点 | 使用场景 |
     | - | - | - |
     | A | A的关键差异 | 典型场景 |
     | B | B的关键差异 | 典型场景 |

6. 反义词与对比（使用表格）：
   - 列出1-2个主要反义词，并用8-15字说明对立维度
   - 输出“反义词对比表”（Markdown 表格）：
     | 词汇 | 对立维度 | 使用情境 |
     | - | - | - |
     | X | 与原词的对立点 | 典型情境 |

7. 表达要求：表格内句子尽量简短（≤20字），术语准确；
   格式中的 [EMOJI] 指的是一个 emoji 表情符号，请根据词性、释义、例句等选择合适的表情符号。

请基于以上要求，为用户提供简洁、专业、全面且易于理解的词语翻译和解释。

---
最后使用这个词写一句简短的积极向上令人深思的英文座右铭，并提供中文翻译。但回复中不要包含"座右铭"三个字
`,
          },
          {
            role: 'user',
            content: `请翻译：${word}`,
          },
        ],
        model,
        temperature: 1.3,
      });
      spinner.stop();
      await printLLMOutput(chatCompletion.choices[0].message.content, { pager, color });
    } catch (error) {
      spinner.fail(`访问 ${model} 失败，请检查网络或 API 密钥`);
    }
  }

  // openai
  if (isTrueOrUndefined(openai)) {
    const apiKey = OPENAI_API_KEY || LLM_API_KEY;
    if (!apiKey) {
      console.log(
        '未设置 OpenAI API 密钥，请使用 "fanyi config set OPENAI_API_KEY 你的密钥" 进行设置',
      );
      return;
    }

    const openaiOptions = {
      apiKey,
    };

    // 如果设置了自定义的 API 主机
    if (OPENAI_API_HOST) {
      openaiOptions.baseURL = `https://${OPENAI_API_HOST}/v1`;
    }

    const openaiClient = new OpenAI(openaiOptions);
    const model = 'gpt-3.5-turbo';

    const spinner = ora(`正在请教 OpenAI (${model})...`).start();
    try {
      const chatCompletion = await openaiClient.chat.completions.create({
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

   同义词：
   - [同义词1]: [简短解释]
   - [同义词2]: [简短解释]
   ...

   反义词：
   - [反义词1]: [简短解释]
   - [反义词2]: [简短解释]
   ...

    同义词对比表（Markdown 表格）：
    | 词汇 | 差异点 | 使用场景 |
    | - | - | - |
    | A | A的关键差异 | 典型场景 |
    | B | B的关键差异 | 典型场景 |

    反义词对比表（Markdown 表格）：
    | 词汇 | 对立维度 | 使用情境 |
    | - | - | - |
    | X | 与原词的对立点 | 典型情境 |

   例句：
   1. [原文例句]
      [翻译]
   2. [原文例句]
      [翻译]
   ...

2. 翻译规则：
   - 英文输入翻译为中文，中文输入翻译为英文
   - 提供准确的音标（英文）或拼音（中文）
   - 列出所有常见词性及其对应的释义
   - 释义应简洁明了，涵盖词语的主要含义
   - 为每个词提供3-5个最常用的同义词，并简短解释其细微差别
   - 为每个词提供2-3个主要反义词，并简短解释其对立维度
   - 对比内容以表格形式呈现（见上），表格内句子尽量简短（≤20字）
   - 提供2-3个地道的例句，体现词语的不同用法和语境

3. 特殊情况处理：
   - 如果某个词没有明显的同义词或反义词，可以说明这一点
   - 对于多义词，可以针对主要含义提供不同的同义词和反义词
   - 根据词性不同，同一个词可能有不同的同义词和反义词集合
`,
          },
          {
            role: 'user',
            content: `请翻译：${word}`,
          },
        ],
        model,
        temperature: 0.7,
      });
      spinner.stop();
      await printLLMOutput(chatCompletion.choices[0].message.content, { pager, color });
    } catch (error) {
      spinner.fail(`访问 OpenAI 失败: ${error.message}`);
      console.log('请检查网络连接或 API 密钥是否正确');
    }
  }
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}

async function printLLMOutput(content, { pager, color } = {}) {
  // Prefer Markdown rendering for clean tables; gracefully fall back
  // Attempt plugin-style API first (marked >= v5 + marked-terminal >= v7), then old renderer API
  const width = process.stdout?.columns ? process.stdout.columns : 80;
  let rendered;
  try {
    const [{ Marked, marked }, mt] = await Promise.all([
      import('marked'),
      import('marked-terminal'),
    ]);

    // Try new API: use() with a Marked instance and a marked-terminal plugin
    try {
      const TerminalPlugin = mt.default;
      if (Marked && typeof TerminalPlugin === 'function') {
        const m = new Marked();
        m.use(TerminalPlugin({ reflowText: true, width, tab: 2, unescape: true }));
        rendered = m.parse(content);
        rendered = postProcessColor(rendered, { color, pager });
        return pageOrPrint(rendered, { pager });
      }
    } catch {}

    // Fallback to legacy API: setOptions with renderer instance
    try {
      const TerminalRenderer = mt.default;
      if (marked && TerminalRenderer) {
        marked.setOptions({
          renderer: new TerminalRenderer({ reflowText: true, width, tab: 2, unescape: true }),
        });
        const output = marked(content);
        if (typeof output === 'string') {
          rendered = postProcessColor(output, { color, pager });
          return pageOrPrint(rendered, { pager });
        }
      }
    } catch {}
  } catch {
    // ignore and fall through
  }

  // Fallback: print with gradient to keep previous behavior
  rendered = postProcessColor(content, { color, pager });
  return pageOrPrint(rendered, { pager });
}

function pageOrPrint(text, { pager } = {}) {
  // If pager is true or undefined (default-on), try to use a system pager
  const shouldPage = isTrueOrUndefined(pager);
  if (!shouldPage) {
    console.log(text);
    return;
  }

  const envPager = process.env.PAGER;
  // Prefer user-defined PAGER, else use less -RFX
  const pagerCmd = envPager ? envPager : 'less';
  const pagerArgs = envPager ? [] : ['-R', '-F', '-X'];
  try {
    const child = spawn(pagerCmd, pagerArgs, {
      stdio: ['pipe', 'inherit', 'inherit'],
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    child.on('error', () => {
      // If pager binary missing, fall back to console
      console.log(text);
    });
    child.stdin.write(text);
    child.stdin.end();
  } catch (e) {
    console.log(text);
  }
}

function postProcessColor(text, { color, pager } = {}) {
  if (color === false) {
    // strip any ANSI possibly added by renderers
    return stripAnsi(text);
  }
  const chalk = new Chalk({ level: 3 });

  const lines = text.split('\n');
  const isTableLine = (l) => /\|/.test(l) && l.split('|').length >= 3;
  const isSeparator = (l) =>
    /^\s*\|?\s*:?[-=]{2,}(\s*\|\s*:?[-=]{2,})+\s*\|?\s*$/.test(stripAnsi(l));

  const palette = [
    chalk.cyanBright,
    chalk.magentaBright,
    chalk.greenBright,
    chalk.blueBright,
    chalk.yellowBright,
  ];

  let section = '';
  const isSynHeader = (l) => /(同义词对比表|同义词|Synonyms?)/i.test(stripAnsi(l));
  const isAntHeader = (l) => /(反义词对比表|反义词|Antonyms?)/i.test(stripAnsi(l));
  const isExHeader = (l) => /(例句|Examples?)/i.test(stripAnsi(l));

  const colored = lines.map((line, idx) => {
    // Leave pre-colored lines as-is
    const plain = stripAnsi(line);
    const hasColor = plain !== line;
    if (hasColor) return line;

    if (isSynHeader(plain)) {
      section = 'syn';
      return chalk.bold.greenBright(plain);
    }
    if (isAntHeader(plain)) {
      section = 'ant';
      return chalk.bold.redBright(plain);
    }
    if (isExHeader(plain)) {
      section = 'ex';
      return chalk.bold.blueBright(plain);
    }

    if (isTableLine(plain)) {
      if (isSeparator(plain)) {
        return chalk.gray(plain);
      }
      // Lightly color table content for readability
      if (section === 'syn') return chalk.greenBright(plain);
      if (section === 'ant') return chalk.redBright(plain);
      if (section === 'ex') return chalk.blueBright(plain);
      return chalk.cyanBright(plain);
    }

    // Apply a gentle gradient to plain paragraphs
    // Avoid gradient when piping to a pager; use a bright palette instead for stability
    const colorize = palette[idx % palette.length];
    return colorize(plain);
  });

  return colored.join('\n');
}
