define(['ready!ymaps', 'RollupButtonView'], function (ymaps, RollupButtonView) {

    function RollupButton() {
        var geometries = ['Point', 'Polyline', 'Polygon', 'Rectangle', 'Circle'],
            items = geometries.map(function (geometry) {
                return new ymaps.control.Button({
                    data: {
                        title: 'Создать ' + geometry,
                        geometry: geometry.toLowerCase()
                    }
                }, {
                    layout: RollupButtonView
                });
            });

        RollupButton.superclass.constructor.call(this, items);
    }

    ymaps.util.augment(RollupButton, ymaps.control.RollupButton, {

    });

    return RollupButton;
});
