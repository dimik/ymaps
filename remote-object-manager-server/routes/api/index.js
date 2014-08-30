'use strict';

var express = require('express');
var router = express.Router();
var features = require('./features');

module.exports = router;

router.route('/features')
  .get(features['get'])
  .put(features['put'])
  .post(features['post'])
  .delete(features['delete']);

router.route('/features/within/bbox/:bbox')
  .get(features['get-within-bbox'])

router.route('/features/within/polygon/:coordinates')
  .get(features['get-within-polygon'])

router.route('/features/near/:coordinates')
  .get(features['get-near'])
