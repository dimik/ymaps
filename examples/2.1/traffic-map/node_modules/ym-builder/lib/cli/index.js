var minimist = require('minimist');

var ACTIONS = ['help', 'configure', 'build', 'watch'];

var args = parseArgs();

if (args.action == 'help') {
    require('./help')();

} else if (args.action == 'configure') {
    require('./configure')(args.projectDir, args.target, args.force);

} else if (args.action == 'build' || args.action == 'watch') {
    require('./runGulp')(args.projectDir, 'ym-' + args.action);
}

function parseArgs () {
    var args = minimist(process.argv),
        firstArgIsAction = ACTIONS.indexOf(args._[2]) != -1,
        action = (args.help || args.h) ? 'help' : (firstArgIsAction ? args._[2] : 'build'),
        cwd = (firstArgIsAction ? args._[3] : args._[2]) || process.cwd(),
        target = args._.slice(firstArgIsAction ? 3 : 2).join(' ').match(/(build\.json|gulpfile)/g);

    return {
        action: action,
        projectDir: cwd,
        force: args.f || args.force,
        target: target
    };
}