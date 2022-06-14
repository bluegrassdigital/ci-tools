const glob = require('glob');
const fs = require('fs');
const { copy, remove, move } = require('fs-extra');
const replace = require('replace-in-file');
const { promisify } = require('util');
const getProjectTempFolder = require('../util/getProjectTempFolder');

const globPromise = promisify(glob);
const copyPromise = promisify(copy);
const removePromise = promisify(remove);
const movePromise = promisify(move);

module.exports = async function rename (argv) {
  const { androidSearchPath, bundleId } = argv;

  const gradle = fs.readFileSync(`${androidSearchPath}/app/build.gradle`, 'utf8');
  const result = /applicationId ["'](.*)["']/.exec(gradle);

  console.log('Android: Updating bundle ID from %s to %s', result[1], bundleId);

  const mainapp = await globPromise(`${androidSearchPath}/app/src/main/java/**/MainApplication.java`);

  const regex = /(app[\/\\]src[\/\\]main[\/\\]java[\/\\])(.*)[\/\\]MainApplication.java/i;

  const path = mainapp[0].replace(/[\/\\]MainApplication.java/, '')
  const newPath = mainapp[0].replace(regex, `$1${bundleId.split('.').join('/')}`)

  const tempPath = `${getProjectTempFolder()}/_androidBundleRename`;

  if (path !== newPath) {
    await copyPromise(path, tempPath);
    await removePromise(path);
    await movePromise(tempPath, newPath, { overwrite: true });
    console.log('Android: Moved main java files from %s to %s', path, newPath);
  } else {
    console.log('Android: Bundle ID has not changed, nothing to move');
  }

  const changes = await replace({
    files: [
      `${newPath}/**/*.java`,
      `${androidSearchPath}/app/src/main/AndroidManifest.xml`,
      `${androidSearchPath}/app/build.gradle`,
    ],
    from: new RegExp(result[1], 'g'),
    to: bundleId,
  });


  if (changes.length) {
    console.log('Android: Changed bundle ID from %s to %s in the following files:\n%s', result[1], bundleId, changes.join('\n'))
  } else {
    console.log('Android: Bundle ID was already set to %s in all files', bundleId);
  }
}
