const path = require('path');
const fs = require('fs');
const setVersion = require('../../../../lib/ios/setName');

exports.command = 'ios <name>'
exports.desc = 'Set ios name'
exports.builder = function (yargs) {
  return yargs
    .describe('iosSearchPath', 'Directory to search for your applications Info.plist')
    .default('iosSearchPath', path.resolve(process.cwd(), './ios'))
    .normalize('iosSearchPath');
}
exports.handler = function (argv) {
  return setVersion(argv);
}
