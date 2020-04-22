const fs = require('fs');
const path = require('path');
const leftPad = require('left-pad');
const { parseSemVer } = require('semver-parser');

const getVersionName = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  return `${major}.${minor}.${patch}+${build}`;
}

const getAndroidVersionCode = version => {
  const { major, minor, patch, build } = parseSemVer(version);

  // const ret = `${leftPad(major, 2, '0')}${leftPad(minor, 2, '0')}${leftPad(patch, 2, '0')}${leftPad(build, 3, '0')}`;
  // console.log(ret)
  // console.log(parseInt(ret, 10))
  // console.log(Number(ret))

  //return Number(ret);

  return Number(`${major}${leftPad(minor, 2, '0')}${leftPad(patch, 2, '0')}${leftPad(Number(build), 2, '0')}`);
}


module.exports = function ({ gradlePath, v, startingVersionCode }) {
  const usepath = path.resolve(process.cwd(), gradlePath);
  const gradle = fs.readFileSync(usepath, 'utf8');
  const androidVersionCode = getAndroidVersionCode(v) + startingVersionCode;
  const androidVersionName = getVersionName(v);
  let str = gradle.replace(/versionName "(.*)"/, `versionName "${androidVersionName}"`);
  str = str.replace(/versionCode (.*)/, `versionCode ${androidVersionCode}`);
  fs.writeFileSync(usepath, str);
  console.log('Android: version set to %s', androidVersionName);
  console.log('Android: version code calculated to be %s from version %s', androidVersionCode, v);
}
