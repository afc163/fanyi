var coffee = require('coffee');

describe('fanyi', function() {
  it('should show help info', function(done) {
    coffee.spawn('fanyi')
      .expect('stdout', 'fanyi ~ 0.2.5\nTranslate tools in command line\n  $ fanyi word\n  $ fanyi world peace\n  $ fanyi chinglish\n')
      .expect('code', 0)
      .end(done);
  });

  it('should translate word', function(done) {
    coffee.spawn('fanyi', ['word'])
      .expect('stdout', '\n word  [ wɜːd ]  ~  fanyi.youdao.com\n \n - n. [语] 单词；话语；消息；诺言；命令\n - vt. 用言辞表达\n - n. (Word)人名；(英)沃德\n \n 1. word\n    单词,字,词\n 2. Word Formation\n    构词法,造词法,词性转换\n 3. Portmanteau word\n    混成词,紧缩词,混合词\n \n word  英[ wɜ:d ]  美[ wɜ:rd ]  ~  iciba.com\n \n - n. 单词；话语；诺言；消息；\n - vt. 措辞，用词；用言语表达；\n - vi. 讲话；\n \n 1. Using Servers controller to call Word to create templates , which can create Word documents.\n    用Servers控件调用Word能够较好地实现Delphi对Word的控制.\n 2. This file is on the PDF file format into WORD document format.\n    此文件是关于把PDF文件格式转换成WORD文件格式的.\n 3. We WORD file on a comprehensive test.\n    对WORD档我们进行了全方位的测试.\n 4. Runs on Microsoft Word: You do not have to handle several windows on the screen.\n    运行在微软Word中: 你不必在桌面上操作多个窗口.\n 5. Also, make your resume available in several formats -- text only , Microsoft Word a PDF.\n    另外, 要确保你的简历要有几个版本 — 纯文字 、 Word档、PDF档.\n \n')
      .expect('code', 0)
      .end(done);
  });

});

