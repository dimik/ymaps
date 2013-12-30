define(['ready!ymaps', 'jquery', 'module'], function (ymaps, jQuery, module) {

'use strict';

var config = module.config();

function GeoObjectsModel() {
    this.events = jQuery({});
}

GeoObjectsModel.prototype = {
    constructor: GeoObjectsModel,
    load: function () {
        jQuery.ajax({
            url: config.url,
            dataType: 'json',
            context: this,
            success: this._onSuccess,
            error: this._onError
        });
    },
    _onSuccess: function (json) {
        this.events.trigger(jQuery.Event('loaded', {
            geoObjects: json
        }));
    },
    _onError: function (jqXhr, textStatus, error) {
        this.events.trigger(jQuery.Event('failed', {
            message: error
        }));
    }
};

return GeoObjectsModel;

});
