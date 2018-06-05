#!/usr/bin/env node

const { exec, root, iosPaths } = require('../lib/shared');
const fs = require('fs');
const path = require('path');

const { PROVISIONING_PROFILE, CODE_SIGNING_IDENTITY, PRODUCT_BUNDLE_IDENTIFIER, TEAM_ID, PROVISIONING_PROFILE_NAME } = process.env;

const {
  BUILD_DIR,
  DERIVED_DATA_DIR,
  HERE_INTERMEDIATES,
  MODULE_CACHE_DIR,
  OBJROOT,
  SHARED_PRECOMPS_DIR,
  CONFIGURATION_BUILD_DIR,
  ARCHIVE_PATH,
  PROJECT_PATH,
  WORKSPACE_PATH,
  BINARY_PATH,
  SCHEME,
} = iosPaths;

const EXPORT_PLIST = path.resolve(process.cwd(), './export.plist');

const workspace = fs.existsSync(WORKSPACE_PATH);

const archive = () =>
  `xcodebuild \
-quiet \
-configuration Release \
-${workspace ? 'workspace' : 'project'} "${workspace ? WORKSPACE_PATH : PROJECT_PATH}" \
-scheme ${SCHEME} \
-sdk iphoneos \
archive -archivePath "${ARCHIVE_PATH}" \
-derivedDataPath "${DERIVED_DATA_DIR}" \
CODE_SIGN_STYLE="Manual" \
BUILD_DIR="${BUILD_DIR}" \
DERIVED_DATA_DIR="${DERIVED_DATA_DIR}" \
MODULE_CACHE_DIR="${MODULE_CACHE_DIR}" \
OBJROOT="${OBJROOT}" \
DEVELOPMENT_TEAM="${TEAM_ID}" \
PROVISIONING_PROFILE_SPECIFIER="${PROVISIONING_PROFILE}" \
PRODUCT_BUNDLE_IDENTIFIER=${PRODUCT_BUNDLE_IDENTIFIER} \
CODE_SIGN_IDENTITY="${CODE_SIGNING_IDENTITY}" \
SHARED_PRECOMPS_DIR="${SHARED_PRECOMPS_DIR}" \
CONFIGURATION_BUILD_DIR="${CONFIGURATION_BUILD_DIR}"`;

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

console.log(`Found ${workspace ? 'workspace' : 'project'} at ${workspace ? WORKSPACE_PATH : PROJECT_PATH}`);

exec(archive(), {
  RCT_NO_LAUNCH_PACKAGER: 1,
});
console.log(`Archiving IPA`)
fs.writeFileSync(
  EXPORT_PLIST,
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>${TEAM_ID}</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>${PRODUCT_BUNDLE_IDENTIFIER}</key>
    <string>${PROVISIONING_PROFILE_NAME}</string>
  </dict>
</dict>
</plist>
`)
exec(buildIPA())
console.log(`IPA build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
