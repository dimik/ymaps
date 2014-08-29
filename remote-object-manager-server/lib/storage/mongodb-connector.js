'use strict';

var config = require("../../config").get('mongo');
var client = require('mongodb').MongoClient;
var vow = require('vow');
var inherit = require('inherit');
var url = require('url');
var _ = require('underscore');

module.exports = inherit({
  getConnection: function () {
    var defer = vow.defer();
    var auth = config.username && {
      auth: config.username + ':' + config.password
    };
    var href = url.format(_.extend({
      pathname: config.database,
      slashes: true
    }, config, auth));

    client.connect(href, function (err, db) {
      if(err) {
        defer.reject(err);
      }
      else {
        defer.resolve(db);
      }
    });

    return defer.promise();
  }
});
