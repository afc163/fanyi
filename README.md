<div align="center">

# Fanyi

A 🇨🇳 and 🇺🇸🇬🇧 translate tool in your command line, powered by youdao/iciba/ChatGPT.

[![NPM version](https://img.shields.io/npm/v/fanyi.svg?style=flat-square)](https://npmjs.org/package/fanyi) [![NPM downloads](http://img.shields.io/npm/dm/fanyi.svg?style=flat-square)](https://npmjs.org/package/fanyi)

![](https://gw.alipayobjects.com/zos/rmsportal/EAuwmtfxDGueGOdUgVKc.png)

</div>

## Install

```bash
$ npm install fanyi -g
```

## Usage

```bash
$ fanyi word
```

For short:

```bash
$ fy word
```

Translation data is fetched from [iciba.com](https://iciba.com) and [fanyi.youdao.com](https://fanyi.youdao.com), and only support translation between Chinese and English.

In Mac/Linux bash, words will be pronounced by `say` command.

Translate one word.

```bash
$ fanyi love
```

```js
 love  [ lʌv ]  ~  fanyi.youdao.com

 - n. 恋爱；亲爱的；酷爱；喜爱的事物；爱情，爱意；疼爱；热爱；爱人，所爱之物
 - v. 爱，热爱；爱戴；赞美，称赞；喜爱；喜好；喜欢；爱慕
 - n. （英）洛夫（人名）

 1. Love
    爱,爱情,恋爱
 2. Endless Love
    无尽的爱,不了情,蓝色生死恋
 3. puppy love
    早恋,青春期恋爱,初恋

 love [ lʌv ] [ lʌv ]  ~  iciba.com

 - vt.&vi. 爱，热爱；爱戴；喜欢；赞美，称赞；
 - vt. 喜爱；喜好；喜欢；爱慕；
 - n. 爱情，爱意；疼爱；热爱；爱人，所爱之物；

 1. They happily reflect the desire for a fusional love that inspired the legendary LOVE bracelet Cartier.
    快乐地反映出为富有传奇色彩的卡地亚LOVE手镯所赋予的水乳交融之爱恋情愫。
 2. Love is the radical of lovely, loveliness, and loving.
    Love是lovely,loveliness及loving的词根。
 3. She rhymes"love"with"dove".
    她将"love"与"dove"两字押韵。
 4. In sports, love means nil.
    体育中，love的意思是零。
 5. Ludde Omholt with his son, Love, in S?derma a bohemian and culturally rich district in Stockholm.
    LuddeOmholt和他的儿子Love在南城——斯德哥尔摩市的一个充满波西米亚风情的文化富饶区散步。
```

More words.

```bash
$ fanyi make love
```

Support Chinese, even sentence.

```bash
$ fanyi 和谐
```

```bash
$ fanyi 子非鱼焉知鱼之乐
```

```bash
$ fanyi list
```

Also, you can use `list` command to see the history of your search.

```js
2022-08-17
   test
     n. 试验；考验；测验；化验；
     vt. 测验；考查；考验；勘探；
     vi. 受试验；受测验；受考验；测得结果；
```

## Configuration

A configuration file can be put into ~/.config/fanyi/.fanyirc, in the user's home directory

Use subcommand `fanyi config [options]`

Example:

```bash
# Turn off the pronunciation
$ fanyi config --no-say
# or
$ fanyi config -S

# Disable the dictionaryapi
$ fanyi config --no-dictionaryapi
# or
$ fanyi config -D
```

A sample `~/.config/fanyi/.fanyirc` file:

```json
{
  "iciba": true,
  "youdao": true,
  "dictionaryapi": false,
  "say": false,
  "color": true,
  "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY"
}
```

## Enable ChatGPT 🚀

Set an [OpenAI API key](https://platform.openai.com/overview) to enable ChatGPT translation.

```bash
$ fanyi config --openai-api-key sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

![image](https://user-images.githubusercontent.com/507615/225946548-8d912643-9f81-401e-abdd-ba5b54912ea4.png)

Turn off ChatGPT translation.

```bash
$ fanyi config --openai-api-key false
```

If we get this error:

> Cannot reach OpenAI api, please check network

We need to ensure that the proxy and $http_proxy is correctly set.

For example(for clash X):

```bash
$ export http_proxy=http://127.0.0.1:7890
```

## Error: spawn festival ENOENT

Try this workaround from [say.js](https://github.com/Marak/say.js#linux-notes) in Linux.

```
sudo apt-get install festival festvox-kallpc16k
```
