const { exec, root } = require('../shared');

module.exports = async function build () {
  const start = Date.now();
  console.log('Building APK');
  await exec('cd android && ./gradlew assembleRelease');
  console.log(`APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
}
