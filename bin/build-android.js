#!/usr/bin/env node

const { exec, root } = require('../lib/shared');

const start = Date.now();
console.log('Building APK');
exec('cd android && ./gradlew assembleRelease');
console.log(`APK build took ${((Date.now() - start)/1000).toFixed(2)} seconds`);
