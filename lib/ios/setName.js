const fs = require('fs');
const path = require('path');
const glob = require('glob');
const plist = require('plist');
const { parseSemVer } = require('semver-parser');
const getIOSProject = require('../util/getIOSProject');

const getVersionName = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}`;
}

const getIOSVersionCode = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}${build ? `.${build}` : ''}`;
};

module.exports = function ({ iosSearchPath, name }) {
  const projectFile = getIOSProject(iosSearchPath);
  const files = glob.sync(`${path.resolve(process.cwd(), iosSearchPath)}/${projectFile.name}/Info.plist`);
  if (!files || !files.length) throw new Error('iOS: No Info.plist found in search path');
  let match = false;
  for (let i = 0; i < files.length; i++) {
    let useFile = files[i];
    let plistData = fs.readFileSync(useFile, 'utf8');
    let obj = plist.parse(plistData);
    if (obj.CFBundleDisplayName) {
      match = true;
      obj.CFBundleDisplayName = name;
      fs.writeFileSync(useFile, plist.build(obj));
    }
  }
  if (!match) throw new Error('No matching Info.plist files found')
  console.log('iOS: CFBundleDisplayName set to %s', name);
}
