var Nightmare = require('nightmare');
var util = require('./util');

var nightmare = new Nightmare({
  width: 1280,
  height: 2000,
  show: false
});

function takeScreenShot(url, fn) {
  var screenShotPath1 = util.getTempPath();
  var screenShotPath2 = util.getTempPath();

  return new Promise(function(resolve, reject) {

    nightmare.goto(url)
    .wait(2000)
    .screenshot(screenShotPath1)
    .evaluate(fn ? fn : () => {})
    .wait(1000)
    .screenshot(screenShotPath2)
    .run(function(err) {
      err ? reject(err) : resolve([screenShotPath1, screenShotPath2]);
    });
  });
}

module.exports = takeScreenShot;
module.exports.end = () => new Promise(resolve => nightmare.end(resolve));
