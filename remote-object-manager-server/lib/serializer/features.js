var inherit = require('inherit');
var BaseSerializer = require('./base');
var _ = require('underscore');

module.exports = inherit(BaseSerializer, {
  __constructor: function () {
    this.__base.apply(this, arguments);
  },
  serialize: function (features, options) {
    return {
      type: 'FeatureCollection',
      features: features.map(function (feature) {
        // Only public properties
        var result = _.omit(feature, function (value, key, object) {
          return key[0] === '_';
        });

        // Explicitly add "id"
        result.id = feature._id;

        return result;
      })
    };
  }
});
