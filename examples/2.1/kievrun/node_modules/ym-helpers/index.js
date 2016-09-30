var glob = require('glob'),
    modules = require('ym');

modules.setOptions({
    trackCircularDependencies: false,
    allowMultipleDeclarations: false
});

glob.sync(__dirname + '/modules/**/*.js').forEach(require);

module.exports = modules;