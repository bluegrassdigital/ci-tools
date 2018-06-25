#!/usr/bin/env node

const build = require('../lib/android/build');

build();

process.on('unhandledRejection', error => {
  throw error;
});
