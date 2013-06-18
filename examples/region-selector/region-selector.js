function RegionSelector(map, data, regions, cities) {
    this._map = map;
    this._data = data;

    (this._cities = cities)
        .bind('change', $.proxy(this.onCityChange, this));

    (this._regions = regions)
        .bind('change', $.proxy(this.onRegionChange, this))
        .html(this.createSelectOptions(data.regions))
        .trigger('change');
}

var ptp = RegionSelector.prototype;

ptp.onRegionChange = function (e) {
    var self = this,
        regionName = $(e.target).find('option:selected').text(),
        region = this._data.regions.filter(function (region) { return region.name === regionName })[0],
        cities = this._data.cities.filter(function (city) { return city.region === region.id });

    this._cities
        .empty()
        .html(this.createSelectOptions(cities))
        .trigger('change')
};

ptp.onCityChange = function (e) {
    var self = this,
        cityName = $(e.target).find('option:selected').text(),
        city = this._data.cities.filter(function (city) { return city.name === cityName })[0];

    if(city.bounds) {
        self._map.setBounds(city.bounds);
        self.showCityPoints(city);
    }
    else {
        self.loadCityBounds(city, function (bounds) {
            self._map.setBounds(city.bounds = bounds);
            self.showCityPoints(city);
        });
    }
};

ptp.createSelectOptions = function (options) {
    return options
        .map(function (option) {
            return '<option>' + option.name + '</option>';
        })
        .join('');
};

ptp.loadCityBounds = function (city, callback) {
    ymaps.geocode(city.name, { results: 1 })
        .then(function (res) {
            var first = res.geoObjects.get(0);

            callback(first && first.properties.get('boundedBy'));
        });
    /*
     * Вариант получения области через http-геокодер.
     * @see http://api.yandex.ru/maps/doc/geocoder/desc/concepts/input_params.xml
     *
    $.ajax('http://geocode-maps.yandex.ru/1.x/', {
        data : {
            "geocode" : city.name,
            "format" : "json"
        },
        dataType : 'jsonp',
        success : function (json) {
            var toNumber = function (coord) { return Number(coord); },
                envelope = json.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope,
                lowerCorner = $.map(envelope.lowerCorner.split(' '), toNumber).reverse(),
                upperCorner = $.map(envelope.upperCorner.split(' '), toNumber).reverse(),
                bounds = [lowerCorner, upperCorner];

            callback(bounds);
        }
    });
    */
};

ptp.createBalloonLayout = function () {
    return ymaps.templateLayoutFactory.createClass('<p><b>$[properties.name]</b></p> \
        [if properties.description]<p>$[properties.description]</p>[endif] \
        <p><b>$[properties.address]</b></p> \
        <p><i>$[properties.phone]</i></p>');
};

ptp.showCityPoints = function (city) {
    var self = this,
        multiGeocoder = new MultiGeocoder({ boundedBy : city.bounds, strictBounds : true }),
        selected = this._data.points.filter(function (point) { return point.city === city.id }),
        points = selected.map(function (point) { return point.coords || point.address });

    if(!city.points) {
        multiGeocoder.geocode(points, { boundedBy : city.bounds })
            .then(
                function (res) {
                    self._map.geoObjects.add(city.points = self.createPointsCollection(selected, res.geoObjects));
                },
                function (err) {}
            );
    }
};

ptp.createPointsCollection = function (points, data) {
    var balloonContentLayout = this.createBalloonLayout(),
        result = new ymaps.GeoObjectCollection();

    for(var i = 0, len = data.getLength(); i < len; i++) {
        var point = points[i],
            geoObject = data.get(i),
            properties = {
                name : point.name,
                description : point.description,
                phone : point.phone,
                address : point.address,
                iconContent : point.name
            },
            options = {
                balloonContentBodyLayout: balloonContentLayout,
                preset: "twirl#blueStretchyIcon"
            },
            placemark = new ymaps.Placemark(geoObject.geometry, properties, options);

        result.add(placemark);
    }

    return result;

};
