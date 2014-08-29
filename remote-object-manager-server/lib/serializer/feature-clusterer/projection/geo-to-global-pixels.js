var MercatorProjection = require('./mercator');
var util = require('../util');

module.exports = function (options) {
  var radius = options && options.radius || 6378137;
  var equator = 2 * Math.PI * radius;
  var subequator = 1 / equator;
  var halfEquator = equator / 2;
  var currentZoom = 0;
  var c_180pi = 180 / Math.PI;
  var pixelsPerMeter = 256 * subequator;
  var inverseOrder = options && options.coordOrder == 'latlong';

  this._mercator = new MercatorProjection(options);

  this.fromGlobalPixels = function (vector, zoom) {
    if(zoom != currentZoom) {
      pixelsPerMeter = Math.pow(2, zoom + 8) * subequator;
      currentZoom = zoom;
    }
    var longitude = this._globalPixelXToGeo(vector[0], zoom);
    var latitude = this._mercator.yToLatitude(halfEquator - vector[1] / pixelsPerMeter);

    return inverseOrder ? [latitude, longitude] : [longitude, latitude];
  };

  this.toGlobalPixels = function (point, zoom) {
    if(zoom != currentZoom) {
      pixelsPerMeter = Math.pow(2, zoom + 8) * subequator;
      currentZoom = zoom;
    }

    var mercatorCoords = this._mercator.geoToMercator(point);

    return [
      (halfEquator + mercatorCoords[0]) * pixelsPerMeter,
      (halfEquator - mercatorCoords[1]) * pixelsPerMeter
    ];
  };

  this.distanceToGlobalPixels = function (point, distance, zoom) {
    var meterPerPixels = (equator * Math.cos(point[inverseOrder ? 0 : 1] * Math.PI / 180)) / Math.pow(2, zoom + 8);

    return Math.abs(distance / meterPerPixels);
  };

  this.isCycled = function () {
    return [true, false];
  };

  // Метод для прямого перевода пиксельных координат по x в градусы.
  // Сделан в обход стандартных преобразований пиксели -> метры -> градусы
  // из-за больших потерей точности при делении и умножении на радиус сферы.
  this._globalPixelXToGeo = function (x, zoom) {
    return util.math.cycleRestrict(Math.PI * x / Math.pow(2, zoom + 7) - Math.PI, -Math.PI, Math.PI) * c_180pi;
  };
};
