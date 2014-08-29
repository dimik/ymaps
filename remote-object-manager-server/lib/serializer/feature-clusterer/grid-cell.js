module.exports = GridCell;

function GridCell(x, y, size) {
  this._x = x;
  this._y = y;
  this._size = size;
  this._data = [];
}

var ptp = GridCell.prototype;

ptp.add = function (obj) {
  return this._data.push(obj);
};

ptp.remove = function (obj) {
  var data = this._data;
  var index = data.indexOf(obj);

  if(index > -1) {
    data.splice(index, 1);

    return true;
  }

  return false;
};

ptp.getData = function () {
  return this._data;
};

ptp.setData = function (data) {
  this._data = data;
};

ptp.clear = function () {
  this._data = [];
};

ptp.getLength = function () {
  return this._data.length;
};

ptp.getSize = function () {
  return this._size;
};

ptp.forEach = function (fn, ctx) {
  var data = this._data;

  for(var i = 0, len = data.length; i < len; i++) {
    fn.call(ctx, data[i]);
  }
};

ptp.getCenter = function () {
  var size = this._size;

  return [
    this._x * size + size / 2,
    this._y * size + size / 2
  ];
};

ptp.getSquare = function () {
  return Math.pow(this._size, 2);
};
