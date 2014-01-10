'use strict';

var appup = require('../../');

var opts = {
    pagesPort: 3000
  , config: require.resolve('./appup-config')
  , entry: require.resolve('./entry.js')
}

appup(opts);
