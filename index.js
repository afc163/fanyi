const needle = require('needle');
const { Groq } = require('groq-sdk');
const print = require('./lib/print');
const parseString = require('xml2js').parseString;
const ora = require('ora');

module.exports = async (word, options) => {
  console.log('');
  const { iciba, groq, GROQ_API_KEY } = options;
  const endcodedWord = encodeURIComponent(word);

  // iciba
  if (isTrueOrUndefined(iciba)) {
    const ICIBA_URL =
      'http://dict-co.iciba.com/api/dictionary.php?key=D191EBD014295E913574E1EAF8E06666&w=';
    const spinner = ora('正在查询 iciba...').start();
    try {
      const response = await needle('get', `${ICIBA_URL}${endcodedWord}`, { parse: false });
      if (response.statusCode === 200) {
        const result = await new Promise((resolve, reject) => {
          parseString(response.body, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        spinner.stop();
        print.iciba(result.dict, options);
      }
    } catch (error) {
      spinner.fail('访问 iciba 失败，请检查网络');
    }
  }

  // groq ai
  if (isTrueOrUndefined(groq)) {
    const groqClient = new Groq({
      apiKey: GROQ_API_KEY,
    });
    const model = 'llama3-groq-70b-8192-tool-use-preview';

    const spinner = ora('正在查询 Groq AI...').start();
    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `
            你是一本中英文双语辞典，请按照词典专业格式进行翻译，并提供中英文例句，风格简洁专业。
            如果输入是英文，请翻译成中文。如果输入是中文，请翻译成对应的英文。
            如果有多个词义则按顺序输出，每个词义之间用 - 分割并换行。
            如果有多个例句则按顺序输出，每个例句之间用 - 分割并换行。

            请按以下格式输出，词义和列句数量按需输出即可：

            [原词本身] [原词本身的音标或拼音] ~ [对应的翻译] [翻译的音标或拼音]
            
            - [词性简写] [词义]
            - [词性简写] [词义]

            1. [例句]
               [例句翻译]
            2. [例句]
               [例句翻译]
            3. [例句三]
               [例句翻译]

            ---

            以下是 love 的示例翻译：

love [lʌv] ~ 爱 [ài]

- vt.& vi. 爱，热爱；爱戴；喜欢；赞美，称赞；
- vt. 喜爱；喜好；喜欢；爱慕；
- n. 爱情，爱意；疼爱；热爱；爱人，所爱之物；

1. Love is the radical of lovely , loveliness , and loving.
   Love是lovely, loveliness 及loving的词根.
2. She rhymes " love " with " dove ".
   她将 " love " 与 " dove " 两字押韵.
3. In sports, love means nil.
   体育中, love的意思是零.
4. It's been years since any hazardous - waste site as dramatic as Love Canal has been discovered.
   自Love运河中发现触目惊心的危险废料堆放场所以来,已过去多年.
5. Is love, love, love oaths , evanescent love, absolutely love, love always can not escape this rule.
   是爱,示爱, 誓爱, 逝爱, 绝爱, 爱情始终逃不过这个规律.

            以下是 word 的示例翻译：

word  英[ wɜ:d ]  美[ wɜrd ]  ~  llama3

- n. 单词；话语；诺言；消息；
- vt. 措辞，用词；用言语表达；
- vi. 讲话；

1. Using Servers controller to call Word to create templates , which can create Word documents.
   用Servers控件调用Word能够较好地实现Delphi对Word的控制.
2. This file is on the PDF file format into WORD document format.
   此文件是关于把PDF文件格式转换成WORD文件格式的.
3. Runs on Microsoft Word: You do not have to handle several windows on the screen.
   运行在微软Word中: 你不必在桌面上操作多个窗口.
4. Also, make your resume available in several formats -- text only , Microsoft Word a PDF.
   另外, 要确保你的简历要有几个版本 — 纯文字 、 Word档、PDF档.
5. The Word dialog box for administering COM - add - ins will be shown.
   将显示Word的COM 插件 管理对话框.
            `,
          },
          {
            role: 'user',
            content: `请翻译：${word}`,
          },
        ],
        model,
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 0.65,
        stream: true,
        stop: null,
      });
      spinner.stop();
      for await (const chunk of chatCompletion) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
      }
    } catch (error) {
      spinner.fail('访问 Groq AI 失败，请检查网络或 API 密钥');
    }
  }
};

function isTrueOrUndefined(val) {
  return val === true || val === undefined;
}
