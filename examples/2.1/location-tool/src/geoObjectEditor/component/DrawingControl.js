ym.modules.define('GeoObjectEditor.component.DrawingControl', [
    'util.extend',
    'control.Button',
    'control.RadioGroup'
], function (provide, extend, Button, RadioGroup) {
    var defaultOptions = {
        float: 'left'
    };
    var DrawingControl = function (options) {
        var placemarkBtn = new Button({
            data: {
                geometryType: 'Point',
                image: 'i/button-placemark.png'
            }
        });
        var polylineBtn = new Button({
            data: {
                geometryType: 'LineString',
                image: 'i/button-polyline.png'
            }
        });
        var polygonBtn = new Button({
            data: {
                geometryType: 'Polygon',
                image: 'i/button-polygon.png'
            }
        });
        var radioGroup = new RadioGroup(extend(defaultOptions, options));

        radioGroup
            .add(placemarkBtn)
            .add(polylineBtn)
            .add(polygonBtn);

        return radioGroup;
    };

    provide(DrawingControl);
});
