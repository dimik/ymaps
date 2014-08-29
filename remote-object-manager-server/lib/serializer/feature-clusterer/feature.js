var util = require('./util');
var FeatureGeometry = require('./feature-geometry');

module.exports = Feature;

function Feature(data, options) {
  this._data = data;
  this._options = options;
  this.geometry = new FeatureGeometry(data.geometry, options);
}

var ptp = Feature.prototype;

ptp.getId = function () {
  return util.stamp(this);
};

ptp.toJSON = function () {
  return this._data;
};
