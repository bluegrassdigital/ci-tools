const path = require('path');
const build = require('../../../lib/ios/build');
const getIOSProject = require('../../../lib/util/getIOSProject');
const getProjectTempFolder = require('../../../lib/util/getProjectTempFolder');

exports.command = 'ios'
exports.desc = 'Build ios project'
exports.builder = function (yargs) {
  const defaultSearchPath = path.resolve(process.cwd(), './ios');
  const defaultUseProject = getIOSProject(defaultSearchPath);
  const extraDefaults = {};
  const extraDemands = [];

  if (defaultUseProject && defaultSearchPath) {
    extraDefaults.iosSearchPath = defaultSearchPath;
  } else {
    extraDemands.push('iosSearchPath');
  }

  return yargs
    .describe('iosSearchPath', 'Directory to search in for iOS workspace/project')
    .describe('buildPath', 'Directory to place the build temporary files')
    .default('buildPath', path.resolve(getProjectTempFolder(), 'ios/build'))
    .describe('archivePath', 'Directory to place the exported archive file')
    .default('archivePath', path.resolve(getProjectTempFolder(), 'ios/archive'))
    .describe('profile', 'Provisioning Profile name')
    .describe('profileuuid', 'Provisioning Profile UUID')
    .default('method', 'app-store')
    .choices('method', ['app-store', 'ad-hoc', 'enterprise'])
    .describe('method', 'Deployment method to use in export options.')
    .describe('manifestDownloadUrl', 'For enterprise and ad hoc deployments. Must be a full https path')
    .describe('manifestDisplayImageUrl', 'For enterprise and ad hoc deployments. Must be a full https path')
    .describe('manifestFullImageUrl', 'For enterprise and ad hoc deployments. Must be a full https path')
    .check(argv => {
      const needsManifest = /^(enterprise|ad-hoc)$/.test(argv.method);
      if (needsManifest && !argv.manifestDownloadUrl) throw new Error(`Manifest download url is required for ${argv.method} deployments`)
      if (needsManifest && !argv.manifestFullImageUrl && !argv.manifestDisplayImageUrl) throw new Error('Either manifestFullImageUrl or manifestDisplayImageUrl is required')
      return true;
    })
    .describe('bundleId', 'Bundle identifier to use for both the build and in export options')
    .default(extraDefaults)
    .demandOption(['profile', 'bundleId', ...extraDemands])
}
exports.handler = function (argv) {
  return build(argv);
}
