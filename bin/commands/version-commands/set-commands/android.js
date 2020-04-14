const path = require('path');
const fs = require('fs');
const setVersion = require('../../../../lib/android/setVersion');
const setVersionSimple = require('../../../../lib/android/setVersionSimple');

exports.command = 'android'
exports.desc = 'Set android version'
exports.builder = function (yargs) {
  return yargs
    .describe('gradlePath', 'Path of your main application build.gradle')
    .default('gradlePath', path.resolve(process.cwd(), './android/app/build.gradle'))
    .normalize('gradlePath')
    .describe('simple', 'Use simple versioning to calculate android version code')
    .boolean('simple')
    .describe('startingVersionCode', 'Any calculated version code is added to this. Useful when switching from an old versioning system')
    .number('startingVersionCode')
    .default('startingVersionCode', 0)
    .global('v');
}
exports.handler = function (argv) {
  return argv.simple ? setVersionSimple(argv) : setVersion(argv);
}
