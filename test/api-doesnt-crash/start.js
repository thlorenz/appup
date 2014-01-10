'use strict';

var appup = require('../../');

var opts = {
    apiPort: 3000
  , config: require.resolve('./appup-config')
}

appup(opts);
