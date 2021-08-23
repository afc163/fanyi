const homedir = process.env.HOME || require('os').homedir();
const path = require('path');
const fs = require('fs');
const configDir = path.resolve(homedir, '.config', 'fanyi');
const configPath = path.resolve(configDir, '.fanyirc');

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
    const content = JSON.stringify(mergedOptions);
    fs.existsSync(configDir) || fs.mkdirSync(configDir, { recursive: true });
    return fs.writeFileSync(path, content);
  },
};

module.exports = config;
