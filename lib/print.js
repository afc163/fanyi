exports.iciba = function(data) {

  var firstLine = '';

  // word
  firstLine += data.key + ' ';

  // phonetic symbol
  if (data.ps && data.ps.length) {
    var ps = '';
    data.ps.forEach(function(item, i) {
      firstLine += (' ' + (i === 0 ? '英' : '美') + '[ ' + item + ' ] ').magenta;
    });
    firstLine += ps;
  }

  log(firstLine + ' ~  iciba.com'.faint);

  // maybe string
  if (typeof data.pos === 'string') {
    data.pos = [data.pos];
    data.acceptation = [data.acceptation];
  }
  // pos & acceptation
  if (data.pos && data.pos.length) {
    log();
    data.pos.forEach(function(item, i) {
      log('- '.faint + (data.pos[i] + ' ' + data.acceptation[i]).green);
    });
  }

  // sentence
  if (data.sent && data.sent.length) {
    log();
    data.sent.forEach(function(item, i) {
      log((i + 1 + '. ').faint + item.orig.grey);
      log('   ' + item.trans.cyan);
    });
  }

  log();

};

exports.youdao = function(data) {

  var firstLine = '';

  // word
  firstLine += data.query;

  // phonetic symbol
  if (data.basic && data.basic.phonetic) {
    firstLine += ('  [ ' + data.basic.phonetic + ' ]').magenta;
  }

  log(firstLine + '  ~  fanyi.youdao.com'.faint);

  // pos & acceptation
  if (data.basic && data.basic.explains) {
    log();
    data.basic.explains.forEach(function(item) {
      log('- '.faint + item.green);
    });
  }

  // sentence
  if (data.web && data.web.length) {
    log();
    data.web.forEach(function(item, i) {
      log((i + 1 + '. ').faint + item.key.grey);
      log('   ' + item.value.join(',').cyan);
    });
  }

  log();

};

function log(message, indentNum) {
  indentNum = indentNum || 1;
  var indent = '';
  for (var i=1; i<indentNum; i++) {
    indent += '  ';
  }
  console.log(indent, message || '');
}
