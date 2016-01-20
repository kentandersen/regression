var open = require('open');

var url = 'http://www.gjensidige.no/' + process.argv[2]
            .replace(/\_/gi, '/')
            .replace('-org', '')
            .replace('-new', '')
            .replace('-diff', '')
open(url);
