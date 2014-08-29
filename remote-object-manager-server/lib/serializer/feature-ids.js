var inherit = require('inherit');
var BaseSerializer = require('./base');

module.exports = inherit(BaseSerializer, {
  __constructor: function () {
    this.__base.apply(this, arguments);
  },
  serialize: function (featuresCollection, options) {
    return featuresCollection.features.map(function (feature) {
      return feature.id;
    });
  }
});
