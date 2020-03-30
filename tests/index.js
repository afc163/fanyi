const coffee = require('coffee');
const path = require('path');
const sinon = require('sinon');
const fanyi = require('../');
const nock = require('nock');
const data = require('./data');
const { version } = require('../package');

describe('fanyi', () => {
  it('should show help info in terminal', (done) => {
    coffee
      .fork(path.join(__dirname, '../bin/fanyi'))
      .expect(
        'stdout',
        'fanyi ~ ' +
          version +
          '\nTranslate tools in command line\n  $ fanyi word\n  $ fanyi world peace\n  $ fanyi chinglish\n',
      )
      .expect('code', 0)
      .end(done);
  });

  it('should translate word', (done) => {
    sinon.spy(console, 'log');
    nock('http://dict-co.iciba.com').get(/api/).reply(200, data['word'].iciba);
    nock('http://fanyi.youdao.com')
      .get(/openapi\.do/)
      .reply(200, data['word'].youdao);
    nock('http://www.dictionaryapi.com').get(/api/).reply(200, data['word'].dictionaryapi);
    fanyi('word', () => {
      sinon.assert.calledWithMatch(console.log, '', 'n. 单词；话语；诺言；消息；'); // iciba
      sinon.assert.calledWithMatch(console.log, '', 'n. [语] 单词；话语；消息；诺言；命令'); // youdao
      sinon.assert.calledWithMatch(console.log, '', 'something that is said'); // dictionaryapi
      done();
    });
  });
});
