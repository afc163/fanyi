import { homedir } from 'node:os';
import path from 'node:path';
import { existsSync, statSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import chalk from 'chalk';

const configDir = path.resolve(homedir, '.config', 'fanyi');
const configPath = path.resolve(configDir, '.fanyirc');

// 初始化一个带颜色的 chalk 实例
const chalkInstance = new chalk.Instance({ level: 3 });

const config = {
  async load(path = configPath) {
    const emptyObj = {};
    if (existsSync(path) && statSync(path).isFile()) {
      const content = readFileSync(path, 'utf-8');
      try {
        return JSON.parse(content.toString());
      } catch (e) {
        return emptyObj;
      }
    } else {
      return emptyObj;
    }
  },
  async write(options = {}, path = configPath) {
    const defaultOptions = await config.load(path);
    const mergedOptions = { ...defaultOptions, ...options };
    const content = JSON.stringify(mergedOptions, null, 2);
    existsSync(configDir) || mkdirSync(configDir, { recursive: true });
    writeFileSync(path, content);
    console.log(
      `${chalkInstance.bgGreen(JSON.stringify(options))} config saved at ${chalkInstance.gray(path)}:`,
    );
    for (const [key, value] of Object.entries(options)) {
      console.log(`${chalk.cyan(key)}: ${chalk.yellow(value)}`);
    }
  },
  getConfigPath() {
    return configPath;
  },
};

export default config;
