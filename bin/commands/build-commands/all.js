const iosArgs = require('./ios');
const androidArgs = require('./android');

exports.command = 'all'
exports.desc = 'Build all platforms'
exports.builder = function (yargs) {
  return iosArgs.builder(androidArgs.builder(yargs))
}
exports.handler = function (argv) {
  return Promise.all([iosArgs.handler(argv), androidArgs.handler(argv)]);
}
