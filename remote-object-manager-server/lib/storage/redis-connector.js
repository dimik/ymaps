'use strict';

var redis = require('redis');
var config = require('../../config').get('redis');
var inherit = require('inherit');
var vow = require('vow');

var ConnectionManager = inherit({
  __constructor: function () {
    this._connection = null;
  },
  getConnection: function () {
    if(this._connection) {
      return vow.resolve(this._connection);
    }

    return this._connect();
  },
  _connect: function () {
    var client = redis.createClient(config.port, config.hostname);
    var defer = vow.defer();

    client.auth(config.password);
    client.on('ready', function () {
      client.unref();
      defer.resolve(this._connection = client);
    }.bind(this))
    .on('err', function (err) {
      defer.reject(err);
    });

    return defer.promise();
  }
});

module.exports = new ConnectionManager();
