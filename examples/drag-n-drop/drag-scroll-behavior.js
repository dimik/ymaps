/**
 * @fileOverview
 * Класс поведения для скролла карты при перетаскивании на нее иконки метки
 * с помощью Native HTML5 Drag and Drop API.
 * @example
 * @see http://dimik.github.com/ymaps/examples/drag-n-drop/
 */

/**
 * @class
 * @name DragScrollBehavior
 * @borrows jQuery
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/dg/concepts/map.xml#behaviors
 */
function DragScrollBehavior() {
    // Менеджер опций
    this.options = new ymaps.option.Manager();
    // Менеджер событий
    this.events = new ymaps.event.Manager();

    this._lastDiffX = null;
    this._lastDiffY = null;
}

DragScrollBehavior.prototype = {
    /**
     * @constructor
     */
    constructor: DragScrollBehavior,
    /**
     * Включает поведение.
     * @function
     * @name DragScrollBehavior.enable
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IBehavior.xml#enable
     */
    enable: function () {
        this._$mapContainer.on('dragover', $.proxy(this._onDragOver, this));
        this._$mapContainer.on('drop', $.proxy(this._onDrop, this));
    },
    /**
     * Выключает поведение.
     * @function
     * @name DragScrollBehavior.disable
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IBehavior.xml#disable
     */
    disable: function () {
        this._$mapContainer
            .off('dragover')
            .off('drop');
    },
    /**
     * Устанавливает поведению родителя.
     * @function
     * @name DragScrollBehavior.setParent
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IChildOnMap.xml#setParent
     * @param {Object} parent Менеджер поведений.
     * @returns {DragScrollBehavior} Ссылка на себя.
     */
    setParent: function (parent) {
        this._parent = parent;
        this._map = parent.getMap();
        this._$mapContainer = $(this._map.container.getElement());
        this._timeoutId = null;

        return this;
    },
    /**
     * Возвращает родителя поведения.
     * @function
     * @name DragScrollBehavior.getParent
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IChildOnMap.xml#getParent
     * @returns {Object} Менеджер поведений.
     */
    getParent: function () {
        return this._parent;
    },
    /**
     * Обработчик события "dragover".
     * @see http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#event-dragover
     * @private
     * @function
     * @name DragScrollBehavior._onDragOver
     * @param {Object} e Объект-событие jQuery.
     */
    _onDragOver: function (e) {
        if(!this._timeoutId) {
            var self = this,
                event = e.originalEvent,
                mapCenterX = this._$mapContainer.width() / 2,
                mapCenterY = this._$mapContainer.height() / 2,
                diffX = Math.abs(mapCenterX - (event.offsetX || event.layerX)),
                diffY = Math.abs(mapCenterY - (event.offsetY || event.layerY)),
                // Имперический порог сдвига.
                boundary = 3;

            if(this._lastDiffX == null && this._lastDiffY == null) {
                this._lastDiffX = diffX;
                this._lastDiffY = diffY;

                return;
            }

            if(diffX > this._lastDiffX + boundary || diffY > this._lastDiffY + boundary) {
                this._timeoutId = window.setTimeout(function () {
                    var coords = self._pageToGeo([event.pageX, event.pageY]);

                    self._map.panTo(coords, {
                        delay: 0,
                        timing: 'linear'
                        // callback: ymaps.util.bind(self._clearMove, self)
                    });

                    self._clearMove();
                }, 30);
            }

            this._lastDiffX = diffX;
            this._lastDiffY = diffY;
        }
    },
    /**
     * Обработчик события "drop".
     * @see http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#event-drop
     * @private
     * @function
     * @name DragScrollBehavior._onDrop
     * @param {Object} e Объект-событие jQuery.
     */
    _onDrop: function () {
        this._lastDiffX = null;
        this._lastDiffY = null;
    },
    /**
     * Отмена обработчика по таймауту.
     * @private
     * @function
     * @name DragScrollBehavior._clearMove
     */
    _clearMove: function () {
        if(this._timeoutId) {
            window.clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    },
    /**
     * Преобразует пиксельные координаты страницы в геокоординаты.
     * @private
     * @function
     * @name DragScrollBehavior._pageToGeo
     * @param {Number[]} coords Пиксельные координаты мыши при перетаскивании.
     * @returns {Number[]} Геокоординаты в текущей проекции карты.
     */
    _pageToGeo: function (coords) {
        var projection = this._map.options.get('projection');

        return projection.fromGlobalPixels(
            this._map.converter.pageToGlobal(coords), this._map.getZoom()
        );
    }
};
