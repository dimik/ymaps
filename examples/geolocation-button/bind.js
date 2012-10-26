// Fallback if bind is not supported.
if(!Function.prototype.bind) {
    Function.prototype.bind = function (ctx) {
        var fn = this,
            slice = Array.prototype.slice,
            args = slice.call(arguments, 1);

        return function () {
            fn.apply(ctx, args.concat(slice.call(arguments, 0)));
        };
    };
}
