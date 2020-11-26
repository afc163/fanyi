const homedir = process.env.HOME || require('os').homedir();
const path = require('path');
const fs = require('fs');
const configPath = path.resolve(homedir, '.fanyirc');

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
    return fs.writeFileSync(path, content);
  },
};

module.exports = config;
