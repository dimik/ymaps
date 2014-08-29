var Grid = require('./grid');
var GridCluster = require('./grid-cluster');

module.exports = GridClusterer;

function GridClusterer(options) {
  this._options = options;
  this._grid = new Grid(options.gridSize);
}

var ptp = GridClusterer.prototype;

ptp.add = function (feature) {
  this._grid.add(feature, feature.geometry.getPixelGeometry().getCoordinates());
};

ptp.remove = function (feature) {
  this._grid.remove(feature, feature.geometry.getPixelGeometry().getCoordinates());
};

ptp.getResults = function () {
  var results = [];

  this._grid.forEach(function (cell) {
    results.push(
      cell.getLength() > 1?
        new GridCluster(cell, this._options) : cell.getData()[0]
    );
  }, this);

  return results;
};
