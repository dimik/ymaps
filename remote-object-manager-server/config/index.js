"use strict";

var nconf = require('nconf');
var env = process.env;

module.exports = nconf;

nconf.argv();
nconf.file("local", __dirname + '/local.json');

nconf.defaults({
  "server": {
    "protocol": "http:",
    "hostname": env["OPENSHIFT_NODEJS_IP"],
    "port": env["OPENSHIFT_NODEJS_PORT"]
  },
  "mongo": {
    "protocol": "mongodb:",
    "hostname": env["OPENSHIFT_MONGODB_DB_HOST"],
    "port": env["OPENSHIFT_MONGODB_DB_PORT"],
    "username": env["OPENSHIFT_MONGODB_DB_USERNAME"],
    "password": env["OPENSHIFT_MONGODB_DB_PASSWORD"],
    "socket": env["OPENSHIFT_MONGODB_DB_SOCKET"],
    "url": env["OPENSHIFT_MONGODB_DB_URL"],
    "database": "nodejs"
  }
});
