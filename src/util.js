var os = require('os');
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');

exports.getTempPath = function() {
  var folder = path.join(os.tmpdir(), 'regression');

  mkdirp.sync(folder);
  return path.join(folder, uuid.v4() + '.png');
};

exports.copyFile = function(source, target) {
  return new Promise(function(resolve, reject) {
    var rd = fs.createReadStream(source);
    rd.on('error', reject);
    var wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
};