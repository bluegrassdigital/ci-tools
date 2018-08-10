const { promisify } = require('util');
const fs = require('fs');
const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;
const plist = require('plist');
const os = require('os');
const openssl = require('openssl-wrapper');
const moment = require('moment');
const getIOSProject = require('../util/getIOSProject');

const glob = require('glob');

const opensslExecPromise = promisify(openssl.exec);

const globPromise = promisify(glob);

async function getProvisioningProfileDetails(profileName, profileId) {
  try {
    const files = await globPromise(`${os.homedir()}/Library/MobileDevice/Provisioning\ Profiles/${profileId ? profileId : '*'}.mobileprovision`);

    for (let i = 0; i < files.length; i++) {
      try {
        const fileBuffer = await opensslExecPromise('smime', {inform: 'DER', verify: true, noverify: true, in: files[i]});
        const content = plist.parse(fileBuffer.toString('utf8'));
        if (content.Name !== profileName) continue;
        if (moment(content.ExpirationDate).isBefore(moment())) {
          console.log(`iOS: A matched provisioning profile (${content.UUID}) for "${profileName}" expired on ${content.ExpirationDate}, skipping`);
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

module.exports = async function build (argv) {
  const { buildPath, archivePath, iosSearchPath, profile, profileuuid, method, bundleId, manifestDisplayImageUrl, manifestDownloadUrl, manifestFullImageUrl } = argv;
  const start = Date.now();
  console.log(`iOS: Building IPA`)

  const useFile = getIOSProject(iosSearchPath);

  const { CodeSigningIdentity, TeamName, UUID, TeamID } = await getProvisioningProfileDetails(profile, profileuuid);

  const buildIPA = () =>
`xcodebuild \
-exportArchive \
-archivePath "${archivePath}/${useFile.name}.xcarchive" \
-exportPath "${archivePath}" \
-exportOptionsPlist "${buildPath}/export.plist" \
-quiet`;


  const workspace = useFile.ext === '.xcworkspace';

  const buildArgs = [
    '-quiet',
    '-configuration', 'Release',
    workspace ? '-workspace' : '-project', `${useFile.full}`,
    '-scheme', useFile.name,
    '-sdk', 'iphoneos',
    '-derivedDataPath', buildPath,
    'archive',
    '-archivePath', `"${archivePath}/${useFile.name}.xcarchive"`,
    'IDEBuildOperationMaxNumberOfConcurrentCompileTasks=`sysctl -n hw.ncpu`',
    'CODE_SIGN_STYLE="Manual"',
    `DEVELOPMENT_TEAM="${TeamID}"`,
    `PROVISIONING_PROFILE_SPECIFIER="${UUID}"`,
    `PRODUCT_BUNDLE_IDENTIFIER="${bundleId}"`,
    `CODE_SIGN_IDENTITY="${CodeSigningIdentity}"`,
  ];

  console.log(`iOS: Building ${workspace ? 'workspace' : 'project'} found at ${useFile.full} using command:`);

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
    console.log(data);
    throw new Error(data);
  });

  ls.on('close', async (code) => {
    if (code !== 0) {
      process.exit(code);
      throw new Error(`iOS: ps process exited with code ${code}`);
    } else {
      console.log(`iOS: IPA build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
      const archiveStart = Date.now();

      console.log(`iOS: Archiving IPA`)
      fs.writeFileSync(
        `${buildPath}/export.plist`,
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>method</key>
<string>${method}</string>
<key>teamID</key>
<string>${TeamID}</string>
<key>provisioningProfiles</key>
<dict>
  <key>${bundleId}</key>
  <string>${profile}</string>
</dict>
${method && method !== 'app-store' ? `
<key>manifest</key>
<dict>
  <key>appURL</key>
  <string>${manifestDownloadUrl}</string>
  <key>displayImageURL</key>
  <string>${manifestDisplayImageUrl || manifestFullImageUrl}</string>
  <key>fullSizeImageURL</key>
  <string>${manifestFullImageUrl || manifestDisplayImageUrl}</string>
</dict>
` : ''}
</dict>
</plist>
`
      );

      execSync(buildIPA());

      console.log(`iOS: IPA archive export took ${((Date.now() - archiveStart)/1000).toFixed(2)} seconds`);
    }
  });
}

