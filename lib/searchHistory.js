const fs = require('fs-extra');
const path = require('node:path');
const chalk = require('chalk');
const dayjs = require('dayjs');

const homedir = process.env.HOME || require('node:os').homedir();
const searchFilePath = path.resolve(homedir, '.config', 'fanyi', 'searchHistroy.txt');

const DAY_SPLIT = 'day-';
const WORD_MEAN_SPLIT = '  ';

const today = dayjs().format('YYYY-MM-DD');

// @return Array<`day+words`>
/**
* Extract content between specified start and end days
* @example
* getTargetContent("2023-01-01:\ncontent1\n2023-01-02:\ncontent2", "2023-01-01", "2023-01-02")
* ["2023-01-01:\ncontent1", "2023-01-02:\ncontent2"]
* @param {string} content - The string containing dated content sections.
* @param {string} startDay - The starting day to search for content, in 'YYYY-MM-DD' format.
* @param {string} [endDay] - The optional ending day to search for content, in 'YYYY-MM-DD' format. Defaults to startDay if not provided.
* @returns {string[]} An array of strings containing the content for each day within the specified date range.
* @description
*   - End day is optional, and if not provided, the function will return content for the start day only.
*   - The function assumes the content is divided into sections by a split marker not shown in the function (DAY_SPLIT).
*   - Each section of content begins with the date in 'YYYY-MM-DD:' format followed by a newline character and the content itself.
*/
function getTargetContent(content, startDay, endDay) {
  // 无结束日期，则为查指定日期
  const endDayValue = endDay || startDay;
  const allDays = content.split(DAY_SPLIT);
  const targetData = [];
  for (const item of allDays) {
    if (item.length) {
      const [day] = item.split(':\n');
      if (day >= startDay && day <= endDayValue) {
        targetData.push(item);
      }
    }
  }
  return targetData;
}

// 按👇👇👇 格式化
//word
//${WORD_MEAN_SPLIT}n. 单词
//${WORD_MEAN_SPLIT}v. 命名
// 👆👆👆
function genWordMean(word, means) {
  return `${word}\n${WORD_MEAN_SPLIT}${means.join(`\n${WORD_MEAN_SPLIT}`)}\n`;
}

function getDaySplit(someDay) {
  return `${DAY_SPLIT}${someDay}:`;
}

exports.searchList = (args) => {
  const { someDay, recentDays, showFile } = args;
  console.log();
  console.log(chalk.gray('fanyi history:'));
  console.log();
  let targetContent;
  // 与配置放在一起
  fs.ensureFileSync(searchFilePath);
  const data = fs.readFileSync(searchFilePath);
  const content = data.toString();
  let targetDay = dayjs(someDay).format('YYYY-MM-DD');

  // 查询参数的优先级
  // showFile > recentDays > someDay > today
  if (showFile) {
    console.log('The search history save in: ', chalk.gray(searchFilePath));
    return;
  }

  if (recentDays) {
    targetDay = dayjs()
      .add(-1 * recentDays, 'day')
      .format('YYYY-MM-DD');
    targetContent = getTargetContent(
      content,
      targetDay,
      dayjs(today).add(1, 'day').format('YYYY-MM-DD'),
    );
  }

  if (!targetContent && someDay) {
    targetDay = dayjs(someDay).format('YYYY-MM-DD');
    targetContent = getTargetContent(content, targetDay);
  }

  // 查询当天
  if (!targetContent) {
    targetDay = dayjs().format('YYYY-MM-DD');
    targetContent = getTargetContent(content, targetDay);
  }

  // 👇 开始打印
  if (recentDays) {
    console.log(chalk.gray(`${recentDays ? 'from ' : ''}${targetDay} search list: `));
  }
  const isWordMeanReg = new RegExp(`^${WORD_MEAN_SPLIT}`);
  // 按日期打印
  for (const item of targetContent) {
    const [day, searchList] = item.split(':\n');
    console.log(day);
    if (searchList) {
      const wordAndMeans = searchList.split('\n');
      for (const w of wordAndMeans) {
        if (isWordMeanReg.test(w)) {
          console.log(WORD_MEAN_SPLIT, chalk.green(w));
        } else {
          console.log(WORD_MEAN_SPLIT, chalk.yellow(w));
        }
      }
    }
  }
};

exports.saveHistory = (word, means) => {
  try {
    fs.ensureFileSync(searchFilePath);

    const contentBuffer = fs.readFileSync(searchFilePath);
    const content = contentBuffer.toString();
    if (content.includes(today)) {
      const targetContent = getTargetContent(content, today);
      // 去重。当天已经查过的，不再写入
      if (targetContent[0].includes(`${word}\n`)) {
        return;
      }
      fs.writeFile(searchFilePath, genWordMean(word, means), { flag: 'a' }, (err) => {
        if (err) throw err;
      });
    } else {
      fs.writeFile(
        searchFilePath,
        `${getDaySplit(today)}\n${genWordMean(word, means)}\n`,
        { flag: 'a' },
        (err) => {
          if (err) throw err;
        },
      );
    }
  } catch (err) {
    console.log('save with error: ', err);
  }
};
