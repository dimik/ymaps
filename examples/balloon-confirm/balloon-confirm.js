function BalloonConfirm(balloon, action) {
    this._action = action;

    balloon.events.add('open', this._onMapBalloonOpen, this);
    balloon.events.add('close', this._onMapBalloonclose, this);
}

BalloonConfirm.prototype = {
    constructor: BalloonConfirm,
    _onMapBalloonOpen: function (e) {
        var balloon = this._balloon = e.get('balloon'),
            position = this._position = balloon.getPosition(),
            button = this._button = balloon.getOverlay().getLayout().getConfirmButton();

        button.on('click', $.proxy(this._onConfirmButtonClick, this));
    },
    _onMapBalloonClose: function (e) {
        this._button.off('click');
    },
    _onConfirmButtonClick: function () {
        this._action(this._position);
        this._balloon.close();
    }
};

ymaps.ready(function () {
    /**
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/templateLayoutFactory.xml
     */
    BalloonConfirm.BalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="popover top">' +
            '<a class="close" href="#">&times;</a>' +
            '<div class="arrow"></div>' +
            '<div class="popover-inner">' +
                '<div class="row-fluid span8">' +
                    '<div class="row-fluid">' +
                        '<p class="lead">$[title]</p>' +
                    '</div>' +
                    '<div class="row-fluid">' +
                        '<button class="btn btn-warning">Отменить</button>' +
                        '<button class="btn btn-success">Ок</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>', {
        build: function () {
            this.constructor.superclass.build.call(this);

            this.$element = $(this.getParentElement()).find('.popover');
            this._applyElementOffset();

            this.$element
                .find('.btn-warning,.close')
                .on('click', $.proxy(this._onCloseButtonClick, this));
        },
        clear: function () {
            this.$element
                .find('.btn,.close')
                .off('click');

            this.constructor.superclass.clear.call(this);
        },
        /**
         * Возвращает ссылку на кнопку подтверждения.
         * @function
         * @name getConfirmButton
         * @returns {Object} jQuery-элемент.
         */
        getConfirmButton: function () {
            return this.$element.find('.btn-success');
        },
        /**
         * Сдвигаем балун чтобы "хвостик" указывал на точку привязки.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IBalloonLayout.xml#event-userclose
         * @function
         * @private
         * @name applyElementOffset
         */
        _applyElementOffset: function () {
            this.$element.css({
                left: -(this.$element[0].offsetWidth / 2),
                top: -(this.$element[0].offsetHeight + this.$element.find('.arrow')[0].offsetHeight)
            });
        },
        _onCloseButtonClick: function (e) {
            e.preventDefault();

            this.events.fire("userclose");
        }
    });
});
