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
            MapStateInfoWindowLayout.superclass.clear.call(this);
        },
        _setupListeners: function () {
            var element = this.getElement();

            jQuery('form', element).on('submit', jQuery.proxy(this._onStateSubmit, this));

            /*
            jQuery(element)
                .on('keyup', '#mapCenter', jQuery.debounce(this._onMapCenterChange, 1000, this))
                .on('keyup', '#mapZoom', jQuery.debounce(this._onMapZoomChange, 1000, this))
                .on('keyup', '#mapBounds', jQuery.debounce(this._onMapBoundsChange, 1000, this));
                */
        },
        _clearListeners: function () {
        },
        _onStateSubmit: function (e) {
            e.preventDefault();

            var element = this.getElement();
            var mapCenter = jQuery('#mapCenter', element).val();
            var mapZoom = jQuery('#mapZoom', element).val();
            var mapBounds = jQuery('#mapBounds', element).val();
            var newState = {};
            try {
                var center = mapCenter.match(/([\d.]+),([\d.]+)/).slice(1, 3).map(Number);

                if(center.every(isFinite)) {
                    newState['mapCenter'] = center;
                }
            }
            catch(e) {}
            var zoom = Number.parseFloat(mapZoom);
            if(zoom >= 0) {
                newState['mapZoom'] = zoom;
            }

            this.getData().control.state.set(newState);
        },
        _onMapCenterChange: function (e) {
            try {
                var coords = e.target.value.match(/([\d.]+),([\d.]+)/).slice(1, 3).map(Number);

                if(Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
                    this.getData().control.state.set('mapCenter', coords);
                }
            }
            catch(e) {}
        },
        _onMapZoomChange: function (e) {
            var zoom = Number.parseFloat(e.target.value);

            if(zoom >= 0) {
                this.getData().control.state.set('mapZoom', zoom);
            }
        },
        _onMapBoundsChange: function (e) {

        }
    });

    layoutStorage.add('mapstate#window', MapStateInfoWindowLayout);

    provide(layoutStorage);
    // provide(MapStateInfoWindowLayout);
});
