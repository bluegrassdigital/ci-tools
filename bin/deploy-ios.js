#!/usr/bin/env node

const deploy = require('../lib/ios/deploy');

deploy();

process.on('unhandledRejection', error => {
  throw error;
});
