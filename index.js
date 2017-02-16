var request = require('request');
var SOURCE = require('./lib/source');
var print = require('./lib/print');
var spawn = require('child_process').spawn;
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();
var parseString = require('xml2js').parseString;
var which = require('shelljs').which;
var hasSay = !!which('say');

module.exports = function(word) {
  // say it
  if (hasSay) {
    spawn('say', [word]);
  }

  word = encodeURIComponent(word);

  // iciba
  request.get(SOURCE.iciba.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        print.iciba(result.dict);
      });
    }
  });

  // youdao
  request.get(SOURCE.youdao.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(entities.decode(body));
      print.youdao(data);
    }
  });

  // dictionaryapi
  request.get(SOURCE.dictionaryapi.replace('${word}', word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        print.dictionaryapi(result.entry_list.entry, word);
      });
    }
  });
};
