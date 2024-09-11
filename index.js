const needle = require("needle");
const chalk = require("chalk");
const SOURCE = require("./lib/source");
const print = require("./lib/print");
const Entities = require("html-entities").AllHtmlEntities;
const entities = new Entities();
const parseString = require("xml2js").parseString;
const isChinese = require("is-chinese");
const ora = require("ora");

module.exports = (word, options, callback) => {
	console.log("");
	const { iciba } = options;
	const requestCounts = [iciba].filter(isTrueOrUndefined).length;
	const spinner = ora().start();

	let count = 0;
	const callbackAll = () => {
		count += 1;
		if (count >= requestCounts) {
			spinner.stop();
			spinner.clear();
			callback?.();
		}
	};

	const endcodedWord = encodeURIComponent(word);

	// iciba
	isTrueOrUndefined(iciba) &&
		needle.get(
			SOURCE.iciba.replace("${word}", endcodedWord),
			{ parse: false },
			(error, response) => {
				if (error) {
					console.log(chalk.yellow("访问 iciba 失败，请检查网络"));
				} else if (response.statusCode === 200) {
					parseString(response.body, (err, result) => {
						if (err) {
							return;
						}
						print.iciba(result.dict, options);
					});
				}
				callbackAll();
			},
		);
};

function isTrueOrUndefined(val) {
	return val === true || val === undefined;
}
