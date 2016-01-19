'use strict';

var cluster = require('cluster');

if (cluster.isMaster) {
  let ProgressBar = require('progress');
  let getSiteMap = require('./src/sitemap').fetchSiteMap;
  let filterWhitelist = require('./src/sitemap').filterWhitelist;
  let util = require('./src/util');
  let numOfProcesses = require('os').cpus().length;

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

} else {
  require('./child');
}
