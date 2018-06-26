const playup = require('playup');
const glob = require('glob');
const { promisify } = require('util');

const globPromise = promisify(glob);

module.exports = async function deploy (argv) {
  const { deploymentKey, apkPath } = argv;
  const publisher = playup(deploymentKey);

  const files = await globPromise(`${apkPath}/!(*-unsigned).apk`);
  if (!files || !files.length) throw new Error('Android: No apks to upload');
  await publisher.upload(files, {
    recentChanges: {},
    track: 'alpha',
  });
  console.log('Android: upload complete');
  console.log(`Android: ${files.join(', ')} uploaded`);
}
