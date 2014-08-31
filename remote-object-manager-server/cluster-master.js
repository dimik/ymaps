'use strict';

var util = require('util');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var logger = require('./lib/logger');

function createWorker() {
  var worker = cluster.fork();
  logger.log('info', util.format('Worker %d forked', worker.process.pid));
}

for(var i = 0; i < numCPUs; i++) {
  createWorker();
}

cluster.on('exit', function (worker, code, signal) {
  logger.log('alert', util.format('Worker %d died (%s).', worker.process.pid, signal || code));
  switch(code) {
    case 1:
      logger.log('alert', 'Restarting...');
      createWorker();
      break;
  }
});

var signals = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  /**
   * Removed 'SIGKILL' from the list.
   * Cannot have a listener installed, it will unconditionally terminate node on all platforms.
   * @see http://nodejs.org/api/process.html#process_signal_events
   */
  '',
  'SIGUSR1',
  'SIGSEGV',
  'SIGUSR2',
  /**
   * Removed 'SIGPIPE' from the list.
   * Issue is the haproxy request results in a SIGPIPE as it closes the connection.
   * @see https://bugzilla.redhat.com/show_bug.cgi?id=852598
   */
  '',
  'SIGALRM',
  'SIGTERM'
];

signals.forEach(function (signal, index) {
  if(signal) {
    process.on(signal, function () {
      logger.log('alert', util.format('Received %s – terminating process', signal));
      cluster.disconnect(function () {
        process.exit(128 + index + 1);
      });
    });
  }
});

process.on('exit', function (code) {
  logger.log('alert', util.format('Node process stopped (%d)', code));
});
