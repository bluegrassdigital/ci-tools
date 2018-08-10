exports.command = 'set <command>'
exports.desc = 'Set android and ios bundle ids'
exports.builder = function (yargs) {
  return yargs
    .commandDir('set-commands');
}
exports.handler = function (argv) {}
