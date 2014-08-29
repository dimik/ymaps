var inherit = require('inherit');

module.exports = inherit({
  __constructor: function (data) {
    this._data = data;
  },
  getData: function () {
    return this._data;
  },
  setData: function () {
    return this._data;
  },
  serialize: function (serializer, options) {
    return this.__self.create(serializer.serialize(this._data, options));
  },
  toJSON: function () {
    return JSON.stringify(this._data);
  }
}, {
  create: function (data) {
    return new this(data);
  }
});
