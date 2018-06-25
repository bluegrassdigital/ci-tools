#!/usr/bin/env node

const build = require('../lib/ios/build');

build();

process.on('unhandledRejection', error => {
  throw error;
});
