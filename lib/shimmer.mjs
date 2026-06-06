import { Chalk } from 'chalk';

/**
 * 灰白流光文字（参考 Claude Code 的 shimmer）
 *
 * 文字底色为灰，一道道柔和的高光像波浪一样连续不断地从左向右流过，
 * 首尾相接、无明显间隔，带来持续的流光感（而非每隔几秒闪一下）。
 * 由时间驱动（非离散帧）。用于 spinner 的「正在请教 ... / 正在翻译 ...」。
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

const LIGHT_BASE = 60; // 带外底色亮度（灰）
const LIGHT_PEAK = 100; // 高光中心亮度（纯白）
const SIGMA = 0.55; // 单道高光的宽度（高斯标准差，越小越细，≈1 字宽的亮线）
const SPEED = 14; // 高光行进速度（字符/秒），决定流光快慢

/**
 * 生成某一时刻的流光文字
 *
 * 参考 Claude Code：只有「一道」柔和的高斯高光从左向右匀速扫过，
 * 滑出右端后下一道紧接着从左端进来，首尾相接、循环不断。
 *
 * @param {string} text 文案
 * @param {number} tMs 已流逝毫秒数，驱动高光位置（时间驱动）
 * @param {object} chalk Chalk 实例（level 0 时原样返回）
 */
export function shimmer(text, tMs, chalk) {
  if (!chalk || chalk.level === 0) return text;
  const chars = [...text];
  const n = chars.length;
  if (n === 0) return text;

  // 高光从屏外左侧滑入、到屏外右侧滑出，再循环；edge 是两侧的缓冲行程
  const edge = SIGMA * 2.5;
  const cycle = n - 1 + edge * 2; // 一道高光走完一遍的总行程（字符）
  const traveled = ((tMs / 1000) * SPEED) % cycle;
  const center = -edge + traveled; // 当前高光中心位置

  return chars
    .map((ch, i) => {
      if (ch === ' ') return ch;
      // 单道高斯高光：距中心越近越亮（趋近纯白），远处回落为灰
      const d = i - center;
      const gauss = Math.exp(-(d * d) / (2 * SIGMA * SIGMA)); // 0~1
      const light = LIGHT_BASE + (LIGHT_PEAK - LIGHT_BASE) * gauss;
      const [r, g, b] = hslToRgb(0, 0, light); // 灰阶，无色相
      return chalk.rgb(r, g, b)(ch);
    })
    .join('');
}

/** 便捷工厂：固定 color 配置，返回 (text, tMs) => string */
export function createShimmer(options = {}) {
  const chalk = new Chalk({ level: options.color === false ? 0 : 3 });
  return (text, tMs) => shimmer(text, tMs, chalk);
}
