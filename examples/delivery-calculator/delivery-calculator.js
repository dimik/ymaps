function DeliveryCalculator(map, origin, tarifs) {
    this._map = map;
    this._routeService = new DirectionsService({ avoidTrafficJams: true });
    this._routeRenderer = new DirectionsRenderer({ suppressPolylines: true, draggable: true, map: map });
    this._origin = origin;
    this._destination = null;
    this._tarifs = [];

    this._template = $('#sidebarTemplate').template('sidebarTemplate');

    this._initTarifs(tarifs);
    this._routeRenderer.events.add('waypointschange', this._onWayPointsChange, this);
}

DeliveryCalculator.prototype = {
    constructor: DeliveryCalculator,
    _onDestinationChange: function (e) {
        this.setDestination(e.get('coordPosition'));
    },
    _initTarifs: function (tarifs) {
        tarifs.forEach(function (tarif, i) {
            (this._tarifs[i] = new DeliveryTarif(tarif))
                .getCoordinates()
                .events.add('ready', this._onTarifReady, this);
        }, this);
    },
    _onTarifReady: function (e) {
        e.get('target').setMap(this._map);
    },
    _onWayPointsChange: function (e) {
        this.getDirections(
            this._origin = e.get('origin'),
            this._destination = e.get('destination')
        );
    },
    getDirections: function (origin, destination) {
        if(origin && destination) {
            this._routeService.route({
                origin: origin,
                destination: destination
            }, $.proxy(this._onRouteSuccess, this));
        }
    },
    _onRouteSuccess: function (result) {
        this._tarifs.forEach(function (tarif) {
            tarif.clear();
        });
        this._routeRenderer.setDirections(result);
        this.calculate(result.routes[0]);
    },
    setDestination: function (position) {
        this.getDirections(this._origin, this._destination = position);
    },
    getDestination: function () {
        return this._destination;
    },
    setOrigin: function (position) {
        this.getDirections(this._origin = position, this._destination);
    },
    getOrigin: function () {
        return this._origin;
    },
    calculate: function (route) {
        var results = [],
            total = {
                name: 'Итого',
                duration: 0,
                distance: 0,
                value: 0
            };

        this._tarifs.forEach(function (tarif) {
            var result = tarif.calculate(route);

            total.duration += result.duration;
            total.distance += result.distance;
            total.value += result.value;
            results.push(result);

            tarif.render();
        });

        results.push(total);

        $('#sidebar')
            // Рендерим шаблон в сайдбар.
            .html($.tmpl(this._template, {
                results: results
            }, {
                formatter: ymaps.formatter
            }));
    }
};
