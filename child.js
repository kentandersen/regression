'use strict';

let match = require('./src/match');
let screenshot = require('./src/screenshot');

let urls = process.env.urls.split(',');

let notify = function(url) {
  process.send('matchingfinished');
};


urls.reduce((memo, url) => {
  return memo
    .then(() => match(url))
    .then(notify.bind(undefined, url))
  }, Promise.resolve())
  .then(screenshot.end)
  .then(() => process.exit(0));