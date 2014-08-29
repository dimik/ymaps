'use strict';

var inherit = require('inherit');
var BaseModel = require('./base-mongodb-readable');

module.exports = inherit(BaseModel, {
  __constructor: function () {
    this.__base.apply(this, arguments);

    this._type = 'writable';
  },
  insert: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['insert'].concat(args));
  },
  update: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['update'].concat(args));
  },
  remove: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['remove'].concat(args));
  }
});
