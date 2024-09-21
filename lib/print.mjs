import chalk from 'chalk';
import { saveHistory } from './searchHistory.mjs';

export const iciba = (data, options = {}) => {
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }

  let firstLine = '';
  const means = [];

  // word
  firstLine += `${data.key} `;

  // maybe string
  [data.ps, data.pos, data.acceptation] = [data.ps, data.pos, data.acceptation].map((item) =>
    typeof item === 'string' ? [item] : item,
  );

  // phonetic symbol
  data.ps?.forEach?.((item, i) => {
    firstLine += chalk.magenta(` ${i === 0 ? '英' : '美'}[ ${item} ] `);
  });

  log(firstLine + chalk.gray(' ~  iciba.com'));

  if (data.pos?.length) {
    log();
  }

  // pos & acceptation
  data.pos?.forEach?.((item, i) => {
    if (typeof data.pos[i] !== 'string' || !data.pos[i]) {
      return;
    }
    log(`${chalk.gray('- ')}${chalk.green(`${data.pos[i]} ${data.acceptation[i].trim()}`)}`);
    means.push(`${data.pos[i]} ${data.acceptation[i].trim()}`);
  });

  // sentence
  if (data.sent?.length) {
    log();
  }

  data.sent?.forEach?.((item, i) => {
    [item.orig, item.trans] = [item.orig, item.trans].map((subItem) =>
      typeof subItem !== 'string' && subItem[0] ? subItem[0].trim() : subItem,
    );
    log(`${chalk.gray(`${i + 1}. `)}${highlight(item.orig, data.key)}`);
    log(`   ${chalk.cyan(item.trans)}`);
  });

  log();
  log(chalk.gray('-----'));
  log();
  saveHistory(data.key[0], means);
};

function log(message, indentNum = 1) {
  let indent = '';
  for (let i = 1; i < indentNum; i += 1) {
    indent += ' ';
  }
  console.log(indent, message || '');
}

function highlight(string, key, defaultColor = 'gray') {
  return string
    .replace(new RegExp(`(.*)(${key})(.*)`, 'gi'), `$1$2${chalk[defaultColor]('$3')}`)
    .replace(new RegExp(`(.*?)(${key})`, 'gi'), chalk[defaultColor]('$1') + chalk.yellow('$2'));
}

function initChalkWithNoColor() {
  try {
    return new chalk.constructor({ enabled: false });
  } catch (e) {
    return new chalk.Instance({ level: 0 });
  }
}
