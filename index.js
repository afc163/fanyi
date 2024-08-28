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
  const { say, iciba } = options;
  const requestCounts = [iciba].filter(isTrueOrUndefined).length;
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

};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
