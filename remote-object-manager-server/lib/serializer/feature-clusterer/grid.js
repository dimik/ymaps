var GridCell = require('./grid-cell');

module.exports = Grid;

function Grid(cellSize) {
  this._cellSize = cellSize;
  this._grid = {};
  // this._points = {};
}

var ptp = Grid.prototype;

ptp.add = function (obj, point) {
  var x = this.toCellNumber(point[0]);
  var y = this.toCellNumber(point[1]);
  var grid = this._grid;
  var row = grid[y] = grid[y] || {};
  var cell = row[x] = row[x] || new GridCell(x, y, this._cellSize);

  // this._points[obj.getId()] = point;
  cell.add(obj);
};

ptp.update = function (obj, point) {
  this.remove(obj, point);
  this.add(obj, point);
};

ptp.remove = function (obj, point) {
  var x = this.toCellNumber(point[0]);
  var y = this.toCellNumber(point[1]);
  var grid = this._grid;
  var row = grid[y];
  var cell = row && row[x];

  // delete this._points[obj.getId()];
  if(cell) {
    cell.remove(obj);
  }
};

ptp.forEach = function (fn, ctx) {
  var grid = this._grid;

  for(var y in grid) {
    for(var x in grid[y]) {
      fn.call(ctx, grid[y][x]);
    }
  }
};

ptp.toCellNumber = function (pos) {
  return Math.floor(pos / this._cellSize);
};

ptp.getDistance = function (point1, point2) {
  var dx = point2[0] - point1[0];
  var dy = point2[1] - point1[1];

  return dx * dx + dy * dy;
};
