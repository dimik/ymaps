'use strict';

var inherit = require('inherit');
var ObjectID = require('mongodb').ObjectID;
var BaseModel = require('./base-mongodb');

module.exports = inherit(BaseModel, {
  __constructor: function () {
    this.__base.apply(this, arguments);

    this._type = 'readable';
  },
  find: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['find'].concat(args));
  },
  findOne: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['findOne'].concat(args));
  },
  count: function () {
    var args = Array.prototype.slice.call(arguments);

    return this.query.apply(this, ['count'].concat(args));
  },
  getById: function (id) {
    return this.findOne({ _id: new ObjectID(id) });
  }
});
