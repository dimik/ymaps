'use strict';

var config = require('../../config');
var logger = require('../../lib/logger');
var StorageFacade = require('../../lib/storage/facade');
var storage = new StorageFacade();

/**
 * Find features.
 */
exports['get'] = function (req, res) {
  storage.findFeatures()
    .then(function (data) {
      _send(res, {
        "error": null,
        "data": data.getData()
      });
    })
    .fail(function (err) {
      logger.log('err', err);
      res.status(400);
      _send(res, {
        "error": err.stack || JSON.stringify(err)
      });
    });
};

/**
 * Add feautures.
 */
exports['put'] = function (req, res) {
  var inspector = require('schema-inspector');
  var schema = require('../../schema/geojson.js');
  var FeatureIds = require('../../lib/serializer/feature-ids');
  var fIds = new FeatureIds();
  var result = inspector.validate(schema['FeatureCollection'], req.body);

  if(result.valid) {
    storage.addFeatures(req.body.features)
      .then(function (data) {
        var ids = data.serialize(fIds).getData();

        _send(res, {
          "error": null,
          "data": {
            "total": ids.length,
            "ids": ids
          }
        });
      })
      .fail(function (err) {
        logger.log('err', err);
        res.status(400);
        _send(res, {
          "error": err.stack || JSON.stringify(err)
        });
      });
  }
  else {
    logger.log('notice', result.format());
    res.status(400);
    _send(res, {
      "error": result.format()
    });
  }
};

/**
 * TODO
 * Update features.
 */
exports['post'] = function (req, res) {
};

/**
 * TODO
 * Remove features.
 */
exports['delete'] = function (req, res) {
};

/**
 * Find features inside bbox.
 */
exports['get-within-bbox'] = function (req, res) {
  var FeatureClusterer = require('../../lib/serializer/feature-clusterer');
  var fc = new FeatureClusterer();
  var YMapsCluster = require('../../lib/serializer/ymaps-cluster');
  var yc = new YMapsCluster();


  var zoom = +req.param('zoom');
  var bbox = req.param('bbox').split(',').map(Number);

  storage.findFeaturesInBounds([ bbox.slice(0, 2), bbox.slice(2, 4) ])
    .then(function (data) {
      return req.param('clusterize')?
        data.serialize(fc, { zoom: zoom }).serialize(yc) : data;
    })
    .then(function (data) {
      _send(res, {
        "error": null,
        "data": data.getData()
      });
    })
    .fail(function (err) {
      logger.log('err', err);
      res.status(400);
      _send(res, {
        "error": err.stack || JSON.stringify(err)
      });
    });
};

/**
 * TODO
 * Find features inside polygon.
 */
exports['get-within-polygon'] = function (req, res) {
};

/**
 * TODO
 * Find features near coordinates.
 */
exports['get-near'] = function (req, res) {
};

function _send(res, data) {
  res.format({
    "application/jsonp": function () {
      res.jsonp(data);
    },
    "application/json": function () {
      res.json(data);
    },
    "default": function () {
      res.status(406).send('Not Acceptable');
    }
  });
}
