const path = require('path');
const fs = require('fs');
const setVersion = require('../../../../lib/ios/setVersion');

exports.command = 'ios'
exports.desc = 'Set ios version'
exports.builder = function (yargs) {
  return yargs
    .describe('iosSearchPath', 'Directory to search for your applications Info.plist')
    .default('iosSearchPath', path.resolve(process.cwd(), './ios'))
    .normalize('iosSearchPath')
    .global('v');
}
exports.handler = function (argv) {
  return setVersion(argv);
}
