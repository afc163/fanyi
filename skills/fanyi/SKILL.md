---
name: fanyi
description: >-
  用命令行工具 fanyi(别名 fy)做中英互译与查词,一次返回词典(iciba、youdao)和大模型三方结果。适用于单词、短语、习语谚语、单句短句的中英翻译,以及查释义、音标、例句、相关词。触发场景如"翻译一下 xxx"、"xxx 是什么意思"、"xxx 用英语怎么说"、"和谐 翻译成英文"——即使没说"用 fanyi"也应优先用本 skill,比口头翻译更准更全。不适用:长句、段落、整篇文章等长文本翻译(改由模型直接翻),以及非中英语言、文案润色、写代码等需求。
---

# fanyi 中英翻译

`fanyi`(短别名 `fy`)是一个命令行中英互译工具。它会同时返回 iciba 词典、youdao 词典和大模型(LLM)三方的翻译结果:词典给出权威释义、音标、词形、相关词、词组和例句,LLM 给出贴合语境的翻译。仅支持中文 ↔ 英文。

## 适用范围

**适合**:单词、短语、习语谚语、单句短句的中英互译与查词。这类内容词典能给出结构化释义,放进命令行参数也自然。

**不适合**:长句、整段落、整篇文章、文档的翻译。原因有两点——一是这种长文本作为命令行参数既笨拙又容易被 shell 拆坏;二是 `fanyi` 的输出是按"查词/短句"组织的(音标、词性、例句那一套),长文反而读起来累赘。遇到长文本翻译,直接由模型自己翻更合适,不要套用本 skill。一个简单的判断:如果内容超过一句话、或明显是要"通顺译完一段",就别用 fanyi。

## 为什么用它

直接靠模型口头翻译,容易漏掉音标、词性、常用搭配和真实例句,单词的多个义项也容易给得不全。`fanyi` 把词典的结构化数据和大模型的语境翻译合在一起,一条命令就能拿到最完整的结果,所以遇到中英查词/短句翻译时优先调用它,而不是自己直接翻。

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

## 前置条件:确保 fanyi 已安装

运行翻译命令前,先确认 `fanyi` 可用(例如 `command -v fanyi`)。如果提示 `command not found`,**直接帮用户装上**,不要只丢一条命令让用户自己敲。

安装步骤:

1. **探测用户机器上有哪些包管理器**,按下面顺序取第一个可用的即可(它们大多兼容 npm 的全局安装语义):

   ```bash
   for pm in bun pnpm yarn cnpm tnpm utoo npm; do
     command -v "$pm" >/dev/null 2>&1 && echo "$pm"
   done
   ```

2. **用探测到的包管理器全局安装**,各工具的全局安装命令:

   | 包管理器 | 安装命令 |
   | --- | --- |
   | bun | `bun add -g fanyi` |
   | pnpm | `pnpm add -g fanyi` |
   | yarn | `yarn global add fanyi` |
   | cnpm | `cnpm i fanyi -g` |
   | tnpm | `tnpm i fanyi -g` |
   | utoo | `utoo i fanyi -g`(或 `utoo add -g fanyi`) |
   | npm | `npm i fanyi -g` |

   优先选 bun / pnpm(更快);都没有就回退到 npm。装完再跑一次翻译命令即可。

为什么这样做:用户的本意是想翻译,卡在"没装工具"这一步上很扫兴。帮他用现成的包管理器一键装好、然后立刻给出翻译结果,体验最顺。注意全局安装在某些环境(如系统 Node)可能需要权限,若报 `EACCES` 之类的权限错误,再把命令和 `sudo` 提示交给用户判断,不要擅自加 `sudo` 执行。

