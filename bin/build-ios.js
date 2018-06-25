#!/usr/bin/env node

const build = require('../lib/ios/build');

build()
.catch(e => console.log(e))
