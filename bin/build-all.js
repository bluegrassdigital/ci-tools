#!/usr/bin/env node

const buildAndroid = require('../lib/android/build');
const buildIOS = require('../lib/ios/build');

buildAndroid();
buildIOS();

process.on('unhandledRejection', error => {
  throw error;
});
