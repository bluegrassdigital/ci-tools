exports.command = 'build <command>'
exports.desc = 'Build ios or android platforms'
exports.builder = function (yargs) {
  return yargs.commandDir('build-commands');
}
exports.handler = function (argv) {}
