const homedir = process.env.HOME || require('node:os').homedir();
const path = require('node:path');
const fs = require('node:fs');
const chalk = require('chalk');
const configDir = path.resolve(homedir, '.config', 'fanyi');
const configPath = path.resolve(configDir, '.fanyirc');

// 初始化一个带颜色的 chalk 实例
const chalkInstance = new chalk.Instance({ level: 3 });

const config = {
  async load(path = configPath) {
    const emptyObj = {};
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      const content = fs.readFileSync(path, 'utf-8');
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
    fs.existsSync(configDir) || fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path, content);
    console.log(
      `${chalkInstance.bgGreen(JSON.stringify(options))} config saved at ${chalkInstance.gray(path)}:`,
    );
    console.log();
    console.log(chalkInstance.greenBright(content));
  },
};

module.exports = config;
