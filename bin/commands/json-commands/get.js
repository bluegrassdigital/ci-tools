const fs = require('fs');
const { get } = require('lodash');

exports.command = 'get <file> <path>'
exports.desc = 'Get json property value at path'
exports.builder = function (yargs) {
  return yargs;
}
exports.handler = function (argv) {
  const json = JSON.parse(fs.readFileSync(argv.file, 'utf8'));
  const value = get(json, argv.path);
  console.log(value);
}
