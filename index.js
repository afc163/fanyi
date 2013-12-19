var request = require('request');
var parser = require('xml2json');
var SOURCE = require('./lib/source.json');
var print = require('./lib/print');
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

module.exports = function(word) {
  request.get(SOURCE['iciba'] + encodeURIComponent(word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(entities.decode(parser.toJson(body))).dict;
      print.iciba(data);
    }
  });
  request.get(SOURCE['youdao'] + encodeURIComponent(word), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(entities.decode(body));
      print.youdao(data);
    }
  });
};
