const iosArgs = require('./ios');
const androidArgs = require('./android');

exports.command = 'all <bundleId>'
exports.desc = 'Set all bundle ids'
exports.builder = function (yargs) {
  return iosArgs.builder(androidArgs.builder(yargs))
}
exports.handler = function (argv) {
  iosArgs.handler(argv);
  androidArgs.handler(argv);
  return;
}
