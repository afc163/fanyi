import { Chalk } from 'chalk';
import { gradientBg } from './gradient.mjs';
import { saveHistory } from './searchHistory.mjs';

function log(message, indentNum = 1) {
  let indent = '';
  for (let i = 1; i < indentNum; i += 1) {
    indent += ' ';
  }
  console.log(indent, message || '');
}

export function printIciba(word, message, options = {}) {
  const chalk = new Chalk({ level: options.color === false ? 0 : 3 });
  if (!Array.isArray(message) || message.length === 0) {
    log(chalk.gray(`未找到 ${word} 的释义 ~  iciba.com`));
    return;
  }

  // 优先取与查询词完全一致的条目，否则取第一条
  const matched =
    message.find((item) => item?.key?.toLowerCase() === word.toLowerCase()) || message[0];

  if (!matched) {
    log(chalk.gray(`未找到 ${word} 的释义 ~  iciba.com`));
    return;
  }

  const means = [];

  // 第一行:单词
  const matchedKey = matched.key || word;
  log(`${gradientBg(` ${matchedKey} `, chalk)} ${chalk.gray('~ iciba.com')}`);

  if (matched.means?.length) {
    log();
  }

  // 词性 & 释义
  for (const item of matched.means || []) {
    if (!item) {
      continue;
    }
    const part = item.part ? `${chalk.magenta(item.part)} ` : '';
    const meaning = (item.means || []).join('；');
    if (!meaning) {
      continue;
    }
    log(`${chalk.gray('- ')}${part}${chalk.green(meaning)}`);
    means.push(`${part}${meaning}`.trim());
  }

  // 相关联想词
  const related = message.filter((item) => item && item !== matched && item.key && item.paraphrase);
  if (related.length) {
    log();
    log(chalk.gray('相关词:'));
    for (const item of related) {
      log(`${chalk.gray('- ')}${chalk.cyan(item.key)}  ${chalk.gray(item.paraphrase)}`);
    }
  }

  log();
  log(chalk.gray('-----'));
  log();
  saveHistory(matchedKey, means);
}
