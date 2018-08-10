const iosArgs = require('./ios');
const androidArgs = require('./android');

exports.command = 'all <name>'
exports.desc = 'Set all names'
exports.builder = function (yargs) {
  return iosArgs.builder(androidArgs.builder(yargs))
}
exports.handler = function (argv) {
  iosArgs.handler(argv);
  androidArgs.handler(argv);
  return;
}
