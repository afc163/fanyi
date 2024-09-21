const fs = require('fs-extra');
const path = require('node:path');
const chalk = require('chalk');
const dayjs = require('dayjs');

const homedir = process.env.HOME || require('node:os').homedir();
const searchFilePath = path.resolve(homedir, '.config', 'fanyi', 'searchHistory.txt');

const DAY_SPLIT = 'day-';
const WORD_MEAN_SPLIT = '  ';

const today = dayjs().format('YYYY-MM-DD');

// @return Array<`day+words`>
function getTargetContent(content, startDay, endDay) {
  const endDayValue = endDay || startDay;
  const allDays = content.split(DAY_SPLIT);
  const targetData = allDays
    .map((item) => item.split(':\n'))
    .filter(([day]) => day >= startDay && day <= endDayValue)
    .map(([day, content]) => `${DAY_SPLIT}${day}:\n${content}`);
  return targetData;
}

// 按👇👇👇 格式化
//word
//${WORD_MEAN_SPLIT}n. 单词
//${WORD_MEAN_SPLIT}v. 命名
// 👆👆👆
function genWordMean(word, means) {
  const meansWithSplit = means.join(`\n${WORD_MEAN_SPLIT}`);
  return `${word}\n${WORD_MEAN_SPLIT}${meansWithSplit}\n`;
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
