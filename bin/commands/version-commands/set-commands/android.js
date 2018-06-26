const path = require('path');
const fs = require('fs');
const setVersion = require('../../../../lib/android/setVersion');

exports.command = 'android'
exports.desc = 'Set android version'
exports.builder = function (yargs) {
  return yargs
    .describe('gradlePath', 'Path of your main application build.gradle')
    .default('gradlePath', path.resolve(process.cwd(), './android/app/build.gradle'))
    .normalize('gradlePath')
    .global('v');
}
exports.handler = function (argv) {
  return setVersion(argv);
}
