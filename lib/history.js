var fs = require('fs');
var util = require('util');
var EOL = require('os').EOL;
var Transform = require('stream').Transform;
var parseLineRe = /^\[([^\]]+)\]\s*(.*)$/;

exports.write = function (word, options, cb) {
  cb || (cb = function () {});
  options || (options = {});

  fs.readFile(options.filepath, 'utf8', function (err, content) {
    if (err) {
      content = '';
    }
    var lines = content.split(EOL);
    if (lines.length >= options.filesize) {
      lines = lines.slice(1, options.filesize);
    }
    lines.unshift(exports.format(word));
    content = lines.join(EOL);
    fs.writeFile(options.filepath, content, options, cb);
  });
};

exports.format = function (word) {
  var now = new Date();
  return '[' + now + '] ' + word;
};

exports.ParseStream = ParseStream;

util.inherits(ParseStream, Transform);

function ParseStream() {
  if (!(this instanceof ParseStream)) {
    return new ParseStream();
  }
  Transform.call(this, { objectMode: true });
  this.currLine = '';
}

ParseStream.prototype._transform = function (chunk, enc, cb) {
  chunk = chunk.toString('utf8');
  var lines = chunk.split(this.currLine + EOL);
  this.currLine = lines.pop();
  lines.forEach(this.parse.bind(this));
  cb();
};

ParseStream.prototype._flush = function (cb) {
  this.currLine && this.parse(this.currLine);
  cb();
};

ParseStream.prototype.parse = function (line) {
  var match = parseLineRe.exec(line);
  match && this.push({
    date: new Date(match[1]),
    word: match[2]
  });
};
