var path = require('path');
var homeDir = require('home-dir');

module.exports = Options;

function Options(obj) {
  this.data = obj || {};
}

Options.prototype = {
  get enableHistory() {
    return this.data.hasOwnProperty('enableHistory')
      ? Boolean(this.data.enableHistory)
      : process.env.FANYI_ENABLE_HISTORY === '1';
  },

  get historyFilePath() {
    var filepath = this.data.historyFilePath
      || process.env.FANYI_HISTORY_FILE_PATH
      || homeDir('.fanyi_history');
    return path.resolve(process.cwd(), filepath);
  },

  get historyFileSize() {
    var size = this.data.historyFileSize
      || process.env.FANYI_HISTORY_FILE_SIZE
      || 1000;
    return size | 0;
  }
};
