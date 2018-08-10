const path = require('path');
const fs = require('fs');
const deploy = require('../../../lib/android/deploy');

exports.command = 'android'
exports.desc = 'Deploy android binary'
exports.builder = function (yargs) {
  return yargs
    .describe('apkPath', 'Directory to search in for signed android apks to deploy')
    .default('apkPath', `${process.cwd()}/android/app/build/outputs/apk`)
    .normalize('apkPath')
    .describe('deploymentKey', 'Path to your google play service account deployment json key')
    .coerce('deploymentKey', function (arg) {
      return JSON.parse(fs.readFileSync(arg, 'utf8'))
    })
    .demandOption(['deploymentKey'])
}
exports.handler = function (argv) {
  return deploy(argv);
}
