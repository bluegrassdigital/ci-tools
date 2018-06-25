#!/usr/bin/env node

const { exec, root } = require('../lib/shared');

const start = Date.now();
console.log('Building APK');
(async function () {
  try {
    await exec('cd android && ./gradlew assembleRelease');
  } catch (error) {
    if (error) console.error(error);
  }
  console.log(`APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
})();
