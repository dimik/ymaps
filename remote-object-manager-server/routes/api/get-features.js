'use strict';

var StorageFacade = require('../../lib/storage/facade');
var storage = new StorageFacade();

var FeatureClusterer = require('../../lib/serializer/feature-clusterer');
var fc = new FeatureClusterer();

var YMapsCluster = require('../../lib/serializer/ymaps-cluster');
var yc = new YMapsCluster();

module.exports = function (req, res) {
  var zoom = +req.param('zoom');
  var bbox = req.param('bbox').split(',').map(Number);
  var bounds = [ bbox.slice(0, 2), bbox.slice(2, 4) ];
  var found = 0;

  // storage.findFeatures()
  storage.findFeaturesInBounds(bounds)
    .then(function (data) {
found = data.getData().features.length;
      return req.param('clusterize')?
        data.serialize(fc, {
          zoom: +req.param('zoom')
        }).serialize(yc) :
        data;
    })
    .then(function (data) {
      _send(res, {
        "error": null,
        "data": data.getData(),
        "metadata": {
          "found": found,
          "bounds": bounds,
          "zoom": zoom
        }
      });
    })
    .fail(function (err) {
      _send(res, {
        "error": err.message,
        "stack": err.stack
      });
    });
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
