#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const plist = require('plist');
const pkg = require(path.resolve(process.cwd(), './package.json'));
const { root } = require('../lib/shared');
const { parseSemVer } = require('semver-parser');

const { BUILD_NUMBER, APP_NAME, BASE_VERSION } = process.env;

const useVersion = BASE_VERSION || pkg.version;

const version = parseSemVer(BASE_VERSION || pkg.version);

const getAndroidVersionCode = v => {
  const {
    major, minor, patch,
  } = v;

  return major * 1000000 + minor * 10000 + patch * 100 + Number(BUILD_NUMBER);
};

const obj = plist.parse(fs.readFileSync(`${root}/ios/${APP_NAME || pkg.name}/Info.plist`, 'utf8'));
obj.CFBundleVersion = `${useVersion}.${BUILD_NUMBER}`;
obj.CFBundleShortVersionString = useVersion;
fs.writeFileSync(`${root}/ios/${APP_NAME || pkg.name}/Info.plist`, plist.build(obj));

const gradlePath = `${root}/android/app/build.gradle`;

const gradle = fs.readFileSync(gradlePath, 'utf8');
let str = gradle.replace(/versionName "(.*)"/, `versionName "${useVersion}"`);
str = str.replace(/versionCode (.*)/, `versionCode ${getAndroidVersionCode(version)}`);
fs.writeFileSync(gradlePath, str);

fs.writeFileSync(`${root}/version.properties`, `NEW_BUILD_VERSION=${useVersion}.${BUILD_NUMBER}
PKG_VERSION=${useVersion}
`);

