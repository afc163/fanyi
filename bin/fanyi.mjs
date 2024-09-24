#!/usr/bin/env -S node --no-deprecation

import { readFile } from 'node:fs/promises';
import chalk from 'chalk';
import { Command } from 'commander';
import updateNotifier from 'update-notifier';
import config from '../lib/config.mjs';
import { searchList } from '../lib/searchHistory.mjs';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

updateNotifier({ pkg }).notify();
const program = new Command();

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
  .addCommand(
    new Command('list').description('查看配置项').action(async () => {
      const options = await config.load();
      console.log(`${chalk.gray(config.getConfigPath())}`);
      console.log();
      for (const [key, value] of Object.entries(options)) {
        console.log(`${chalk.cyan(key)}: ${chalk.yellow(value)}`);
      }
    }),
  )
  .addCommand(
    new Command('set')
      .description('设置配置项')
      .argument('<key>', '配置项键名')
      .argument('<value>', '配置项值')
      .action(async (key, value) => {
        const options = {};
        if (key === 'GROQ_API_KEY') {
          options[key] = value;
        } else {
          options[key] = value === 'true' ? true : value === 'false' ? false : value;
        }
        await config.write(options);
      }),
  );

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
  console.log(`${chalk.cyan('  $ ')}fanyi config list`);
  console.log('');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

async function runFY(options = {}) {
  const defaultOptions = await config.load();
  const mergedOptions = { ...defaultOptions, ...options };
  const fanyi = await import('../index.mjs');
  fanyi.default(program.args.join(' '), mergedOptions);
}
