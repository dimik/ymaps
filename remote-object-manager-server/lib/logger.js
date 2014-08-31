var inherit = require('inherit');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Logger = inherit(EventEmitter, {
  __constructor: function (options) {
    this._options = options;
  },
  log: function (level, message) {
    if(arguments.length === 1) {
      level = 'debug';
      message = level;
    }

    var log = util.format('[%s] [%s] %s', new Date(Date.now()), level, this.process(message));

    this.emit(level, log);
    console.log(log);
  },
  process: function (message) {
    return (
      message.stack?
        message.stack : JSON.stringify(message)
    ).replace(/(\r\n|\n|\r)/gm, '').replace(/\s{1,}/gm, ' ');
  }
}, {
  LEVELS: [
    'debug',
    'info',
    'notice',
    'warning',
    'err',
    'crit',
    'alert',
    'emerg'
  ]
});

module.exports = new Logger();
