const exec = require('child_process').exec
const path = require('path');

const { APP_NAME, IOS_OUTPUT_PATH } = process.env;

const execPromise = (command, extraEnv) => {
  return new Promise((resolve, reject) => {
    exec(command, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, extraEnv)
    }, (error, stdout, stderr) => {
      if (error) reject(error);
      if (stderr) reject(stderr);
      if (stdout) resolve(stdout);
    });
  });
}


const root = process.cwd();
const name = APP_NAME || require(path.resolve(process.cwd(), './package.json')).name;

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
const BINARY_PATH = IOS_OUTPUT_PATH || `${root}/_binaries`;
const SCHEME = `${name}`;

module.exports = {
  root,
  exec: execPromise,
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
    WORKSPACE_PATH,
    BINARY_PATH,
  }
}
