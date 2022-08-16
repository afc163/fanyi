const needle = require('needle');
const SOURCE = require('./lib/source');
const print = require('./lib/print');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const parseString = require('xml2js').parseString;
const isChinese = require('is-chinese');
const ora = require('ora');

module.exports = function (word, options, callback) {
  console.log('');
  const { say, iciba, youdao, dictionaryapi } = options;
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
      callback && callback();
    }
  };

  word = encodeURIComponent(word);

  // iciba
  isTrueOrUndefined(iciba) &&
    needle.get(SOURCE.iciba.replace('${word}', word), { parse: false }, function (error, response) {
      if (!error && response.statusCode == 200) {
        const body = response.body;
        parseString(body, function (err, result) {
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
      SOURCE.youdao.replace('${word}', word),
      { parse: false },
      function (error, response) {
        if (!error && response.statusCode == 200) {
          const body = response.body;
          try {
            const data = JSON.parse(entities.decode(body));
            print.youdao(data, options);
          } catch (e) {
            // 来自您key的翻译API请求异常频繁，为保护其他用户的正常访问，只能暂时禁止您目前key的访问
          }
        }
        callbackAll();
      },
    );

  // dictionaryapi
  isTrueOrUndefined(dictionaryapi) &&
    needle.get(
      SOURCE.dictionaryapi.replace('${word}', word),
      { timeout: 6000 },
      function (error, response) {
        if (error) {
          return callbackAll();
        }
        if (response.statusCode == 200) {
          const body = response.body;
          parseString(body, function (err, result) {
            if (!err) {
              print.dictionaryapi(result.entry_list.entry, word, options);
            }
          });
        }
        callbackAll();
      },
    );
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
