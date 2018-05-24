const execSync = require('child_process').execSync
const path = require('path');

const { BUILD_NUMBER } = process.env;

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  })

const root = process.cwd();
const name = require(path.resolve(process.cwd(), './package.json')).name;

const BUILD_DIR = `${root}/ios/build`;
const DERIVED_DATA_DIR = `${BUILD_DIR}/DerivedData`;
const HERE_INTERMEDIATES = `${BUILD_DIR}/Intermediates`;
const MODULE_CACHE_DIR = `${BUILD_DIR}/DerivedData/ModuleCache`;
const OBJROOT = HERE_INTERMEDIATES;
const SHARED_PRECOMPS_DIR = `${HERE_INTERMEDIATES}/PrecompiledHeaders`;
const CONFIGURATION_BUILD_DIR = BUILD_DIR;
const ARCHIVE_PATH = `${BUILD_DIR}/archives/${name}.xcarchive`;
const PROJECT_PATH = `${root}/ios/${name}.xcodeproj`;
const WORKSPACE_PATH = `${root}/ios/${name}.xcworkspace`;
const BINARY_PATH = `${root}/_binaries`;
const EXPORT_PLIST = `${root}/ios/export.plist`;
const SCHEME = `${name}`;

module.exports = {
  root,
  exec,
  iosPaths: {
    BUILD_DIR,
    SCHEME,
    DERIVED_DATA_DIR,
    HERE_INTERMEDIATES,
    MODULE_CACHE_DIR,
    OBJROOT,
    SHARED_PRECOMPS_DIR,
    CONFIGURATION_BUILD_DIR,
    ARCHIVE_PATH,
    PROJECT_PATH,
    BINARY_PATH,
    EXPORT_PLIST,
  }
}
