'use strict';

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

function createWorker() {
  var worker = cluster.fork();
  console.log('Worker %d forked', worker.process.pid);
}

for(var i = 0; i < numCPUs; i++) {
  createWorker();
}

cluster.on('exit', function (worker, code, signal) {
  console.log('Worker %d died (%s).', worker.process.pid, signal || code);
  switch(code) {
    case 1:
      console.log('Restarting...');
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
      console.log('%s: Received %s – terminating process...', Date(Date.now()), signal);
      cluster.disconnect(function () {
        process.exit(128 + index + 1);
      });
    });
  }
});

process.on('exit', function (code) {
  console.log('%s: Node process stopped (%d)', Date(Date.now()), code);
});
