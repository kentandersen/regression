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
  sitemap = sitemap.slice(1, 100);
  sitemap = filterWhitelist(sitemap);

  console.log(`capping to ${sitemap.length}`);

  var chunkSize = Math.ceil(sitemap.length / numOfProcesses);
  console.log(`running ${chunkSize} sites pr browser`);

  var bar = new ProgressBar('Matching [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: sitemap.length
  });

  while (sitemap.length > 0) {
    spawnBrowser(sitemap.splice(0, chunkSize));
  }

  cluster.on('message', () => bar.tick(1));

  let start = new Date();
  process.on('exit', () => console.log(`Matching took ${util.formatTime(start, new Date())}`));
});
