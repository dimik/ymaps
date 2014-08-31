var inherit = require('inherit');
var Base = require('./base-redis');

module.exports = inherit(Base, {
  __constructor: function () {
    this.__base.apply(this, arguments);

    this._delim = '__';
  },
  get: function (key) {
    return this.__base.call(this, this._createKey(key))
      .then(function (data) {
        return JSON.parse(data);
      });
  },
  set: function (key, data, ttl) {
    return this.__base.call(this, this._createKey(key), JSON.stringify(data), ttl);
  },
  _createKey: function (key) {
    return this._name + this._delim + key;
  }
});
