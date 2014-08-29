var inherit = require('inherit');
var BaseSerializer = require('./base');
var _ = require('underscore');

module.exports = inherit(BaseSerializer, {
  __constructor: function () {
    this.__base.apply(this, arguments);
  },
  serialize: function (featureCollection, options) {
    return _.extend({}, featureCollection, {
      features: featureCollection.features
        .map(function (feature) {
          return feature.geometry.type === 'MultiPoint'?
            this._serialize(feature) : feature;
        }, this)
    });
  },
  _serialize: function (feature) {
    return {
      "type": "Cluster",
      "id": feature.id,
      "number": feature.properties.length,
      "bbox": [ feature.bbox.slice(0, 2), feature.bbox.slice(2, 4) ],
      // Массив, описывающий объекты в составе кластера.
      // Необязательное поле.
      // "features": [...],
      "geometry": {
        "type": "Point",
        "coordinates": feature.geometry.coordinates[0]
      },
      "properties": {
        "iconContent": feature.properties.length
      }
    };
  }
});
