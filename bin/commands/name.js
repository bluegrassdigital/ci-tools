exports.command = 'name <command>'
exports.desc = 'Manage android and ios application names'
exports.builder = function (yargs) {
  return yargs.commandDir('name-commands');
}
exports.handler = function (argv) {}
