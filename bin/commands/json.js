exports.command = 'json <command>'
exports.desc = 'Manage json from CLI'
exports.builder = function (yargs) {
  return yargs.commandDir('json-commands');
}
exports.handler = function (argv) {}
