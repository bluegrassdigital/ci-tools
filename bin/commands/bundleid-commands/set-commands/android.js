const path = require('path');
const fs = require('fs');
const setBundleId = require('../../../../lib/android/setBundleId');

exports.command = 'android <bundleId>'
exports.desc = 'Set android bundle ID'
exports.builder = function (yargs) {
  return yargs
    .describe('androidSearchPath', 'Directory to search in for android gradle')
    .default('androidSearchPath', path.resolve(process.cwd(), './android'))
    .normalize('androidSearchPath');
}
exports.handler = function (argv) {
  return setBundleId(argv);
}
