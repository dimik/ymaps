define(['ready!ymaps', 'jquery'], function (ymaps, $) {

    var views = {
        StrechyIconContent: ymaps.templateLayoutFactory.createClass('<span>$[properties.name]</span>'),

        BalloonContent: ymaps.templateLayoutFactory.createClass([
            '<div>',
                '<h3>$[properties.name]</h3>',
                '<p class="lead">$[properties.description]</p>',
                '[if properties.address]<address>$[properties.address]</address>[endif]',
            '</div>'
        ].join(''))
    };

    function GeoObjectView() {}

    (function () {
        this.getLayout = function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        };
    }).call(GeoObjectView.prototype);

    return GeoObjectView;
});

