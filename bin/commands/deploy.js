exports.command = 'deploy <command>'
exports.desc = 'Deploy ios or android binaries to app stores'
exports.builder = function (yargs) {
  return yargs.commandDir('deploy-commands');
}
exports.handler = function (argv) {}
