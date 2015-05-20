var request = require('request');
var parser = require('xml2json');
var SOURCE = require('./lib/source');
var print = require('./lib/print');
var spawn = require('child_process').spawn;
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

module.exports = function(word) {

  // avoid no say command
  process.on('uncaughtException', function(err) {
    if (err.toString().indexOf('spawn ENOENT') < 0) {
      console.log(err);
    }
  });

  // say it
  spawn('say', [word]);

  word = encodeURIComponent(word);

  // iciba
  request.get(SOURCE.iciba + word, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // escape " -> '
      body = body.replace(/&quot;/g, '&#39;');
      // iciba need twice decode ...
      var data = JSON.parse(entities.decode(entities.decode(parser.toJson(body)))).dict;
      print.iciba(data);
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
