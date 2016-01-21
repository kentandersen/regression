var cluster = require('cluster');

if (cluster.isMaster) {
  require('./src/cluster');
} else {
  require('./src/child');
}
