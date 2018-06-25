const playup = require('playup');
const fs = require('fs');
const glob = require('glob');
const { promisify } = require('util');

const globPromise = promisify(glob);

const { DEPLOYMENT_JSON, APK_FOLDER } = process.env;

module.exports = async function deploy () {
  const jsonFile = fs.readFileSync(DEPLOYMENT_JSON, 'utf8');
  if (!jsonFile) throw new Error('No deployment key');
  const key = JSON.parse(jsonFile);

  const publisher = playup(key);

  const apkFolder = APK_FOLDER || `${process.cwd()}/android/app/build/outputs/apk`

  const files = await globPromise(`${apkFolder}/!(*-unsigned).apk`);
  if (!files || !files.length) throw new Error('No apks');
  console.dir(files)
  await publisher.upload(files, {
    recentChanges: {},
    track: 'alpha',
  });
  console.log('Upload complete');
}
