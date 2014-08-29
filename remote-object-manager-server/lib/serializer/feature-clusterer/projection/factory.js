var util = require('../util');
var GeoToGlobalPixelsProjection = require('./geo-to-global-pixels');

var params = {
  wgs84Mercator: {},
  sphericalMercator: { e: 0 }
};

module.exports = function (options) {
  this.create = function (projection) {
    return new GeoToGlobalPixelsProjection(util.extend({}, options, params[projection]));
  };
};
