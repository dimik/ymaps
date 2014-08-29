exports.math = require('./math');

exports.stamp = (function () {
  var ids = 0;
  var key = '__id';

  return function (obj) {
    if(obj[key]) {
      return obj[key];
    }

    return obj[key] = ids++;
  };
}());

exports.extend = function (target) {
  var slice = Array.prototype.slice;
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  slice.call(arguments, 1).forEach(function (o) {
    for(var key in o) {
      hasOwnProperty.call(o, key) && (target[key] = o[key]);
    }
  });

  return target;
};
