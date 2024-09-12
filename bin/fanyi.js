#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const config = require('../lib/config');
const { searchList } = require('../lib/searchHistory');

updateNotifier({ pkg }).notify();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
  .action(() => {
    // 如果输入是 "fanyi"，没有参数，则忽略
    if (process.argv.length > 2) {
      return runFY();
    }
  });

program
  .command('config')
  .description('设置全局选项')
  .command('set <key> <value>')
  .description('设置配置项')
  .action(async (key, value) => {
    const options = {};
    if (key === 'GROQ_API_KEY') {
      options[key] = value;
    } else {
      options[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
    await config.write(options);
    console.log(`已设置 ${key} 为 ${value}`);
  });

program
  .command('list')
  .option('-d, --someDay <char>', '查看指定某天的查询记录')
  .option('-r, --recentDays [number]', '查看最近几天内的数据', 0)
  .option('-all --show-file [boolean]', '查看全部数据，即单词存放的位置', false)
  .action((args) => {
    searchList(args);
  });

program.on('--help', () => {
  console.log('');
  console.log(chalk.gray('示例:'));
  console.log(`${chalk.cyan('  $ ')}fanyi word`);
  console.log(`${chalk.cyan('  $ ')}fanyi world peace`);
  console.log(`${chalk.cyan('  $ ')}fanyi chinglish`);
  console.log(`${chalk.cyan('  $ ')}fanyi config set color true`);
  console.log(`${chalk.cyan('  $ ')}fanyi config set iciba true`);
  console.log(`${chalk.cyan('  $ ')}fanyi config set groq true`);
  console.log(`${chalk.cyan('  $ ')}fanyi config set GROQ_API_KEY your_api_key_here`);
  console.log('');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

async function runFY(options = {}) {
  const defaultOptions = await config.load();
  const mergedOptions = { ...defaultOptions, ...options };
  const fanyi = require('..');
  fanyi(program.args.join(' '), mergedOptions);
}

function resolveOptions(options) {
  const opts = {};
  const filteredKeys = Object.keys(options).filter(
    (key) => isBoolean(options[key]) || typeof options[key] === 'string',
  );
  for (const key of filteredKeys) {
    opts[key] = options[key];
  }
  return opts;
}

function isBoolean(val) {
  return typeof val === 'boolean';
}
