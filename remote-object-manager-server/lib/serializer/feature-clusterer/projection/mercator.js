var util = require('../util');

module.exports = function (options) {
  var radius = options && options.radius || 6378137;
  // эксцентриситет
  var e = options && typeof options.e != 'undefined'? options.e : 0.0818191908426;
  // Флаг инверсного порядка координат
  var inverseOrder = options && options.coordOrder == 'latlong';
  // Четные степени эксцентриситета
  var e2 = e * e, e4 = e2 * e2, e6 = e4 * e2, e8 = e4 * e4;
  var subradius = 1 / radius;
  // Предвычисленные коэффициенты для быстрого обратного преобразования Меркатора
  // Подробнее см. тут: http://mercator.myzen.co.uk/mercator.pdf формула 6.52
  // Работает только при небольших значения эксцентриситета!
  var d2 = e2 / 2 + 5 * e4 / 24 + e6 / 12 + 13 * e8 / 360;
  var d4 = 7 * e4 / 48 + 29 * e6 / 240 + 811 * e8 / 11520;
  var d6 = 7 * e6 / 120 + 81 * e8 / 1120;
  var d8 = 4279 * e8 / 161280;

  var c_pi180 = Math.PI / 180;
  var c_180pi = 180 / Math.PI;

  this.mercatorToGeo = function (mercator) {
    var longitude = this.xToLongitude(mercator[0]);
    var latitude = this.yToLatitude(mercator[1]);

    return inverseOrder ? [latitude, longitude] : [longitude, latitude];
  };

  this.geoToMercator = function (geo) {
    return [
      this.longitudeToX(geo[inverseOrder ? 1 : 0]),
      this.latitudeToY(geo[inverseOrder ? 0 : 1])
    ];
  };

  this.xToLongitude = function (x) {
    return util.math.cycleRestrict(x * subradius, -Math.PI, Math.PI) * c_180pi;
  };

  this.yToLatitude = function (y) {
    var xphi = Math.PI * 0.5 - 2 * Math.atan(1 / Math.exp(y * subradius));
    var latitude = xphi + d2 * Math.sin(2 * xphi) + d4 * Math.sin(4 * xphi) + d6 * Math.sin(6 * xphi) + d8 * Math.sin(8 * xphi);

    return latitude * c_180pi;
  };

  this.longitudeToX = function (lng) {
    var longitude = util.math.cycleRestrict(lng * c_pi180, -Math.PI, Math.PI);

    return radius * longitude;
  };

  this.latitudeToY = function (lat) {
    var epsilon = 1e-10;
    // epsilon чтобы не получить (-)Infinity
    var latitude = util.math.restrict(lat, -90 + epsilon, 90 - epsilon) * c_pi180;
    var esinLat = e * Math.sin(latitude);

    // Для широты -90 получается 0, и в результате по широте выходит -Infinity
    var tan_temp = Math.tan(Math.PI * 0.25 + latitude * 0.5);
    var pow_temp = Math.pow(Math.tan(Math.PI * 0.25+ Math.asin(esinLat) * 0.5), e);
    var U = tan_temp / pow_temp;

    return radius * Math.log(U);
  };
};
