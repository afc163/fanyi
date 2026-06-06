import { Chalk } from 'chalk';

/**
 * 青紫流光文字
 *
 * 一条高亮带（青 → 紫）在文字上按帧位置周期性滑过，带外字符压暗，
 * 形成流光 / shimmer 效果。用于 spinner 的「正在请教 LLM... / 正在翻译...」。
 */

function hslToRgb(hue, sat, light) {
  const h = hue / 360;
  const s = sat / 100;
  const l = light / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, tInput) => {
    let t = tInput;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

const HUE_CYAN = 187;
const HUE_PURPLE = 280;
const BAND = 5; // 高亮带宽度（字符数）

/**
 * 生成某一帧的流光文字
 * @param {string} text 文案
 * @param {number} frame 帧序号（递增），决定亮带位置
 * @param {object} chalk Chalk 实例（level 0 时原样返回）
 */
export function shimmer(text, frame, chalk) {
  if (!chalk || chalk.level === 0) return text;
  const chars = [...text];
  const n = chars.length;
  if (n === 0) return text;

  // 亮带中心在文字上循环移动（多走一段，让亮带能完整滑出再进入）
  const period = n + BAND * 2;
  const center = (frame % period) - BAND;

  return chars
    .map((ch, i) => {
      if (ch === ' ') return ch;
      const dist = Math.abs(i - center);
      // 距离亮带中心越近越亮、色相越偏青；带外压暗为低亮度紫灰
      const t = Math.max(0, 1 - dist / BAND); // 0(带外) ~ 1(带心)
      const hue = HUE_PURPLE - (HUE_PURPLE - HUE_CYAN) * t;
      const light = 32 + 46 * t; // 32%(暗) ~ 78%(亮)
      const sat = 55 + 30 * t;
      const [r, g, b] = hslToRgb(hue, sat, light);
      return chalk.rgb(r, g, b)(ch);
    })
    .join('');
}

/** 便捷工厂：固定 color 配置，返回 (text, frame) => string */
export function createShimmer(options = {}) {
  const chalk = new Chalk({ level: options.color === false ? 0 : 3 });
  return (text, frame) => shimmer(text, frame, chalk);
}
