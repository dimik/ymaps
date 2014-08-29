'use strict';

var worker = require('cluster').worker;
var domain = require('domain');
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var api = require('./routes/api');

app.use(bodyParser.json());
app.use(uncaughtExceptionHandler);
app.use('/api', api);
app.use(errorHandler);

var host = config.get('server:hostname');
var port = config.get('server:port');
var server = app.listen(port, host, function () {
  console.log('%s: Node server started on %s:%d ...', Date(Date.now()), host, port);
});

// Expressjs middleware for handling errors.
function errorHandler(err, req, res, next) {
  console.error('Express error', err);
  res.status(500).json({
    "error": err.message,
    "stack": err.stack
  });
  // next(err);
}

// Expressjs middleware for handling uncaught exceptions with domain and worker restarting.
function uncaughtExceptionHandler(req, res, next) {
  var d = domain.create();

  d.add(req);
  d.add(res);

  d.on('error', function (err) {
    console.error('Domain error', err);
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
        "error": err.message,
        "stack": err.stack
      });
    }
    catch (err) {
      // Oh well, not much we can do at this point.
      console.error('Error sending 500!', err);
    }
  });

  d.run(next);
}
