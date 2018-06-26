exports.command = 'version <command>'
exports.desc = 'Manage android and ios version numbers'
exports.builder = function (yargs) {
  return yargs.commandDir('version-commands');
}
exports.handler = function (argv) {}
