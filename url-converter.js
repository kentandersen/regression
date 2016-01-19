var open = require('open');

open("http://www.gjensidige.no/" + process.argv[2].replace(/\_/gi, "/").replace("-org", "").replace("-new", ""));
