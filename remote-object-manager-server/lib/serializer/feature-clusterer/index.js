var util = require('./util');
var Feature = require('./feature');
var ProjectionFactory = require('./projection/factory');
var projection = new ProjectionFactory();
var GridClusterer = require('./grid-clusterer');

module.exports = FeatureClusterer;

function FeatureClusterer(options) {
  this._options = util.extend({}, this.getDefaults(), options);
  this._createProjection(this._options.projection);
}

var ptp = FeatureClusterer.prototype;

ptp.clusterize = function (featuresCollection, options) {
  var options = util.extend({}, this._options, options);
  var clusterer = new GridClusterer(options);

  featuresCollection.features.forEach(function (data) {
    clusterer.add(new Feature(data, options));
  });

  return util.extend({}, featuresCollection, {
    features: clusterer.getResults().map(function (feature) {
      return feature.toJSON();
    })
  });
};

// Alias for serializer interface support.
ptp.serialize = ptp.clusterize;

ptp._createProjection = function (name) {
  this._options.projection = projection.create(name);
}

ptp.getDefaults = function () {
  return {
    gridSize: 80,
    margin: 10,
    projection: 'wgs84Mercator'
  };
};
