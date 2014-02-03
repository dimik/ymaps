define(['jquery', 'ready!ymaps', 'module', 'jquery-tmpl'], function (jQuery, ymaps, module) {

    var config = module.config();

    function DOMView() {
        this._container = jQuery(config.container);
        this._template = jQuery(config.template);
    }

    DOMView.prototype = {
        constructor: DOMView,
        render: function (data) {
            this._container
                .html($.tmpl(this._template, {
                    results: data
                }, {
                    formatter: ymaps.formatter
                }));

            return this;
        },
        clear: function () {
            this._container
                .empty();

            return this;
        }
    };

    return DOMView;

});
