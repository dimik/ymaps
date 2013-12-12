define(['ready!ymaps'], function (ymaps) {

function RouteMapButtonView(map) {
    this._map = map;
    this._button = null;
    this.events = new ymaps.event.Manager();
};

RouteMapButtonView.prototype = {
    constructor: RouteMapButtonView,
    render: function () {
        this._map.controls.add(
            this._button = this._createButton()
        );
        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._map.controls
            .remove(this._button);
        this._detachHandlers();
        this._button = null;

        return this;
    },
    setMap: function (map) {
        this._map = map;

        return this;
    },
    getMap: function () {
        return this._map;
    },
    _attachHandlers: function () {
        this._button.events
            .add(['select', 'deselect'], this._onButtonClick, this);
    },
    _detachHandlers: function () {
        this._button.events
            .remove(['select', 'deselect'], this._onButtonClick, this);
    },
    _onButtonClick: function (e) {
        this.events.fire('click', {
            target: this,
            state: e.get('type') + 'ed'
        });
    },
    _createButton: function () {
        return new ymaps.control.Button(this.getDefaults());
    },
    getDefaults: function () {
        return {
            data: {
                content: 'Проложить маршрут',
                // пока нет в документации
                iconType: 'routes',
                title: 'Проложить маршрут до ближайшего пункта выдачи'
            },
            options: {
                maxWidth: 150
            }
        };
    }
};

return RouteMapButtonView;

});
