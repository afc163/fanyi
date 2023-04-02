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

exports.youdao = function (data, options) {
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }

  let firstLine = '';

  // word
  firstLine += data.query;

  // phonetic symbol
  if (data.basic && data.basic.phonetic) {
    firstLine += chalk.magenta('  [ ' + data.basic.phonetic + ' ]');
  }
  log(firstLine + chalk.gray('  ~  fanyi.youdao.com'));
  // pos & acceptation
  if (data.basic && data.basic.explains) {
    log();
    data.basic.explains.forEach(function (item) {
      log(chalk.gray('- ') + chalk.green(item));
    });
  }

  // sentence
  if (data.web && data.web.length) {
    log();
    data.web.forEach(function (item, i) {
      log(chalk.gray(i + 1 + '. ') + highlight(item.key, data.query));
      log('   ' + chalk.cyan(item.value.join(',')));
    });
  }

  log();
  log(chalk.gray('-----'));
  log();

  saveHistory(data.query, data.basic.explains);
};

exports.dictionaryapi = function (data, word, options) {
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }

  if (word.indexOf('%') >= 0) {
    return;
  }
  log(word + chalk.gray('  ~  dictionaryapi.com'));
  log();

  if (!data) {
    return;
  }
  data.forEach(function (item) {
    if (
      Array.isArray(item.ew) &&
      item.ew.some(function (w) {
        return w === word;
      })
    ) {
      if (item.cx) {
        item.cx.forEach(function (cx_item) {
          log(chalk.gray(' - ') + chalk.green(cx_item.cl));
          log(chalk.gray(' - ') + chalk.green(cx_item.ct));
        });
      }
      if (item.def) {
        item.def.forEach(function (def) {
          def.dt.forEach(function (obj) {
            let meaning = '';
            if (typeof obj === 'string') {
              meaning = obj;
            } else if (obj['_']) {
              meaning = obj['_'];
            }
            meaning = meaning.replace(/^\s*:\s*/, '').replace(/\s*:\s*$/, '');
            if (meaning) {
              log(chalk.gray(' - ') + highlight(chalk.green(meaning), word, 'green'));
            }
          });
        });
      }
    }
  });

  log();
  log(chalk.gray('-----'));
  log();
};

exports.chatgpt = async (word, options) => {
  if (!options.openaiApiKey || options.openaiApiKey === 'false') {
    return;
  }
  if (options.color === false) {
    chalk = initChalkWithNoColor();
  }
  const { ChatGPTAPI } = await import('chatgpt');

  const api = process.env.http_proxy
    ? new ChatGPTAPI({
        apiKey: options.openaiApiKey,
        fetch: (url, options) => {
          options.agent = new HttpsProxyAgent(process.env.http_proxy);
          return fetch(url, options);
        },
      })
    : new ChatGPTAPI({ apiKey: options.openaiApiKey });

  const spinner = ora().start();
  return api
    .sendMessage(
      `
    你是一本中英文字典，请给出这个词的翻译、音标或拼音、同义词和近义词、并提供相关例句：${word}
  `,
    )
    .then((res) => {
      spinner.stop();
      spinner.clear();
      log(word + chalk.gray('  ~  ChatGPT'));
      log();
      res.text
        .trim()
        .split('\n')
        .forEach((line) => {
          log(options.color === false ? line : gradient.atlas(line));
        });
      log();
      log(chalk.gray('-----'));
      log();
    })
    .catch((e) => {
      spinner.stop();
      spinner.clear();
      log(chalk.yellow('Cannot reach OpenAI api, please check network.'));
      log();
    });
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
