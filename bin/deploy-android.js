#!/usr/bin/env node

const deploy = require('../lib/android/deploy');

deploy();

process.on('unhandledRejection', error => {
  throw error;
});
