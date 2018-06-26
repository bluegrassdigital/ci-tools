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
  const plistData = fs.readFileSync(files[0], 'utf8');
  const obj = plist.parse(plistData);
  obj.CFBundleVersion = versionCode;
  obj.CFBundleShortVersionString = versionName;
  fs.writeFileSync(files[0], plist.build(obj));
  console.log('iOS: CFBundleShortVersionString set to %s', versionName);
  console.log('iOS: CFBundleVersion set to %s, converted from semver %s', versionCode, v);
}
