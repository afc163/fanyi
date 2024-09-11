const coffee = require('coffee');
const path = require('node:path');
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
        `fanyi ~ ${version}
Translate tools in command line
  $ fanyi word
  $ fanyi world peace
  $ fanyi chinglish
`,
      )
      .expect('code', 0)
      .end(done);
  });

  it('should translate word', (done) => {
    sinon.spy(console, 'log');
    nock('http://dict-co.iciba.com').get(/api/).reply(200, data.word.iciba);
    fanyi('word', () => {
      sinon.assert.calledWithMatch(console.log, '', 'n. 单词；话语；诺言；消息；'); // iciba
      done();
    });
  });
});
