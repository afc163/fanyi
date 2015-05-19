var coffee = require('coffee');
var path = require('path');
var version = require('../package').version;

describe('fanyi', function() {
  it('should show help info', function(done) {
    coffee.fork(path.join(__dirname, '../bin/fanyi'))
      .expect('stdout', 'fanyi ~ ' + version + '\nTranslate tools in command line\n  $ fanyi word\n  $ fanyi world peace\n  $ fanyi chinglish\n')
      .expect('code', 0)
      .end(done);
  });

  it('should translate word', function(done) {
    coffee.fork(path.join(__dirname, '../bin/fanyi'), ['word'])
      .expect('stdout', /word  \[ wɜːd \]  ~  fanyi\.youdao\.com/gi)
      .expect('code', 0)
      .end(done);
  });
});

