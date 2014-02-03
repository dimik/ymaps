define(['jquery', 'ready!ymaps', 'directions-service', 'directions-renderer', 'delivery-tarif', 'map-view', 'dom-view', 'module', 'es5-shim'],
    function (jQuery, ymaps, DirectionsService, DirectionsRenderer, DeliveryTarif, MapView, DomView, module) {

var config = module.config();

function DeliveryCalculator(origin) {
    this._mapView = new MapView();
    this._domView = new DomView();
    this._routeService = new DirectionsService();
    this._routeRenderer = new DirectionsRenderer({
        map: this._mapView.getMap()
    });

    this._origin = config.origin;
    this._tarifs = [];

    this.init();
}

DeliveryCalculator.prototype = {
    constructor: DeliveryCalculator,
    init: function () {
        var count = config.tarifs.length;

        this._tarifs = config.tarifs
            .map(function (config) {
                var tarif = new DeliveryTarif(config);

                tarif
                    .init()
                    .events.once('ready', function (e) {
                        e.get('target').setMap(this._mapView.getMap());
                        --count || this._attachHandlers();
                    }, this);

                return tarif;
            }, this);
    },
    _attachHandlers: function () {
        this._routeRenderer.events
            .add('waypointschange', this._onWayPointsChange, this);
        this._mapView.events
            .add('destinationchange', this._onDestinationChange, this);
    },
    _detachHandlers: function () {
    },
    _onDestinationChange: function (e) {
        this.setDestination(e.get('coords'));
    },
    _onWayPointsChange: function (e) {
        this.getDirections(e.get('origin'), e.get('destination'));
    },
    getDirections: function (origin, destination) {
        this._routeService.route({
            origin: origin,
            destination: destination
        }, $.proxy(this._onRouteSuccess, this));
    },
    _onRouteSuccess: function (result) {
        this._tarifs.forEach(function (tarif) {
            tarif.clear();
        });
        this._routeRenderer.setDirections(result);
        this.estimate(result.routes[0]);
    },
    setDestination: function (position) {
        this.getDirections(this._origin, position);
    },
    estimate: function (route) {
        var results = [],
            total = {
                name: 'Итого',
                distance: 0,
                value: 0
            };

        this._tarifs.forEach(function (tarif) {
            tarif.estimate(route);

            var result = {
                name: tarif.getName(),
                distance: tarif.getDistance(),
                value: tarif.getPrice()
            };

            total.distance += result.distance;
            total.value += result.value;

            if(result.distance) {
                results.push(result);
            }
        });

        results.push(total);

        this._domView.render(results);
    }
};

return DeliveryCalculator;

});
