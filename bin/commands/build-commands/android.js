const path = require('path');
const fs = require('fs');
const build = require('../../../lib/android/build');

exports.command = 'android'
exports.desc = 'Build android project'
exports.builder = function (yargs) {
  const defaultSearchPath = path.resolve(process.cwd(), './android');
  const exists = fs.existsSync(path.resolve(defaultSearchPath, './gradlew'));
  const extraDefaults = {};
  const extraDemands = [];

  if (exists && defaultSearchPath) {
    extraDefaults.androidSearchPath = defaultSearchPath;
  } else {
    extraDemands.push('androidSearchPath');
  }

  return yargs
    .describe('androidSearchPath', 'Directory to search in for android gradle')
    .check(argv => {
      const checkExists = fs.existsSync(path.resolve(argv.androidSearchPath, './gradlew'))
      if (!checkExists) throw new Error('No gradlew file found at that path');
      return true
    })
    .default(extraDefaults)
    .demandOption([...extraDemands])
}
exports.handler = function (argv) {
  return build(argv);
}
