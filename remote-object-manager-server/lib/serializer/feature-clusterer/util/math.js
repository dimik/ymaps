exports.cycleRestrict = function (value, min, max) {
  if(value == Number.POSITIVE_INFINITY) {
    return max;
  }
  else if(value == Number.NEGATIVE_INFINITY) {
    return min;
  }

  return value - Math.floor((value - min) / (max - min)) * (max - min);
};

exports.restrict = function (value, min, max) {
  return Math.max(Math.min(value, max), min);
};
