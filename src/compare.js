var util = require('./util');
var resemble = require('node-resemble-js');
var imageDiff = require('image-diff');
var fs = require('fs');

function compareWithImageDiff(orgImg, newImg) {

  return new Promise(function(resolve, reject) {
    var screenShotPath = util.getTempPath();

    imageDiff({
      actualImage: newImg,
      expectedImage: orgImg,
      diffImage: screenShotPath,
      shadow: true
    }, function(error, imagesAreSame) {
      if(error || !imagesAreSame) {
        reject([screenShotPath, orgImg, newImg]);
      } else {
        resolve(error, imagesAreSame)
      }
    });
  });
}

function compareWithResemble(orgImg, newImg) {

  return new Promise(function(resolve, reject) {
    resemble(orgImg)
      .compareTo(newImg)
      // .ignoreColors()
      .onComplete(function(data){
        if(Number(data.misMatchPercentage) > 2) {
          var screenShotPath = util.getTempPath();
          data
            .getDiffImage()
            .pack()
            .pipe(fs.createWriteStream(screenShotPath).on('finish', function() {
              reject([screenShotPath, orgImg, newImg]);
            }));
        } else {
          resolve(data);
        }
      });
  });
}

exports.imageDiff = compareWithImageDiff;
exports.resemble = compareWithResemble;
