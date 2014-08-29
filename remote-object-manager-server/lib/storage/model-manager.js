'use strict';

var inherit = require('inherit');

module.exports = inherit({
  __constructor: function (models) {
    this._models = {};
    models.forEach(this.add, this);
  },
  get: function (name) {
    return this._models[name];
  },
  add: function (name) {
    var Model = require('./models/' + name);

    this._models[name] = new Model(name);
  },
  remove: function (name) {
    delete this._models[name];
  }
}, {
  create: function (models) {
    return new this(models);
  }
});
