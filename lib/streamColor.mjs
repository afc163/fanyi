import { Chalk } from 'chalk';
import { gradientGreen } from './gradient.mjs';

/**
 * 流式着色器
 *
 * LLM 逐 token 吐字，token 边界任意（「苹」「果」会分两次到达），
 * 无法在写出的那一刻知道字符属于哪个语义字段。因此这里按「整行」结算：
 * delta 拼进缓冲，遇换行才对整行做着色并输出。
 *
 * 着色锚点用「结构线索」而非模型吐出的标记（弱模型会漏写导致串色）：
 *   - 首个内容行（头部）：以 ~ 切三段 → 原词/音标 + 译文/拼音 + emoji
 *   - 行首 `-` 列表行：词性 magenta + 释义绿
 *   - 行首数字的英文例句：下划线；缩进的中文：灰
 *   - 末尾两行格言：英文渐变绿 + 中文灰
 *
 * 同时做防御性兜底：丢弃泄漏的指令行、删除残留的占位符标签。
 */

// 泄漏的整行指令（弱模型偶尔把 system prompt 的要求照抄出来）→ 整行丢弃
const LEAK_LINE = /(座右铭|严格仿照|占位符|不要输出任何|直接输出内容|以「?-|^要求[:：])/;
// 残留的占位符标签 token → 删除（保留括号内真实内容由后续逻辑处理）
const LEAK_TOKEN = /\[\s*(原词|音标|翻译|拼音|EMOJI|词性|释义\d*|座右铭)\s*\]/g;

function isCJK(ch) {
  const code = ch.codePointAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK 统一表意
    (code >= 0x3400 && code <= 0x4dbf) || // 扩展 A
    (code >= 0x3000 && code <= 0x303f) || // CJK 标点
    (code >= 0xff00 && code <= 0xffef) // 全角
  );
}

// 去掉占位符标签；若整行被一对方括号包裹（如「[good]」）则脱框
function stripTags(line) {
  let s = line.replace(LEAK_TOKEN, '');
  s = s.replace(/\[([^\][]+)\]/g, '$1');
  return s;
}

// 头部行：word /phon/ ~ 译文 拼音 ~ emoji
function colorHead(line, chalk) {
  const segs = line.split('~');
  const painted = segs.map((seg, i) => {
    if (i === 0) {
      // 原词 + 音标：斜杠包裹的音标灰，其余绿
      return seg.replace(/(\S[^/]*)(\/[^/]*\/)?/, (_m, word, phon) => {
        const w = word
          ? gradientGreen(word.trimEnd(), chalk) + word.slice(word.trimEnd().length)
          : '';
        return w + (phon ? chalk.gray(phon) : '');
      });
    }
    if (i === segs.length - 1) {
      // 最后一段是 emoji，原样
      return seg;
    }
    // 中间段：译文 + 拼音，CJK 亮青、拉丁/空格灰
    return [...seg].map((ch) => (isCJK(ch) ? chalk.cyanBright(ch) : chalk.gray(ch))).join('');
  });
  return painted.join(chalk.gray('~'));
}

// 列表释义行：- 词性. 释义
function colorMeaning(line, chalk) {
  const m = line.match(/^(\s*-\s*)(\S+?\.)?(\s*)(.*)$/);
  if (!m) return gradientGreen(line, chalk);
  const [, dash, pos, gap, rest] = m;
  return (
    chalk.gray(dash) +
    (pos ? chalk.magenta(pos) : '') +
    gap +
    (rest ? gradientGreen(rest, chalk) : '')
  );
}

export function createStreamColorizer(options = {}) {
  const chalk = new Chalk({ level: options.color === false ? 0 : 3 });

  let buf = '';
  let lineNo = 0; // 已结算的非空内容行计数，用于识别头部行
  let out = '';

  function flushLine(line) {
    const stripped = stripTags(line);
    const trimmed = stripped.trim();

    // 防御：泄漏指令整行丢弃
    if (LEAK_LINE.test(trimmed)) return;

    if (trimmed === '') {
      out += '\n';
      return;
    }

    lineNo += 1;

    // 分隔线
    if (/^-{3,}$/.test(trimmed)) {
      out += `${chalk.gray(stripped)}\n`;
      return;
    }
    // 头部行（第一条有内容的行，且含 ~ 分隔）
    if (lineNo === 1 && stripped.includes('~')) {
      out += `${colorHead(stripped, chalk)}\n`;
      return;
    }
    // 「例句:」小标题
    if (/^例句[:：]?$/.test(trimmed)) {
      out += `${chalk.gray(stripped)}\n`;
      return;
    }
    // 列表释义行
    if (/^\s*-\s/.test(stripped)) {
      out += `${colorMeaning(stripped, chalk)}\n`;
      return;
    }
    // 编号英文例句：1. xxx
    if (/^\s*\d+\.\s/.test(stripped)) {
      const m = stripped.match(/^(\s*\d+\.\s*)(.*)$/);
      out += `${chalk.gray(m[1])}${chalk.underline(m[2])}\n`;
      return;
    }
    // 缩进行：例句中文翻译 → 灰
    if (/^\s{2,}\S/.test(stripped)) {
      out += `${chalk.gray(stripped)}\n`;
      return;
    }
    // 顶格的非 CJK 起始行 → 视作英文格言，渐变绿
    if (!isCJK(trimmed[0]) && /[a-zA-Z]/.test(trimmed)) {
      out += `${gradientGreen(stripped, chalk)}\n`;
      return;
    }
    // 其余（多为格言中文翻译）→ 灰
    out += `${chalk.gray(stripped)}\n`;
  }

  return {
    /** 喂入一段 delta，返回此刻可输出的已着色文本（可能为空，行未结束时） */
    push(delta) {
      buf += delta;
      out = '';
      let idx = buf.indexOf('\n');
      while (idx !== -1) {
        flushLine(buf.slice(0, idx));
        buf = buf.slice(idx + 1);
        idx = buf.indexOf('\n');
      }
      return out;
    },
    /** 流结束，冲刷缓冲里最后一行（无换行结尾） */
    end() {
      out = '';
      if (buf.length > 0) {
        flushLine(buf);
        buf = '';
        // flushLine 末尾会补 \n，最后一行去掉多余换行
        if (out.endsWith('\n')) out = out.slice(0, -1);
      }
      return out;
    },
  };
}
