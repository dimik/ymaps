var FeaturePixelGeometry = require('./feature-pixel-geometry');

module.exports = FeatureGeometry;

function FeatureGeometry(geometry, options) {
  this._geometry = geometry;
  this._options = options;
  this._pixelGeometry = new FeaturePixelGeometry(geometry, options);
}

var ptp = FeatureGeometry.prototype;

ptp.getCoordinates = function () {
  return this._geometry.coordinates;
};

ptp.setCoordinates = function (coordinates) {
  this._geometry.coordinates = coordinates;
};

ptp.getType = function () {
  return this._geometry.type;
};

ptp.getPixelGeometry = function () {
  return this._pixelGeometry;
};
