#!/usr/bin/env node

const { exec, root, iosPaths } = require('../lib/shared');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const plist = require('plist');
const os = require('os');
const openssl = require('openssl-wrapper');

const { PRODUCT_BUNDLE_IDENTIFIER, PROVISIONING_PROFILE_NAME, PROVISIONING_PROFILE, DEPLOYMENT_METHOD, MANIFEST_DOWNLOAD_URL, MANIFEST_DISPLAY_IMAGE_URL, USER_HOME, MANIFEST_FULL_IMAGE_URL, IOS_SEARCH_DIR } = process.env;

const {
  BUILD_DIR,
  ARCHIVE_PATH,
  BINARY_PATH,
  SCHEME,
} = iosPaths;

const EXPORT_PLIST = `${BUILD_DIR}/_export.plist`;

const glob = require('glob');

const searchPath = IOS_SEARCH_DIR || `${process.cwd()}/ios`;

const buildIPA = () =>
  `xcodebuild \
-exportArchive \
-archivePath "${ARCHIVE_PATH}" \
-exportPath "${BINARY_PATH}" \
-exportOptionsPlist "${EXPORT_PLIST}" \
-quiet`;

const start = Date.now();
console.log(`Building IPA`)
try {
  exec(`rm -rf "${BINARY_PATH}"`, {});
} catch (e) {

}

const re = /^.*CN=(.*?)\/.*$/gm

function getProvisioningProfileDetails(profileName, profileId) {
  return new Promise((resolve, reject) => {
    glob(`${USER_HOME ? USER_HOME : os.homedir()}/Library/MobileDevice/Provisioning\ Profiles/${profileId ? profileId : '*'}.mobileprovision`, (error, files) => {
      if (error) reject(err);
      for (let i = 0; i < files.length; i++) {
        openssl.exec('smime', {inform: 'DER', verify: true, noverify: true, in: files[i]}, function(err, buffer) {
          if (err) reject(err);
          const content = plist.parse(buffer.toString('utf8'));
          if (content.Name !== profileName) return;
          const cert = new Buffer(content.DeveloperCertificates[0], 'base64');
          openssl.exec('x509', cert, {inform: 'DER', subject: true}, function(err, buffer) {
              if (err) reject(err);
              const certName = re.exec(buffer.toString())
              resolve({
                CodeSigningIdentity: certName[1],
                TeamName: content.TeamName,
                UUID: content.UUID,
                TeamID: content.TeamIdentifier[0],
              })
            });
          });
      }
    })
  });
}


glob(`${searchPath}/*.{xcworkspace,xcodeproj}`, async (error, files) => {
  if (error) throw error;
  if (!files || !files.length) throw new Error('No project or workspace found');

  const { CodeSigningIdentity, TeamName, UUID, TeamID } = await getProvisioningProfileDetails(PROVISIONING_PROFILE_NAME, PROVISIONING_PROFILE);
  const parsed = files.map(filePath => ({
    ...path.parse(filePath),
    full: filePath,
  }));

  const useFile = parsed.length === 1 ? parsed[0] : parsed.find(file => file.ext === '.xcworkspace') || parsed[0];

  const workspace = useFile.ext === '.xcworkspace';

  console.log(`${workspace ? 'Workspace' : 'Project'} found at ${useFile.full}`);
  const ls = spawn('xcodebuild', [
    '-quiet',
    '-configuration', 'Release',
    workspace ? '-workspace' : '-project', `${useFile.full}`,
    '-scheme', SCHEME,
    '-sdk', 'iphoneos',
    '-derivedDataPath', BUILD_DIR,
    'archive',
    '-archivePath', `"${BUILD_DIR}/archives/${useFile.name}.xcarchive"`,
    'CODE_SIGN_STYLE="Manual"',
    `DEVELOPMENT_TEAM="${TeamID}"`,
    `PROVISIONING_PROFILE_SPECIFIER="${UUID}"`,
    `PRODUCT_BUNDLE_IDENTIFIER="${PRODUCT_BUNDLE_IDENTIFIER}"`,
    `CODE_SIGN_IDENTITY="${CodeSigningIdentity}"`,
  ], {
    env: Object.assign({}, process.env, {
      RCT_NO_LAUNCH_PACKAGER: 1,
    }),
    shell: true
  });
  let stdout = '';

  ls.stdout.on('data', (data) => {
    stdout += data;
  });

  ls.stderr.on('data', (data) => {
    console.log(stdout);
    console.log(`stderr: ${data}`);
  });

  ls.on('close', async (code) => {
    if (code !== 0) {
      console.log(`ps process exited with code ${code}`);
      process.exit(code);
    } else {
      console.log(`Archiving IPA`)
      fs.writeFileSync(
        EXPORT_PLIST,
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${DEPLOYMENT_METHOD || 'app-store'}</string>
  <key>teamID</key>
  <string>${TeamID}</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>${PRODUCT_BUNDLE_IDENTIFIER}</key>
    <string>${PROVISIONING_PROFILE_NAME}</string>
  </dict>
  ${DEPLOYMENT_METHOD && DEPLOYMENT_METHOD !== 'app-store' && `
  <key>manifest</key>
  <dict>
    <key>appURL</key>
    <string>${MANIFEST_DOWNLOAD_URL}</string>
    <key>displayImageURL</key>
    <string>${MANIFEST_DISPLAY_IMAGE_URL || MANIFEST_FULL_IMAGE_URL}</string>
    <key>fullSizeImageURL</key>
    <string>${MANIFEST_FULL_IMAGE_URL || MANIFEST_DISPLAY_IMAGE_URL}</string>
  </dict>
  `}
</dict>
</plist>
`
      );

      try {
        const stdout = await exec(buildIPA());
        console.log(stdout.toString());
      } catch (error) {
        if (error) console.error(error);
      }

      console.log(`IPA build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
    }
  });
});
