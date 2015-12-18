'use strict';

var cluster = require('cluster');


if (cluster.isMaster) {
  let numCPUs = require('os').cpus().length;
  let getSiteMap = require('./src/sitemap');

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


    for (var i = 0; i < numCPUs; i++) {
      spawnBrowser();
    }

    cluster.on('exit', spawnBrowser);
  });

} else {
  let match = require('./src/match');
  let screenshot = require('./src/screenshot');

  let urls = process.env.urls.split(',');

  urls.reduce(function(memo, url) {
    return memo.then(function() {
      console.time(url);
      return match(url).then(() => console.timeEnd(url));
    });
  }, Promise.resolve())
    .then(screenshot.end)
    .then(() => process.exit(0));
}