#!/usr/bin/env node

const { root } = require('../lib/shared');
const playup = require('playup');
const fs = require('fs');
const glob = require('glob');

const jsonFile = fs.readFileSync(process.env['DEPLOYMENT_JSON'], 'utf8');
if (!jsonFile) throw new Error('No deployment key');
const key = JSON.parse(jsonFile);

const publisher = playup(key);

glob(`${root}/android/app/build/outputs/apk/!(*-unsigned).apk`, function(error, files) {
  if (!files || !files.length) throw new Error('No apks');
  console.log(JSON.stringify(files))
  publisher.upload(files, {
    recentChanges: {},
    track: 'alpha',
  }).then(function () {
    console.log('Upload complete');
  });
});


