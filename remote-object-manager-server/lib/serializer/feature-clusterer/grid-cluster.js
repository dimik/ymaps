var util = require('./util');

module.exports = GridCluster;

function GridCluster(cell, options) {
  this._cell = cell;
  this._options = options;
}

var ptp = GridCluster.prototype;

ptp.getPixelBounds = function () {
  var xPoints = [];
  var yPoints = [];

  this._cell.forEach(function (feature) {
    var pixelPoint = feature.geometry.getPixelGeometry().getCoordinates();

    xPoints.push(pixelPoint[0]);
    yPoints.push(pixelPoint[1]);
  });

  return [
    Math.min.apply(Math, xPoints),
    Math.min.apply(Math, yPoints),
    Math.max.apply(Math, xPoints),
    Math.max.apply(Math, yPoints)
  ];
};

ptp.getBounds = function () {
  var options = this._options;
  var pixelBounds = this.getPixelBounds();
  var sw = options.projection.fromGlobalPixels([pixelBounds[0], pixelBounds[3]], options.zoom);
  var ne = options.projection.fromGlobalPixels([pixelBounds[2], pixelBounds[1]], options.zoom);

  return [ sw[0], sw[1], ne[0], ne[1] ];
};

ptp.getPixelCenter = function () {
  var pixelBounds = this.getPixelBounds();

  return [
    (pixelBounds[0] + pixelBounds[2]) / 2,
    (pixelBounds[1] + pixelBounds[3]) / 2
  ];
};

ptp.getCenter = function () {
  var cell = this._cell;
  var options = this._options;
  var pixelCenter = this.getPixelCenter();
  var cellCenter = cell.getCenter();
  var cellHalfSize = cell.getSize() / 2;
  var offset = cellHalfSize - Math.min(options.margin, cellHalfSize);
  var x = Math.max(cellCenter[0] - offset, pixelCenter[0]);
  x = Math.min(cellCenter[0] + offset, x);
  var y = Math.max(cellCenter[1] - offset, pixelCenter[1]);
  y = Math.min(cellCenter[1] + offset, y);

  return options.projection.fromGlobalPixels([x, y], options.zoom);
};

ptp.toJSON = function () {
  return {
    "id": util.stamp(this),
    "type": "Feature",
    "bbox": this.getBounds(),
    "geometry": {
      "type": "MultiPoint",
      "coordinates": [this.getCenter()]
    },
    "properties": {
      "length": this._cell.getLength()
    }
  };
};
