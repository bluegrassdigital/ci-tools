const { exec } = require('child_process');
const glob = require('glob');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = async function deploy(argv) {
  const { username, password, ipaPath } = argv;
  console.log(`iOS: Deploying IPA to TestFlight`);
  const files = glob.sync(`${ipaPath}/*.ipa`);
  if (!files || !files.length) throw new Error('iOS: No ipa bundle found to upload');
  const command = `"/Applications/Xcode.app/Contents/Applications/Application Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool" --upload-app -f "${files[0]}" -u ${username} -p ${password}`;
  console.log('iOS: uploading IPA using command %s', command);
  await execPromise(command);
  console.log('iOS: IPA uploaded');

}
