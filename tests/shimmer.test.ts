import { describe, expect, it } from 'vitest';
import { createShimmer, shimmer } from '../lib/shimmer.mjs';

// 去除 ANSI 颜色码
// biome-ignore lint/suspicious/noControlCharactersInRegex: 匹配 ANSI 转义序列
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('shimmer', () => {
  it('color:false 时原样返回', () => {
    const paint = createShimmer({ color: false });
    expect(paint('正在翻译...', 0)).toBe('正在翻译...');
  });

  it('color:true 时产生 ANSI 颜色码', () => {
    const paint = createShimmer({ color: true });
    expect(paint('正在翻译...', 0)).toContain('[');
  });

  it('不同帧的亮带位置不同（流动）', () => {
    const paint = createShimmer({ color: true });
    expect(paint('正在翻译...', 0)).not.toBe(paint('正在翻译...', 5));
  });

  it('着色不改变文字内容', () => {
    const paint = createShimmer({ color: true });
    expect(stripAnsi(paint('正在请教 LLM...', 3))).toBe('正在请教 LLM...');
  });

  it('空字符串安全', () => {
    const paint = createShimmer({ color: true });
    expect(paint('', 0)).toBe('');
  });

  it('chalk 缺省时原样返回', () => {
    expect(shimmer('abc', 0, null)).toBe('abc');
  });

  it('空格不着色（保留原字符）', () => {
    const paint = createShimmer({ color: true });
    // 含空格的文案，去色后空格仍在
    expect(stripAnsi(paint('a b', 0))).toBe('a b');
  });
});
