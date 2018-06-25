#!/usr/bin/env node

const { exec, root, iosPaths } = require('../lib/shared');

const { BINARY_PATH, SCHEME } = iosPaths;

const { APPLE_DEPLOY_LOGIN, APPLE_DEPLOY_PASSWORD } = process.env;


(async function () {
  try {
    console.log(`Deploying IPA to TestFlight`);
    const stdout = await exec(`"/Applications/Xcode.app/Contents/Applications/Application Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool" --upload-app -f "${BINARY_PATH}/${SCHEME}.ipa" -u ${APPLE_DEPLOY_LOGIN} -p ${APPLE_DEPLOY_PASSWORD}`);
    console.log(stdout.toString());
      } catch (error) {
    if (error) console.error(error);
  }
  console.log(`APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
})();
