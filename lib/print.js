const chalk = require('chalk');
const ora = require('ora');
const gradient = require('gradient-string');
const { saveHistory } = require('./searchHistory');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('isomorphic-unfetch');

exports.iciba = function (data, options = {}) {
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }

  let firstLine = '';
  const means = [];

  // word
  firstLine += data.key + ' ';

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
  if (data.ps && data.ps.length) {
    data.ps.forEach(function (item, i) {
      firstLine += chalk.magenta(' ' + (i === 0 ? '英' : '美') + '[ ' + item + ' ] ');
    });
  }

  log(firstLine + chalk.gray(' ~  iciba.com'));

  // pos & acceptation
  if (data.pos && data.pos.length) {
    data.pos.forEach(function (item, i) {
      if (typeof data.pos[i] !== 'string' || !data.pos[i]) {
        return;
      }
      log(chalk.gray('- ') + chalk.green(data.pos[i] + ' ' + data.acceptation[i].trim()));
      means.push(data.pos[i] + ' ' + data.acceptation[i].trim());
    });
  }

  // sentence
  if (data.sent && data.sent.length) {
    log();
    data.sent.forEach(function (item, i) {
      if (typeof item.orig !== 'string' && item.orig[0]) {
        item.orig = item.orig[0].trim();
      }
      if (typeof item.trans !== 'string' && item.trans[0]) {
        item.trans = item.trans[0].trim();
      }
      log(chalk.gray(i + 1 + '. ') + highlight(item.orig, data.key));
      log('   ' + chalk.cyan(item.trans));
    });
  }

  log();
  log(chalk.gray('-----'));
  log();
  saveHistory(data.key[0], means);
};

function log(message, indentNum) {
  indentNum = indentNum || 1;
  let indent = '';
  for (let i = 1; i < indentNum; i += 1) {
    indent += '  ';
  }
  console.log(indent, message || '');
}

function highlight(string, key, defaultColor) {
  defaultColor = defaultColor || 'gray';
  string = string.replace(
    new RegExp('(.*)(' + key + ')(.*)', 'gi'),
    '$1$2' + chalk[defaultColor]('$3'),
  );
  return string.replace(
    new RegExp('(.*?)(' + key + ')', 'gi'),
    chalk[defaultColor]('$1') + chalk.yellow('$2'),
  );
}

function initChalkWithNoColor() {
  try {
    return new chalk.constructor({ enabled: false });
  } catch (e) {
    return new chalk.Instance({ level: 0 });
  }
}
