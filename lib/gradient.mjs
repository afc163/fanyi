/**
 * 单色渐变背景工具
 * 每次调用随机选择一个色相，在同一色相内从亮到暗渐变
 */

const hues = [0, 25, 45, 120, 160, 180, 200, 260, 290, 330];

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

/**
 * 为文本生成绿色前景单色微渐变效果
 * 亮度在 58% ~ 42% 之间缓慢过渡，保持整体绿色观感
 */
export function gradientGreen(text, chalk) {
  if (chalk.level === 0) return text;
  const chars = [...text];
  return chars
    .map((char, i) => {
      const t = chars.length === 1 ? 0 : i / (chars.length - 1);
      const lightness = 58 - t * 16;
      const [r, g, b] = hslToRgb(130, 70, lightness);
      return chalk.rgb(r, g, b)(char);
    })
    .join('');
}

/**
 * 为文本生成单色渐变背景效果
 * 每次调用随机选择一个色相，在同一色相内从亮到暗渐变
 */
export function gradientBg(text, chalk) {
  if (chalk.level === 0) return text;

  const hue = hues[Math.floor(Math.random() * hues.length)];
  const chars = [...text];

  return chars
    .map((char, i) => {
      const t = chars.length === 1 ? 0 : i / (chars.length - 1);
      // 同一色相，亮度从 78% 渐变到 52%
      const lightness = 78 - t * 26;
      const [r, g, b] = hslToRgb(hue, 65, lightness);
      return chalk.bgRgb(r, g, b).black(char);
    })
    .join('');
}
