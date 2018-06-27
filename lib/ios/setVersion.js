const fs = require('fs');
const path = require('path');
const glob = require('glob');
const plist = require('plist');
const { parseSemVer } = require('semver-parser');

const getVersionName = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}`;
}

const getIOSVersionCode = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}${build ? `.${build}` : ''}`;
};

module.exports = function ({ iosSearchPath, v }) {
  const files = glob.sync(`${path.resolve(process.cwd(), iosSearchPath)}/*/Info.plist`);
  if (!files || !files.length) throw new Error('iOS: No Info.plist found in search path');
  const versionCode = getIOSVersionCode(v);
  const versionName = getVersionName(v);
  let match = false;
  for (let i = 0; i < files.length; i++) {
    let useFile = files[i];
    let plistData = fs.readFileSync(useFile, 'utf8');
    let obj = plist.parse(plistData);
    if (obj.CFBundleShortVersionString) {
      match = true;
      obj.CFBundleVersion = versionCode;
      obj.CFBundleShortVersionString = versionName;
      fs.writeFileSync(useFile, plist.build(obj));
    }
  }
  if (!match) throw new Error('No matching Info.plist files found')
  console.log('iOS: CFBundleShortVersionString set to %s', versionName);
  console.log('iOS: CFBundleVersion set to %s, converted from semver %s', versionCode, v);
}
