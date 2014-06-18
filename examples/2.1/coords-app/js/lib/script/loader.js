/**
 * @module script-loader
 * @description Load JS from external URL.
 */

ymaps.modules.define('script-loader', [
    'inherit',
    'vow'
], function (provide, inherit, vow) {

var ScriptLoader = inherit({
    load: function (url) {
        var defer = vow.defer(),
            head = document.getElementsByTagName('head')[0],
            script = document.createElement('script'),
            clear = function () {
                script.onload = script.onerror = null;
            };

        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = (location.protocol === 'file:' && !url.indexOf('//')? 'http:' : '') + url;
        script.onload = function () {
            defer.resolve();
            clear();
        };
        script.onerror = function (err) {
            defer.reject(err);
            clear();
        };

        head.insertBefore(script, head.lastChild);

        return defer.promise();
    }
});

provide(new ScriptLoader());

});
