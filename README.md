<div align="center">

# Fānyì (翻译)

A 🇨🇳 and 🇺🇸🇬🇧 translator in your command line, powered by iciba and deepseek.

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]

[npm-image]: http://img.shields.io/npm/v/fanyi.svg?style=flat-square
[npm-url]: http://npmjs.org/package/fanyi
[github-actions-image]: https://github.com/afc163/fanyi/actions/workflows/test.yml/badge.svg
[github-actions-url]: https://github.com/afc163/fanyi/actions/workflows/test.yml
[codecov-image]: https://img.shields.io/codecov/c/github/afc163/fanyi/main.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/afc163/fanyi
[download-image]: https://img.shields.io/npm/dm/fanyi.svg?style=flat-square
[download-url]: https://npmjs.org/package/fanyi

![](https://github.com/user-attachments/assets/edf0d6f7-a3d1-496d-9422-71522198d61c)

</div>

[fanyi@9.0.0](https://github.com/afc163/fanyi/releases/tag/v9.0.0) 正式发布！这一版对原有功能进行了大幅裁剪，移除了速度慢和失效的翻译源，以及对 say 命令的依赖，并引入 deepseek 加持的 llama3 进行翻译，翻译速度一流。代码也做了整体重构，依旧是你命令行中**最简单顺手快捷**的中英文翻译工具。

- 🐑 增加 llama3 翻译结果。
- 🌈 渐变色彩输出，更加灵动浮夸。
- 🗑️ 移除 openai 翻译。
- 🗑️ 移除 youdao 翻译。
- 🗑️ 移除 dictionary 翻译。
- 🗑️ 移除单词发音功能，从而解决 Linux 安装兼容问题。
- 🚀 全局配置方式修改为 `fanyi config set color false` `fanyi config set iciba false`。
- 💄 重构和简化代码，并增加了 lint 和覆盖率的 GitHub Action。

## Install

```bash
$ npm i fanyi -g
```

or

```bash
$ bun i fanyi -g
```

## Usage

```bash
$ fanyi word
```

For short:

```bash
$ fy word
```

Translation data is fetched from [iciba.com](https://iciba.com) and deepseek ai, and only support translation between Chinese and English.

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

A configuration file can be put into `~/.config/fanyi/.fanyirc`, in the user's home directory.

Use subcommand `fanyi config set <key> <value>` to set configuration options.

Example:

```bash
$ fanyi config list                       // list all configuration options
$ fanyi config set iciba false            // disable iciba globally
$ fanyi config set deepseek false             // disable deepseek globally
$ fanyi config set color false            // disable color globally
$ fanyi config set LLM_API_KEY your-api-key // set LLM_API_KEY
```
