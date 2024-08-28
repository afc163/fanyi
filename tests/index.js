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
    fanyi('word', () => {
      sinon.assert.calledWithMatch(console.log, '', 'n. 单词；话语；诺言；消息；'); // iciba
      done();
    });
  });
});
