exports.command = 'set <command>'
exports.desc = 'Set android and ios app display names'
exports.builder = function (yargs) {
  return yargs
    .commandDir('set-commands');
}
exports.handler = function (argv) {}
