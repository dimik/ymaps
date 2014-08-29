'use strict';

var express = require('express');
var router = express.Router();

module.exports = router;

router.route('/v1/features')
  .get(require('./get-features'))
  .put(require('./put-features'));
