'use strict';

var util = require('util');
var worker = require('cluster').worker;
var domain = require('domain');
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var api = require('./routes/api');
var logger = require('./lib/logger');

app.use(bodyParser.json({ limit: 100000000 }));
app.use(function (req, res, next) {
  logger.log('info', { url: req.url, method: req.method, headers: req.headers });
  next();
});
app.use(uncaughtExceptionHandler);
app.use('/api/v1', api);
app.use(errorHandler);

var host = config.get('server:hostname');
var port = config.get('server:port');
var server = app.listen(port, host, function () {
  logger.log('info', util.format('Node server started on %s:%d', host, port));
});

// Expressjs middleware for handling errors.
function errorHandler(err, req, res, next) {
  logger.log('crit', err);
  res.status(400).json({
    "error": err.stack || JSON.stringify(err)
  });
  // next(err);
}

// Expressjs middleware for handling uncaught exceptions with domain and worker restarting.
function uncaughtExceptionHandler(req, res, next) {
  var d = domain.create();

  d.add(req);
  d.add(res);

  d.on('error', function (err) {
    logger.log('alert', err);
    // Make sure we close down within 5 seconds.
    var timer = setTimeout(function () {
      process.exit(1);
    }, 5000);
    // But don't keep the process open just for that!
    timer.unref();
    // stop taking new requests.
    server.close();
    // Let the master know we're dead. This will trigger a "disconnect" in the cluster master,
    // and then it will fork a new worker.
    worker.disconnect();
    // Try to send an error to the request that triggered the problem.
    try {
      res.status(500).json({
        "error": err.stack || JSON.stringify(err)
      });
    }
    catch (err) {
      // Oh well, not much we can do at this point.
      logger.log('emerg', err);
    }
  });

  d.run(next);
}
