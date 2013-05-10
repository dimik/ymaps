function RouteSelectorModel() {
    this.events = $({});
}

RouteSelectorModel.prototype = {
    constructor: RouteSelectorModel,
    getData: function () {
        /*
         * Если данных много, лучше ходить за ними AJAX-ом.
         * $.ajax({
         *     url: '_url_',
         *     dataType: 'json',
         *     success: this._onDataLoaded,
         *     context: this
         * });
         */
        var data = {
                activeItem: 0,
                items: [{
                    name: 'Из Москвы',
                    path: [[55.755773, 37.617761], [54.996898, 36.430997]]
                }, {
                    name: 'Из Калуги',
                    path: [[54.533832, 36.237041], [54.996898, 36.430997]]
                }, {
                    name: 'Из Серпухова',
                    path: ['Серпухов', [54.996898, 36.430997]]
                }, {
                    name: 'Из Смоленска',
                    path: ['Смоленск', [54.996898, 36.430997]]
                }]
            };

        this._onDataLoaded(data);
    },
    _onDataLoaded: function (data) {
        this.events.trigger($.Event('change', {
            dataset: data
        }));
    }
};
