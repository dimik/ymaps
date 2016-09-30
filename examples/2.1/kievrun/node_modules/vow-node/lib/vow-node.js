var vow = require('vow'),
    slice = Array.prototype.slice,
    vowNode = module.exports = {
        promisify : function(nodeFn) {
            return function() {
                var args = slice.call(arguments);
                args.unshift(nodeFn);
                return vowNode.invoke.apply(this, args);
            }
        },

        invoke : function(nodeFn) {
            var deferred = vow.defer(),
                args = slice.call(arguments, 1);

            args.push(function(err, val) {
                err == null?
                    deferred.resolve(val) :
                    err instanceof Error?
                        deferred.reject(err) :
                        deferred.resolve(err);
            });

            try {
                nodeFn.apply(this, args);
            }
            catch(e) {
                deferred.reject(e);
            }

            return deferred.promise();
        }
    };
