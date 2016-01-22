'use strict';

var cluster = require('cluster');
let ProgressBar = require('progress');
let getSiteMap = require('./sitemap').fetchSiteMap;
let filterWhitelist = require('./sitemap').filterWhitelist;
let util = require('./util');

let numOfProcesses = require('os').cpus().length;

function spawnBrowser(sites) {
  if(!sites.length) {
    return;
  }

  cluster.fork({urls: sites});
}

console.log('\nFetching site map');

getSiteMap().then(sitemap => {

  console.log(`${sitemap.length} urls loaded`);
  // capped to 100 for now
  sitemap = sitemap.slice(0, 100);
  sitemap = filterWhitelist(sitemap);

  console.log(`capping to ${sitemap.length}`);

  var bar = new ProgressBar('Matching [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: sitemap.length
  });

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
  cluster.on('message', () => bar.tick(1));

  let start = new Date();
  process.on('exit', () => console.log(`Matching took ${util.formatTime(start, new Date())}`));
});
