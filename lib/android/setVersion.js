const fs = require('fs');
const path = require('path');
const { parseSemVer } = require('semver-parser');

const getVersionName = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}`;
}

const getAndroidVersionCode = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return major * 100000000 + minor * 1000000 + patch * 10000 + Number(build);
}

module.exports = function ({ gradlePath, v }) {
  const usepath = path.resolve(process.cwd(), gradlePath);
  const gradle = fs.readFileSync(usepath, 'utf8');
  const androidVersionCode = getAndroidVersionCode(v);
  const androidVersionName = getVersionName(v);
  let str = gradle.replace(/versionName "(.*)"/, `versionName "${androidVersionName}"`);
  str = str.replace(/versionCode (.*)/, `versionCode ${androidVersionCode}`);
  fs.writeFileSync(usepath, str);
  console.log('Android: version set to %s', androidVersionName);
  console.log('Android: version code calculated to be %s from version %s', androidVersionCode, v);
}
