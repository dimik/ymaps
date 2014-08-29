#!/bin/env node

var cluster = require('cluster');

if(cluster.isMaster) {
  require('./cluster-master');
}
else if(cluster.isWorker) {
  require('./app-worker');
}
