'use strict';

var inherit = require('inherit');
var _ = require('underscore');
var BaseModel = require('./base-mongodb-readable');

module.exports = inherit(BaseModel, {
  __constructor: function () {
    this.__base.apply(this, arguments);
  },
  findInBounds: function (bounds) {
    return this.find({
      "geometry.coordinates": {
        "$geoWithin": { "$box": bounds }
      }
    });
  },
  findInside: function (geometry) {
    return this.find({
      "geometry.coordinates": {
        "$geoWithin": { "$geometry": geometry }
      }
    });
  },
  findNear: function (ccordinates, params) {
    return this.find({
      "$near": _.extend({
        "$geometry": {
          "type": "Point",
          "coordinates": ccordinates
        }
      }, params)
    });
  },
});
