const request = require('request');
const SOURCE = require('./lib/source');
const print = require('./lib/print');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const parseString = require('xml2js').parseString;
const say = require('say');
const isChinese = require('is-chinese');

module.exports = function(word) {
  // say it
  try {
    say.speak(word, isChinese(word) ? 'Ting-Ting' : null);
  } catch(e) {
    // do nothing
  }

  word = encodeURIComponent(word);

  // iciba
  request.get(SOURCE.iciba.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        if (err) {
          return;
        }
        print.iciba(result.dict);
      });
    }
  });

  // youdao
  request.get(SOURCE.youdao.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        const data = JSON.parse(entities.decode(body));
        print.youdao(data);
      } catch(e) {
        // 来自您key的翻译API请求异常频繁，为保护其他用户的正常访问，只能暂时禁止您目前key的访问
      }
    }
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
  });
};
