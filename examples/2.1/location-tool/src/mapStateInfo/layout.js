ym.modules.define('layout.MapStateInfoWindowLayout', [
    'templateLayoutFactory',
    'layout.storage',
    'template.filter.json'
], function (provide, templateLayoutFactory, layoutStorage) {
    var MapStateInfoWindowLayout = templateLayoutFactory.createClass([
        '<div class="popover top mapstateinfo-window">',
            '<div class="popover-inner">',
            '<form class="form-horizontal">',
                '<div class="control-group">',
                    '<label class="control-label" for="markerCenter">Метка</label>',
                    '<div class="controls">',
                        '<input type="text" id="markerCenter" class="input-mini" value="{{ data.markerCenter|json }}">',
                    '</div>',
                '</div>',
                '<div class="control-group">',
                    '<label class="control-label" for="mapZoom">Масштаб</label>',
                    '<div class="controls">',
                        '<input type="text" id="mapZoom" class="input-mini" value="{{ data.mapZoom }}">',
                    '</div>',
                '</div>',
                '<div class="control-group">',
                    '<label class="control-label" for="mapCenter">Центр</label>',
                    '<div class="controls">',
                        '<input type="text" id="mapCenter" class="input-mini" value="{{ data.mapCenter|json }}">',
                    '</div>',
                '</div>',
                '<div class="control-group">',
                    '<label class="control-label" for="mapBounds">Область</label>',
                    '<div class="controls">',
                        '<input type="text" id="mapBounds" class="input-mini" value="{{ data.mapBounds|json }}">',
                    '</div>',
                '</div>',
                '<input type="submit" style="position: absolute; left: -9999px"/>',
            '</form>',
            '</div>',
        '</div>'
    ].join(''), {
        build: function () {
            MapStateInfoWindowLayout.superclass.build.call(this);

            this._setupListeners();
        },
        clear: function () {
            this._clearListeners();

            MapStateInfoWindowLayout.superclass.clear.call(this);
        },
        _setupListeners: function () {
            var element = this.getElement();

            jQuery('form', element).on('submit', jQuery.proxy(this._onStateSubmit, this));
        },
        _clearListeners: function () {
            var element = this.getElement();

            jQuery('form', element).off('submit');
        },
        _parseCoordinates: function (s) {
            return s.match(/[\d.]+/g).map(Number);
        },
        _onStateSubmit: function (e) {
            e.preventDefault();

            var element = this.getElement();
            var newState = {};
            var mapCenter = jQuery('#mapCenter', element);
            var mapZoom = jQuery('#mapZoom', element);
            var mapBounds = jQuery('#mapBounds', element);
            var center = this._parseCoordinates(mapCenter.val());
            var zoom = Number.parseFloat(mapZoom.val());
            var bbox = this._parseCoordinates(mapBounds.val());

            if(center.every(isFinite) && center.length === 2 && mapCenter.val() != mapCenter[0].defaultValue) {
                newState['mapCenter'] = center;
            }
            if(zoom >= 0 && mapZoom.val() != mapZoom[0].defaultValue) {
                newState['mapZoom'] = zoom;
            }
            if(bbox.every(isFinite) && bbox.length === 4 && mapBounds.val() != mapBounds[0].defaultValue) {
                newState['mapBounds'] = [bbox.slice(0, 2), bbox.slice(2, 4)];
            }

            this.getData().control.state.set(newState);
        }
    });

    layoutStorage.add('mapstate#window', MapStateInfoWindowLayout);

    provide(layoutStorage);
    // provide(MapStateInfoWindowLayout);
});
