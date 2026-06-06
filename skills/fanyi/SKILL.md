---
name: fanyi
description: >-
  使用命令行工具 fanyi(别名 fy)进行中英互译与查词。当用户想翻译一个英文单词、短语或句子成中文,或把中文翻译成英文,或查某个英文单词的释义、音标、例句、相关词、词组时,都用这个 skill。常见触发场景包括:"翻译一下 xxx"、"xxx 是什么意思"、"xxx 用英语怎么说"、"这个词怎么翻"、"帮我查下 serendipity"、"和谐 翻译成英文"。即使用户没有明确说"用 fanyi",只要是中英之间的翻译或查词需求,也应优先使用本 skill,因为它能一次性给出词典(iciba、youdao)和大模型三方结果,比直接口头翻译更准、更全。
---

# fanyi 中英翻译

`fanyi`(短别名 `fy`)是一个命令行中英互译工具。它会同时返回 iciba 词典、youdao 词典和大模型(LLM)三方的翻译结果:词典给出权威释义、音标、词形、相关词、词组和例句,LLM 给出贴合语境的翻译。仅支持中文 ↔ 英文。

## 为什么用它

直接靠模型口头翻译,容易漏掉音标、词性、常用搭配和真实例句,单词的多个义项也容易给得不全。`fanyi` 把词典的结构化数据和大模型的语境翻译合在一起,一条命令就能拿到最完整的结果,所以遇到中英翻译/查词时优先调用它,而不是自己直接翻。

## 用法

核心命令就是把要翻译的内容作为参数传给 `fanyi`:

```bash
fanyi <要翻译的内容>
```

`fy` 是完全等价的短别名,任选其一即可:

```bash
fy <要翻译的内容>
```

**翻译单个英文单词**(会返回释义、音标、相关词、例句):

```bash
fanyi love
```

**翻译短语或多个词**(直接跟在后面,不用引号):

```bash
fanyi make love
fanyi world peace
```

**中译英 / 翻译中文**(单字、词、甚至整句都支持):

```bash
fanyi 和谐
fanyi 子非鱼焉知鱼之乐
```

**含空格或特殊字符的句子**用引号包起来,避免被 shell 拆开:

```bash
fanyi "How are you doing today?"
fanyi "纸上得来终觉浅"
```

## 执行要点

- 运行后直接把工具的完整输出原样展示给用户即可,不需要自己再翻译或改写一遍——工具已经给出了词典三方结果。可以在结尾用一句话点出最贴切的译法。
- 命令会发起网络请求(iciba / youdao / LLM),通常几秒内返回。如果某一源超时或报错,工具仍会输出其他源的结果,属正常现象。
- 不要给参数加多余的转义。一般情况下整句直接跟在命令后即可,只有当内容里带引号、`&`、`|`、`$` 等 shell 特殊字符时才用双引号包裹。

## 查历史记录

用户问"我之前查过哪些词""最近查的单词"时,用 `list` 子命令:

```bash
fanyi list                 # 查看全部历史
fanyi list -r 7            # 查看最近 7 天
fanyi list -d 2026-06-06   # 查看指定某天
```

## 配置(仅在用户主动要求时)

`fanyi` 默认即可用。只有当用户明确想调整时才动配置:

```bash
fanyi config list                              # 查看当前配置
fanyi config set iciba false                   # 关闭 iciba 源
fanyi config set llm false                      # 关闭大模型翻译
fanyi config set color false                    # 关闭彩色输出
fanyi config set LLM_API_KEY <your-key>         # 用自己的大模型 API Key
fanyi config set LLM_API_BASE_URL <your-url>    # 自定义 OpenAI 兼容接口地址
fanyi config set LLM_MODEL_ID <model-id>        # 指定模型 ID
```

配置写入 `~/.config/fanyi/.fanyirc`。

## 前置条件

需要先全局安装 `fanyi`。如果运行命令时提示 `command not found`,提示用户安装:

```bash
npm i fanyi -g
```
