exports.command = 'set <command>'
exports.desc = 'Set android and ios version numbers'
exports.builder = function (yargs) {
  return yargs
    .commandDir('set-commands')
    .describe('v', 'A semver compliant version number with a build increment')
    .demandOption(['v']);
}
exports.handler = function (argv) {}
