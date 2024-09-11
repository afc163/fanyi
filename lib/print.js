const { saveHistory } = require('./searchHistory');
let chalk = require('chalk');

exports.iciba = (data, options = {}) => {
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }

  let firstLine = '';
  const means = [];

  // word
  firstLine += `${data.key} `;

  // maybe string
  if (typeof data.ps === 'string') {
    data.ps = [data.ps];
  }
  if (typeof data.pos === 'string') {
    data.pos = [data.pos];
  }
  if (typeof data.acceptation === 'string') {
    data.acceptation = [data.acceptation];
  }

  // phonetic symbol
  data.ps?.forEach((item, i) => {
    firstLine += chalk.magenta(` ${i === 0 ? '英' : '美'}[ ${item} ] `);
  });

  log(firstLine + chalk.gray(' ~  iciba.com'));

  // pos & acceptation
  data.pos?.forEach((item, i) => {
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

  data.sent?.forEach((item, i) => {
    if (typeof item.orig !== 'string' && item.orig[0]) {
      item.orig = item.orig[0].trim();
    }
    if (typeof item.trans !== 'string' && item.trans[0]) {
      item.trans = item.trans[0].trim();
    }
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
