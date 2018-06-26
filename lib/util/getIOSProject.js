const glob = require('glob');
const path = require('path');

module.exports = function(searchPath) {
  const files = glob.sync(`${searchPath}/*.{xcworkspace,xcodeproj}`);
  if (!files || !files.length) return null;

  const parsed = files.map(filePath => ({
    ...path.parse(filePath),
    full: filePath,
  }));

  const useFile = parsed.length === 1 ? parsed[0] : parsed.find(file => file.ext === '.xcworkspace') || parsed[0];

  return useFile;
}
