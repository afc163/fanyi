<div align="center">

# Fānyì (翻译)

A 🇨🇳 and 🇺🇸🇬🇧 translator in your command line, powered by iciba, youdao and LLM.

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]
[![Agent Skill][skill-image]][skill-url]
[![Sponsor][sponsor-image]][sponsor-url]

[npm-image]: http://img.shields.io/npm/v/fanyi.svg?style=flat-square
[npm-url]: http://npmjs.org/package/fanyi
[github-actions-image]: https://github.com/afc163/fanyi/actions/workflows/test.yml/badge.svg
[github-actions-url]: https://github.com/afc163/fanyi/actions/workflows/test.yml
[codecov-image]: https://img.shields.io/codecov/c/github/afc163/fanyi/main.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/afc163/fanyi
[download-image]: https://img.shields.io/npm/dm/fanyi.svg?style=flat-square
[download-url]: https://npmjs.org/package/fanyi
[skill-image]: https://img.shields.io/badge/Agent-Skill-d97757?style=flat-square
[skill-url]: skills/fanyi
[sponsor-image]: https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?style=flat-square&logo=github-sponsors
[sponsor-url]: https://github.com/sponsors/afc163

![](https://github.com/user-attachments/assets/edf0d6f7-a3d1-496d-9422-71522198d61c)

</div>

[fanyi@11.0.0](https://github.com/afc163/fanyi/releases/tag/v11.0.0) 正式发布！这一版**开箱即用、无需任何配置**：内置免费 LLM 代理，装上就能用大模型翻译。同时恢复了有道词典，LLM 结果支持流式语义着色，并新增了让 AI Agent 直接调用 fanyi 的 [Agent Skill](skills/fanyi)。依旧是你命令行中**最简单顺手快捷**的中英文翻译工具。

- 🆓 内置免费 LLM 代理，无需 API Key 即可使用大模型翻译，开箱即用。
- 🌊 LLM 结果流式输出 + 语义着色，边生成边上色，等待时显示实时耗时。
- 📖 恢复有道词典翻译源，与 iciba、LLM 三路结果并列。
- ✨ 全新青紫流光 spinner 与绿色微渐变词义着色，输出更灵动。
- 🤖 新增 [Agent Skill](skills/fanyi)，让 Claude Code 等 AI Agent 自动调用 fanyi 翻译。
- 🔧 支持自定义 LLM：配置 `LLM_API_KEY` / `LLM_API_BASE_URL` / `LLM_MODEL_ID` 接入任意 OpenAI 兼容模型。

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

Translation data is fetched from [iciba.com](https://iciba.com), [youdao.com](https://youdao.com) and an LLM, and only support translation between Chinese and English.

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
$ fanyi config list                                   // list all configuration options
$ fanyi config set iciba false                        // disable iciba globally
$ fanyi config set youdao false                       // disable youdao globally
$ fanyi config set llm false                          // disable llm globally
$ fanyi config set color false                        // disable color globally
$ fanyi config set LLM_API_BASE_URL your-api-base-url // set LLM_API_BASE_URL
$ fanyi config set LLM_API_KEY your-api-key           // set LLM_API_KEY
$ fanyi config set LLM_MODEL_ID your-model-id         // set LLM_MODEL_ID
```

By default fanyi works out of the box with **no configuration** — when no `LLM_API_KEY` is set, it routes LLM translation through a built-in free proxy, so you can use large-model translation immediately after install.

If you set `LLM_API_KEY` but leave `LLM_API_BASE_URL` and `LLM_MODEL_ID` empty, it will call `deepseek-chat` at [DeepSeek's Platform](https://platform.deepseek.com) by default.

If you want to use other LLMs, make sure you have properly set `LLM_API_KEY` `LLM_API_BASE_URL` and `LLM_MODEL_ID`. Also, the api endpoint should be [OpenAi Compatible](https://platform.openai.com/docs/api-reference/chat/create).

## Agent Skill

This repo ships an [Agent Skill](skills/fanyi) so AI agents (Claude Code, Claude.ai, and other tools that support the Agent Skills spec) can call `fanyi` for you automatically — just say "翻译一下 serendipity" or "和谐 用英语怎么说" and the agent runs `fanyi` under the hood, returning the full iciba / youdao / LLM results.

### Install

First make sure the CLI is installed globally so the skill can invoke it (the skill auto-detects your package manager — `bun` / `pnpm` / `yarn` / `cnpm` / `tnpm` / `utoo` / `npm` — and installs it for you when it's missing):

```bash
$ npm i fanyi -g
```

Then install the skill into your agent's skills directory. For Claude Code:

```bash
$ git clone https://github.com/afc163/fanyi.git
$ cp -r fanyi/skills/fanyi ~/.claude/skills/fanyi
```

Other agents: copy `skills/fanyi` into wherever your tool loads skills from.

### Usage

Once installed, the skill triggers on any Chinese ↔ English translation or lookup request, even without naming the tool:

- `翻译一下 serendipity`
- `子非鱼焉知鱼之乐 用英语怎么说`
- `serendipity 是什么意思`

The agent will run `fanyi <word>` and show you the dictionary and LLM results.

## Sponsor

如果 fanyi 对你有帮助，欢迎通过 [GitHub Sponsors](https://github.com/sponsors/afc163) 支持作者持续维护 ❤️


