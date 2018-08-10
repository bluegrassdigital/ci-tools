exports.command = 'bundleid <command>'
exports.desc = 'Manage android and ios bundle ids'
exports.builder = function (yargs) {
  return yargs.commandDir('bundleid-commands');
}
exports.handler = function (argv) {}
