/**
 * fanyi LLM 代理 — Cloudflare Worker
 *
 * 转发翻译请求到智谱 GLM-4.7-Flash（永久免费），
 * API Key 存在 Worker 环境变量中，客户端无需持有 key。
 *
 * 环境变量（wrangler secret put / wrangler.toml vars）：
 *   ZHIPU_API_KEY — 智谱 API Key（必填）
 */

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4.7-flashx';

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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Env {
  ZHIPU_API_KEY: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 只允许 GET（?word=xxx）和 POST
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 取词：GET 从 query，POST 从 body
    let word: string | null = null;
    if (req.method === 'GET') {
      word = new URL(req.url).searchParams.get('word');
    } else {
      try {
        const body = await req.json();
        word = body.word || body.messages?.slice(-1)?.[0]?.content?.replace('请翻译：', '') || null;
      } catch {
        // ignore parse error
      }
    }

    if (!word) {
      return new Response(JSON.stringify({ error: 'Missing word parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const apiKey = env.ZHIPU_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // 流式调用智谱 API
    try {
      const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `请翻译：${word}` },
          ],
          temperature: 1.0,
          stream: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      // 直接转发 SSE 流
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...CORS_HEADERS,
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Upstream request failed', detail: String(error) }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }
  },
} satisfies ExportedHandler<Env>;
