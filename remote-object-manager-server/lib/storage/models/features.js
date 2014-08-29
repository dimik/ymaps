'use strict';

var inherit = require('inherit');
var BaseModel = require('./base-mongo-geo-entity');

module.exports = inherit(BaseModel, {
  __constructor: function () {
    this.__base.apply(this, arguments);
  },
});
