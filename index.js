const request = require('request');
const SOURCE = require('./lib/source');
const print = require('./lib/print');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const parseString = require('xml2js').parseString;
const isChinese = require('is-chinese');
const ora = require('ora');

module.exports = function(word, callback) {
  var simpleMode = false;
  if (word.includes('--simple')) {
    simpleMode = true;
    word = word.replace('--simple','').trim();
  }
  const spinner = ora().start();
  // say it
  try {
    if (!process.env.CI) {
      require('say').speak(word, isChinese(word) ? 'Ting-Ting' : null);
    }
  } catch(e) {
    // do nothing
  }

  let count = 0;
  const callbackAll = () => {
    count += 1;
    if (count >= 3) {
      spinner.stop();
      callback && callback();
    }
  };

  word = encodeURIComponent(word);

  // iciba
  request.get(SOURCE.iciba.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        if (err) {
          return;
        }
        print.iciba(result.dict, simpleMode);
      });
    }
    callbackAll();
  });

  // youdao
  request.get(SOURCE.youdao.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        const data = JSON.parse(entities.decode(body));
        print.youdao(data, simpleMode);
      } catch(e) {
        // 来自您key的翻译API请求异常频繁，为保护其他用户的正常访问，只能暂时禁止您目前key的访问
      }
    }
    callbackAll();
  });

  // dictionaryapi
  request.get(SOURCE.dictionaryapi.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        if (!err) {
          print.dictionaryapi(result.entry_list.entry, word);
        }
      });
    }
    callbackAll();
  });
};
