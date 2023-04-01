const needle = require('needle');
const chalk = require('chalk');
const SOURCE = require('./lib/source');
const print = require('./lib/print');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const parseString = require('xml2js').parseString;
const isChinese = require('is-chinese');
const ora = require('ora');

module.exports = function (word, options, callback) {
  console.log('');
  const { say, iciba, youdao, dictionaryapi = false } = options;
  const requestCounts = [iciba, youdao, dictionaryapi].filter(isTrueOrUndefined).length;
  const spinner = ora().start();

  // say it
  try {
    if (!process.env.CI && isTrueOrUndefined(say)) {
      require('say').speak(word, isChinese(word) ? 'Ting-Ting' : null);
    }
  } catch (e) {
    // do nothing
  }

  let count = 0;
  const callbackAll = () => {
    count += 1;
    if (count >= requestCounts) {
      spinner.stop();
      spinner.clear();
      callback && callback();
    }
  };

  const endcodedWord = encodeURIComponent(word);

  // iciba
  isTrueOrUndefined(iciba) &&
    needle.get(SOURCE.iciba.replace('${word}', endcodedWord), { parse: false }, function (error, response) {
      if (error) {
        console.log(chalk.yellow(`访问 iciba 失败，请检查网络`));
      } else if (response.statusCode == 200) {
        parseString(response.body, function (err, result) {
          if (err) {
            return;
          }
          print.iciba(result.dict, options);
        });
      }
      callbackAll();
    });

  // youdao
  isTrueOrUndefined(youdao) &&
    needle.get(
      SOURCE.youdao.replace('${word}', endcodedWord),
      { parse: false },
      function (error, response) {
        if (error) {
          console.log(chalk.yellow(`访问 youdao 失败，请检查网络`));
        } else if (response.statusCode == 200) {
          try {
            const data = JSON.parse(entities.decode(response.body));
            print.youdao(data, options);
          } catch (e) {
            // 来自您key的翻译API请求异常频繁，为保护其他用户的正常访问，只能暂时禁止您目前key的访问
          }
        }
        callbackAll();
      },
    );

  print.chatgpt(word, options);
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
