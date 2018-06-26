const path = require('path');
const deploy = require('../../../lib/ios/deploy');
const getProjectTempFolder = require('../../../lib/util/getProjectTempFolder');

exports.command = 'ios'
exports.desc = 'Deploy ios binary'
exports.builder = function (yargs) {
  return yargs
    .describe('ipaPath', 'Directory containing ipa file for upload')
    .default('ipaPath', path.resolve(getProjectTempFolder(), 'ios/archive'))
    .normalize('ipaPath')
    .describe('username', 'Apple deploy username')
    .describe('password', 'Apple deploy password')
    .demandOption(['username', 'password'])
}
exports.handler = function (argv) {
  return deploy(argv);
}
