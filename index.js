var request = require('request');
var SOURCE = require('./lib/source');
var print = require('./lib/print');
var spawn = require('child_process').spawn;
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();
var parseString = require('xml2js').parseString;

module.exports = function(word) {

  // avoid no say command
  process.on('uncaughtException', function(err) {
    if (err.toString().indexOf('spawn ENOENT') < 0) {
      console.log(err.stack);
    }
  });

  // say it
  spawn('say', [word]);

  word = encodeURIComponent(word);

  // iciba
  request.get(SOURCE.iciba + word, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, result) {
        print.iciba(result.dict);
      });
    }
  });

  // youdao
  request.get(SOURCE.youdao + word, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(entities.decode(body));
      print.youdao(data);
    }
  });

};
