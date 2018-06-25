const { exec, iosPaths } = require('../shared');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const plist = require('plist');
const os = require('os');
const openssl = require('openssl-wrapper');
const moment = require('moment');

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

const opensslExecPromise = promisify(openssl.exec);

const globPromise = promisify(glob);

async function getProvisioningProfileDetails(profileName, profileId) {
  try {
    const files = await globPromise(`${USER_HOME ? USER_HOME : os.homedir()}/Library/MobileDevice/Provisioning\ Profiles/${profileId ? profileId : '*'}.mobileprovision`);

    for (let i = 0; i < files.length; i++) {
      try {
        const fileBuffer = await opensslExecPromise('smime', {inform: 'DER', verify: true, noverify: true, in: files[i]});
        const content = plist.parse(fileBuffer.toString('utf8'));
        if (content.Name !== profileName) continue;
        console.log(files[i]);
        if (moment(content.ExpirationDate).isBefore(moment())) {
          console.log(`A matched provisioning profile (${content.UUID}) for "${profileName}" expired on ${content.ExpirationDate}, skipping`);
          continue;
        }
        const cert = new Buffer(content.DeveloperCertificates[0], 'base64');
        const certBuffer = await opensslExecPromise('x509', cert, {inform: 'DER', subject: true});
        const re = /.*CN=(.*?)\/.*/gm
        const certName = re.exec(certBuffer.toString())
        return {
          CodeSigningIdentity: certName[1],
          TeamName: content.TeamName,
          UUID: content.UUID,
          TeamID: content.TeamIdentifier[0],
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    throw new Error(`No matching provisioning profiles found for ${profileName}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = async function build () {
  const start = Date.now();
  console.log(`Building IPA`)

  const files = await globPromise(`${searchPath}/*.{xcworkspace,xcodeproj}`);
  if (!files || !files.length) throw new Error('No project or workspace found');

  const { CodeSigningIdentity, TeamName, UUID, TeamID } = await getProvisioningProfileDetails(PROVISIONING_PROFILE_NAME, PROVISIONING_PROFILE);
  const parsed = files.map(filePath => ({
    ...path.parse(filePath),
    full: filePath,
  }));

  const useFile = parsed.length === 1 ? parsed[0] : parsed.find(file => file.ext === '.xcworkspace') || parsed[0];

  const workspace = useFile.ext === '.xcworkspace';

  const buildArgs = [
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
  ];

  console.log(`Building ${workspace ? 'workspace' : 'wroject'} found at ${useFile.full} using command:`);

  console.log(buildArgs.join(' '));
  const ls = spawn('xcodebuild', buildArgs, {
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
    throw new Error(data);
  });

  ls.on('close', async (code) => {
    if (code !== 0) {
      process.exit(code);
      throw new Error(`ps process exited with code ${code}`);
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
${DEPLOYMENT_METHOD && DEPLOYMENT_METHOD !== 'app-store' ? `
<key>manifest</key>
<dict>
  <key>appURL</key>
  <string>${MANIFEST_DOWNLOAD_URL}</string>
  <key>displayImageURL</key>
  <string>${MANIFEST_DISPLAY_IMAGE_URL || MANIFEST_FULL_IMAGE_URL}</string>
  <key>fullSizeImageURL</key>
  <string>${MANIFEST_FULL_IMAGE_URL || MANIFEST_DISPLAY_IMAGE_URL}</string>
</dict>
` : ''}
</dict>
</plist>
`
      );

      try {
        const stdout = await exec(buildIPA());
        console.log(stdout.toString());
      } catch (error) {
        if (error) console.error(error);
        throw error;
      }

      console.log(`IPA build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
    }
  });
}

