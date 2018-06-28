const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = async function build (argv) {
  const { androidSearchPath, gradleFlags, experimental } = argv;
  const start = Date.now();
  console.log('Android: Building APK using command:');
  let command;
  if (experimental) {
    command = `${androidSearchPath}/gradlew app:bundleReleaseJSAndAssets --parallel --daemon && ${androidSearchPath}/gradlew assembleRelease --configure-on-demand --parallel --daemon${gradleFlags ? ` ${gradleFlags}` : ''}`
  } else {
    command = `${androidSearchPath}/gradlew assembleRelease --daemon${gradleFlags ? ` ${gradleFlags}` : ''}`
  }
  console.log(command)
  await execPromise(command, {
    cwd: path.resolve(androidSearchPath),
  });
  console.log(`Android: APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
}
