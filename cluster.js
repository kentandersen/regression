'use strict';

var cluster = require('cluster');


if (cluster.isMaster) {
  let getSiteMap = require('./src/sitemap');
  let util = require('./src/util');
  let numOfProcesses = require('os').cpus().length * 2;

  console.log('\nFetching site map');
  getSiteMap().then(sitemap => {
    // capped to 100 for now
    sitemap = sitemap.slice(0, 100);

    let spawnBrowser = function() {
      if(!sitemap.length) {
        return;
      }

      let end = sitemap.length < 10 ? sitemap.length : 10;
      cluster.fork({urls: sitemap.splice(0, end)});
    };

    for (var i = 0; i < numOfProcesses; i++) {
      spawnBrowser();
    }

    cluster.on('exit', spawnBrowser);

    let start = new Date();
    process.on('exit', function (){
      console.log(`Matching took ${util.formatTime(start, new Date())}`);
    });
  });

} else {
  let match = require('./src/match');
  let screenshot = require('./src/screenshot');

  let urls = process.env.urls.split(',');

  urls.reduce((memo, url) => memo.then(() => match(url)), Promise.resolve())
    .then(screenshot.end)
    .then(() => process.exit(0));
}