module.exports = FeaturePixelGeometry;

function FeaturePixelGeometry(geometry, options) {
  this._geometry = geometry;
  this._options = options;
}

var ptp = FeaturePixelGeometry.prototype;

ptp.getCoordinates = function () {
  var options = this._options;

  return options.projection.toGlobalPixels(this._geometry.coordinates, options.zoom);
};

ptp.setCoordinates = function (coordinates) {
  var options = this._options;

  this._geometry.coordinates = options.projection.fromGlobalPixels(coordinates, options.zoom);
};

ptp.getType = function () {
    return this._geometry.type;
};
