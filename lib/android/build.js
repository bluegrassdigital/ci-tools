const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = async function build (argv) {
  const { androidSearchPath, gradleFlags } = argv;
  const start = Date.now();
  console.log('Android: Building APK using command:');
  const command = `${androidSearchPath}/gradlew assembleRelease --daemon${gradleFlags ? ` ${gradleFlags}` : ''}`
  console.log(command)
  await execPromise(command, {
    cwd: path.resolve(androidSearchPath),
  });
  console.log(`Android: APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
}
