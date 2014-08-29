'use strict';

var inherit = require('inherit');
var BaseModel = require('./base-mongodb-writable');

module.exports = inherit(BaseModel, {
  __constructor: function () {
    this.__base.call(this, 'features');
  }
});
