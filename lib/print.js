exports.iciba = function(data) {
  var firstLine = '';

  // word
  firstLine += data.key + ' ';

  // maybe string
  if (typeof data.ps === 'string') {
    data.ps = [data.ps];
  }
  if (typeof data.pos === 'string') {
    data.pos = [data.pos];
  }
  if (typeof data.acceptation === 'string') {
    data.acceptation = [data.acceptation];
  }

  // phonetic symbol
  if (data.ps && data.ps.length) {
    var ps = '';
    data.ps.forEach(function(item, i) {
      firstLine += (' ' + (i === 0 ? '英' : '美') + '[ ' + item + ' ] ').magenta;
    });
    firstLine += ps;
  }

  log(firstLine + ' ~  iciba.com'.faint);

  // pos & acceptation
  if (data.pos && data.pos.length) {
    log();
    data.pos.forEach(function(item, i) {
      if (typeof data.pos[i] !== 'string' || !data.pos[i]) {
        return;
      }
      log('- '.faint + (data.pos[i] + ' ' + data.acceptation[i].trim()).green);
    });
  }

  // sentence
  if (data.sent && data.sent.length) {
    log();
    data.sent.forEach(function(item, i) {
      if (typeof item.orig !== 'string' && item.orig[0]) {
        item.orig = item.orig[0].trim();
      }
      if (typeof item.trans !== 'string' && item.trans[0]) {
        item.trans = item.trans[0].trim();
      }
      log((i + 1 + '. ').faint + highlight(item.orig, data.key));
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
      log((i + 1 + '. ').faint + highlight(item.key, data.query));
      log('   ' + item.value.join(',').cyan);
    });
  }

  log();
};

exports.dictionaryapi = function(data, word) {
  if (word.indexOf('%') >= 0) {
    return;
  }
  log(word + '  ~  dictionaryapi.com'.faint);
  log();

  var i = 1;
  if (!data) {
    return;
  }
  data.forEach(function(item) {
    if (item.ew.some(function(w) { return w === word })) {
      item.def.forEach(function(def) {
        def.dt.forEach(function(obj) {
          var meaning = '';
          if (typeof obj === 'string') {
            meaning = obj;
          } else if (obj['_']) {
            meaning = obj['_'];
          }
          meaning = meaning.replace(/^\s*:\s*/, '').replace(/\s*:\s*$/, '');
          if (meaning) {
            log((' - ').faint + highlight(meaning, word).green);
            i += 1;
          }
        });
      });
    }
  });

  log();
}

function log(message, indentNum) {
  indentNum = indentNum || 1;
  var indent = '';
  for (var i=1; i<indentNum; i++) {
    indent += '  ';
  }
  console.log(indent, message || '');
}

function highlight(string, key) {
  string = string.replace(new RegExp('(.*)(' + key + ')(.*)', 'gi'), '$1$2' + '$3'.faint);
  return string.replace(new RegExp('(.*?)(' + key + ')', 'gi'), '$1'.faint + '$2'.yellow);
}
