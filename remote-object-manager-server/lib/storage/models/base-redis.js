'use strict';

var inherit = require('inherit');
var connector = require('../redis-connector');
var vow = require('vow');

module.exports = inherit({
  __constructor: function (name) {
    this._name = name;
  },
  getName: function () {
    return this._name;
  },
  get: function (key) {
    var defer = vow.defer();

    connector.getConnection()
      .then(function (connection) {
        connection.get(key, function (err, data) {
          if(err) {
            defer.reject(err);
          }
          else {
            defer.resolve(data);
          }
          // connection.quit();
        });
      }, defer.reject, defer);

    return defer.promise();
  },
  set: function (key, data, ttl) {
    var defer = vow.defer();

    connector.getConnection()
      .then(function (connection) {
        connection.multi()
          .set(key, data)
          .expire(key, ttl)
          .exec(function (err, stat) {
            if(err) {
              defer.reject(err);
            }
            else {
              defer.resolve(stat);
            }
            // connection.quit();
          });
      }, defer.reject, defer);

    return defer.promise();
  }
});
