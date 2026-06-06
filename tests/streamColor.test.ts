import { describe, expect, it } from 'vitest';
import { createStreamColorizer } from '../lib/streamColor.mjs';

// 把整段文本按「逐字符」喂入着色器，模拟 LLM token 任意切分的最坏情况
function feedCharByChar(text, options) {
  const c = createStreamColorizer(options);
  let out = '';
  for (const ch of text) {
    out += c.push(ch);
  }
  out += c.end();
  return out;
}

// 去除 ANSI 颜色码
// biome-ignore lint/suspicious/noControlCharactersInRegex: 匹配 ANSI 转义序列
const stripAnsi = (s) => s.replace(/\[[0-9;]*m/g, '');

const SAMPLE = `good /ɡʊd/ ~ 好 hǎo ~ 🌟

- adj. 好的；良好的
- v. 使有利

例句:
1. He is a good friend.
   他是一个好朋友。

Good begets good.
善有善报。`;

describe('createStreamColorizer', () => {
  it('color:false 时输出等于原文（无 ANSI）', () => {
    const out = feedCharByChar(SAMPLE, { color: false });
    expect(out).toBe(SAMPLE);
  });

  it('逐字符切分后内容还原正确', () => {
    const out = feedCharByChar(SAMPLE, { color: true });
    expect(stripAnsi(out)).toBe(SAMPLE);
  });

  it('color:true 时产生 ANSI 颜色码', () => {
    const out = feedCharByChar(SAMPLE, { color: true });
    expect(out).toContain('[');
  });

  it('例句英文行带下划线', () => {
    const out = feedCharByChar(SAMPLE, { color: true });
    // 下划线 ANSI 是 [4m
    expect(out).toContain('[4m');
  });

  it('词性 token 带 magenta', () => {
    const out = feedCharByChar(SAMPLE, { color: true });
    // magenta 前景是 [35m
    expect(out).toContain('[35m');
  });

  it('删除残留占位符标签', () => {
    const leaked = '[good] /ɡʊd/ ~ [翻译] 好 ~ [EMOJI] 🌟\n';
    const out = feedCharByChar(leaked, { color: false });
    expect(out).not.toContain('[翻译]');
    expect(out).not.toContain('[EMOJI]');
    expect(out).not.toContain('[good]');
    // 真实内容保留
    expect(out).toContain('good');
    expect(out).toContain('好');
    expect(out).toContain('🌟');
  });

  it('丢弃泄漏的指令行', () => {
    const leaked = 'good /ɡʊd/ ~ 好 ~ 🌟\n最后用这个词写一句积极向上的座右铭，并提供中文翻译：\n';
    const out = feedCharByChar(leaked, { color: false });
    expect(out).not.toContain('座右铭');
    expect(out).toContain('good');
  });

  it('end() 冲刷无换行结尾的最后一行', () => {
    const c = createStreamColorizer({ color: false });
    let out = c.push('善有善报。'); // 无换行
    expect(out).toBe(''); // 行未结束，push 不输出
    out += c.end();
    expect(out).toBe('善有善报。');
  });
});
