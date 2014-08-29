var inherit = require('inherit');

module.exports = inherit({
  __constructor: function (options) {
    this._options = options;
  },
  serialize: function (data, options) {
    return data;
  }
});
