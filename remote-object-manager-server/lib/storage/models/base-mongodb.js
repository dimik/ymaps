'use strict';

var inherit = require('inherit');
var MongoConnector = require('../mongodb-connector');
var vow = require('vow');

module.exports = inherit({
  __constructor: function (name) {
    this._name = name;
    this._connector = new MongoConnector();
  },
  getName: function () {
    return this._name;
  },
  query: function (method) {
    var defer = vow.defer();
    var name = this._name;
    var args = Array.prototype.slice.call(arguments, 1);

    this._connector.getConnection()
      .done(function (connection) {
        var collection = connection.collection(name);

        collection[method].apply(collection, args.concat(function (err, cursor) {
          if(err) {
            defer.reject(err);
            connection.close();
          }
          else {
            // cursor?
            if(cursor && typeof cursor.toArray === 'function') {
              cursor.toArray(function (err, docs) {
                if(err) {
                  defer.reject(err);
                }
                else {
                  defer.resolve(docs);
                  cursor.close();
                }
                connection.close();
              });
            }
            else {
              defer.resolve(cursor);
              connection.close();
            }
          }
        }));
      }, defer.reject, defer);

    return defer.promise();
  }
});
