# Fanyi

[![NPM version](https://img.shields.io/npm/v/fanyi.svg?style=flat)](https://npmjs.org/package/fanyi)
[![Build Status](https://img.shields.io/travis/afc163/fanyi.svg?style=flat)](https://travis-ci.org/afc163/fanyi)
[![David Status](https://img.shields.io/david/afc163/fanyi.svg?style=flat)](https://david-dm.org/afc163/fanyi)
[![NPM downloads](http://img.shields.io/npm/dm/fanyi.svg?style=flat)](https://npmjs.org/package/fanyi)
[![Beerpay](https://beerpay.io/afc163/fanyi/badge.svg)](https://beerpay.io/afc163/fanyi)
[![Code Sponsor](https://app.codesponsor.io/embed/ZNMHk5c6iQhad7FH54X8PxG6/afc163/fanyi.svg)](https://app.codesponsor.io/link/ZNMHk5c6iQhad7FH54X8PxG6/afc163/fanyi)

A translate tool in your command line.

![](https://t.alipayobjects.com/images/T1h_JfXkXhXXXXXXXX.png)

---

## Install

```bash
$ npm install fanyi -g
```

## Usage

```bash
$ [fy|fanyi] word
```

Translation data is fetched from [iciba.com](http://iciba.com) and [fanyi.youdao.com](http://fanyi.youdao.com),
and only support translation between Chinese and English.

In Mac/Linux bash, words will be pronounced  by `say` command.

Translate one word.

```bash
$ fanyi love
```

```
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

## LICENSE

MIT.
