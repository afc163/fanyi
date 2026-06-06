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
const MODEL = 'glm-4-flash';

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
