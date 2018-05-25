#!/usr/bin/env node

const playup = require('playup');
const fs = require('fs');
const glob = require('glob');

const { DEPLOYMENT_JSON, APK_FOLDER } = process.env;

const jsonFile = fs.readFileSync(DEPLOYMENT_JSON, 'utf8');
if (!jsonFile) throw new Error('No deployment key');
const key = JSON.parse(jsonFile);

const publisher = playup(key);

const apkFolder = APK_FOLDER || `${process.cwd()}/android/app/build/outputs/apk`

glob(`${apkFolder}/!(*-unsigned).apk`, function(error, files) {
  if (!files || !files.length) throw new Error('No apks');
  console.log(JSON.stringify(files))
  publisher.upload(files, {
    recentChanges: {},
    track: 'alpha',
  }).then(function () {
    console.log('Upload complete');
  });
});


