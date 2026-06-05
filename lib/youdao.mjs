import { Chalk } from 'chalk';
import { saveHistory } from './searchHistory.mjs';

function log(message, indentNum = 1) {
  let indent = '';
  for (let i = 1; i < indentNum; i += 1) {
    indent += ' ';
  }
  console.log(indent, message || '');
}

/**
 * 判断是否为中文
 */
function isChinese(word) {
  return /[一-鿿]/.test(word);
}

/**
 * 去除 HTML 标签
 */
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '');
}

/**
 * 从有道 jsonapi 响应中提取释义并格式化输出
 */
export function printYoudao(word, data, options = {}) {
  const chalk = new Chalk({ level: options.color === false ? 0 : 3 });

  if (!data || typeof data !== 'object') {
    log(chalk.gray(`未找到 ${word} 的释义 ~  youdao.com`));
    return;
  }

  // 英中词典 or 中英词典
  const isEN = isChinese(word) === false;
  const dict = isEN ? data.ec : data.ce;

  if (!dict?.word?.length) {
    log(chalk.gray(`未找到 ${word} 的释义 ~  youdao.com`));
    return;
  }

  const entry = dict.word[0];
  const means = [];

  // 第一行：单词 + 音标 + 来源
  const phrase = entry.returnPhrase || entry['return-phrase'] || word;
  const displayPhrase = typeof phrase === 'object' ? phrase.l?.i || word : phrase;

  let phonetic = '';
  if (isEN) {
    const us = entry.usphone ? `美 [${entry.usphone}]` : '';
    const uk = entry.ukphone ? `英 [${entry.ukphone}]` : '';
    phonetic = [us, uk].filter(Boolean).join('  ');
  } else {
    phonetic = entry.phone ? `[${entry.phone}]` : '';
  }

  log(
    `${chalk.bgCyan.black(` ${displayPhrase} `)} ${phonetic ? chalk.blue(phonetic) : ''} ${chalk.gray('~  youdao.com')}`,
  );

  // 释义
  const trs = entry.trs || [];
  if (trs.length) {
    log();
  }
  for (const tr of trs) {
    const items = tr.tr || [];
    for (const item of items) {
      const l = item.l;
      if (!l) continue;

      let text = '';
      if (isEN) {
        const parts = (l.i || [])
          .map((p) => (typeof p === 'string' ? p : p['#text'] || ''))
          .filter(Boolean);
        text = parts.join(' ');
      } else if (l['#tran']) {
        const parts = (l.i || [])
          .map((p) => (typeof p === 'string' ? p : p['#text'] || ''))
          .filter(Boolean);
        text = `${parts.join(' ')} ${l['#tran']}`;
      }

      if (text.trim()) {
        log(`${chalk.gray('- ')}${chalk.green(text.trim())}`);
        means.push(text.trim());
      }
    }
  }

  // 词形变化
  const wfs = entry.wfs || [];
  const wfItems = wfs
    .map((wf) => {
      const name = wf.wf?.name;
      const value = wf.wf?.value;
      return name && value ? `${chalk.cyan(value)}` : '';
    })
    .filter(Boolean);
  if (wfItems.length) {
    log();
    const names = wfs.map((wf) => wf.wf?.name).filter(Boolean);
    log(`${chalk.gray('词形  ')}${wfItems.join(chalk.gray('  '))}`);
    log(`${chalk.gray('      ')}${names.join(chalk.gray('  '))}`);
  }

  // 近义词
  const synos = data.syno?.synos || [];
  if (synos.length) {
    log();
    for (const s of synos) {
      const pos = s.pos || '';
      const tran = s.tran || '';
      const words = (s.ws || []).map((w) => w.w).filter(Boolean);
      if (words.length) {
        const label = pos ? `${chalk.gray(pos)}` : '';
        log(`${chalk.gray('近义  ')}${label}${label ? ' ' : ''}${words.join(chalk.gray(', '))}`);
      }
    }
  }

  // 常用词组
  const phrs = data.phrs?.phrs || [];
  if (phrs.length) {
    log();
    log(chalk.gray('词组:'));
    for (const p of phrs.slice(0, 5)) {
      const hw = p.phr?.headword?.l?.i || '';
      const tr = p.phr?.trs?.[0]?.tr?.l?.i || '';
      if (hw) {
        log(`${chalk.gray('- ')}${chalk.cyan(hw)}  ${chalk.gray(tr)}`);
      }
    }
  }

  // 双语例句
  const sents = data.blng_sents_part?.['sentence-pair'] || [];
  if (sents.length) {
    log();
    log(chalk.gray('例句:'));
    for (const s of sents.slice(0, 3)) {
      const en = stripHtml(s['sentence-eng'] || s.sentence || '').trim();
      const zh = (s['sentence-translation'] || '').trim();
      if (en) {
        log(`${chalk.gray('- ')}${en}`);
        if (zh) {
          log(`  ${chalk.gray(zh)}`);
        }
      }
    }
  }

  log();
  log(chalk.gray('-----'));
  log();
  if (means.length) {
    saveHistory(displayPhrase, means);
  }
}
