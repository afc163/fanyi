#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const config = require('../lib/config');
const { searchList } = require('../lib/searchHistory');

updateNotifier({ pkg }).notify();

program
  .version(pkg.version)
  .option('-s, --say', 'Turn on the pronunciation')
  .option('-S, --no-say', 'Turn off the pronunciation')
  .action(args => {
    // If the input is "fanyi", no parameters, ignore.
    if (process.argv.length > 2) {
      const { say } = args;
      const options = resolveOptions({ say });
      return runFY(options);
    }
  });

program
  .command('config')
  .description('Set the global options')
  .option('-c, --color', 'Output with color')
  .option('-C, --no-color', 'Output without color')
  .option('-i, --iciba', 'Enable the iciba translation engine')
  .option('-I, --no-iciba', 'Disable the iciba translation engine')
  .option('-y, --youdao', 'Enable the youdao translation engine')
  .option('-Y, --no-youdao', 'Disable the youdao translation engine')
  .option('-d, --dictionaryapi', 'Enable the dictionary translation engine')
  .option('-D, --no-dictionaryapi', 'Disable the dictionary translation engine')
  .option('-s, --say', 'Turn on the pronunciation')
  .option('-S, --no-say', 'Turn off the pronunciation')
  .option('-o, --openai-api-key <apikey>', 'set openai api key')
  .action(args => {
    // hack
    // If the input is "fanyi config", then translate the word config.
    if (process.argv.length === 3) {
      return runFY();
    }
    const { color, iciba, youdao, dictionaryapi, openaiApiKey } = args;
    const { say } = program.opts();
    const options = resolveOptions({ color, iciba, youdao, dictionaryapi, say, openaiApiKey });
    return config.write(options);
  });

program
  .command('list')
  .option('-d, --someDay <char>', '查看指定某天的查询记录')
  .option('-r, --recentDays [number]', '查看最近几天内的数据', 0)
  .option('-all --show-file [boolean]', '查看全部数据，即单词存放的位置', false)
  .action(args => {
    searchList(args);
  });

program.on('--help', function () {
  console.log('');
  console.log(chalk.gray('Examples:'));
  console.log(chalk.cyan('  $ ') + 'fanyi word');
  console.log(chalk.cyan('  $ ') + 'fanyi world peace');
  console.log(chalk.cyan('  $ ') + 'fanyi chinglish');
  console.log('');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

async function runFY(options = {}) {
  const defaultOptions = await config.load();
  const mergedOptions = {...defaultOptions, ...options}
  const fanyi = require('..');
  fanyi(program.args.join(' '), mergedOptions)
}

function resolveOptions(options) {
  const opts = {}
  Object.keys(options)
    .filter(key => isBoolean(options[key]) || typeof options[key] === 'string')
    .map(key => opts[key] = options[key]);
  return opts;
}

function isBoolean(val) {
  return typeof val === 'boolean';
}