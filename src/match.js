var util = require('../src/util');
var path = require('path');

var takeScreenShot = require('./screenshot');
var compareImages = require('./compare').imageDiff;

var SCREENSHOT_PATH = path.join(__dirname, '..', 'screenshots');

var getScreenShotName = function(url, version) {
  var versionNames = ['diff', 'org', 'new'];
  return path.join(
    SCREENSHOT_PATH,
    url.replace('https://www.gjensidige.no/', '')
       .replace(/\//g, '_')
       + '-' + versionNames[version] + '.png'
  );
};

var removeMainCss = function(nightmare) {
  nightmare.evaluate(function() {
    document.head.querySelector('link[href*="main.css"]').remove();
  })
  .wait(1000);
};

module.exports = function(url) {

  return takeScreenShot(url, removeMainCss)
    .then(img => compareImages(img[0], img[1]))
    .catch(imgs => {
      return Promise.all(
        imgs.map((img, i) => util.copyFile(img, getScreenShotName(url, i)))
      );
    });
}