const path = require('path');
const os = require('os');

module.exports = function() {
  return path.resolve(os.tmpdir(), 'bgci', Buffer.from(process.cwd()).toString('base64'));
}
