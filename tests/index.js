var coffee = require('coffee');
var version = require('../package').version;
console.log(version);

describe('fanyi', function() {
  it('should show help info', function(done) {
    coffee.spawn('fanyi')
      .expect('stdout', 'fanyi ~ ' + version + '\nTranslate tools in command line\n  $ fanyi word\n  $ fanyi world peace\n  $ fanyi chinglish\n')
      .expect('code', 0)
      .end(done);
  });

  it('should translate word', function(done) {
    coffee.spawn('fanyi', ['word'])
      .expect('code', 0)
      .end(done);
  });
});

