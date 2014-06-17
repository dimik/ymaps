CircleSector.MapView = function (map) {
    this._map = map;

    this._center = null;
    this._radius = null;
    this._sector = null;
    this._direction = null;

    this._label = null;
    this._cursor = null;

    this.events = new ymaps.event.Manager();
};

CircleSector.MapView.prototype = {
    constructor: CircleSector.MapView,
    setCursor: function (key) {
        this._cursor = this._map.cursors.push(key);

        return this;
    },
    clearCursor: function () {
        this._cursor.remove();

        return this;
    },
    _createLabel: function (position) {
        return (new MapLabel(position))
            .setMap(this._map);
    },
    _updateLabel: function (position, content) {
        var pixelPosition = this._map.options.get('projection')
                .toGlobalPixels(position, this._map.getZoom());

        // поправка по оси Х, чтобы не налезал на курсор.
        pixelPosition[0] += 20;

        if(this._label) {
            this._label.setPosition(pixelPosition);
        }
        else {
            this._label = this._createLabel(pixelPosition);
        }
        this._label
            .setContent(content)
            .hide(2000);
    },
    setCenter: function (position) {
        var labelContent = 'ш: ' + position[0].toFixed(6) +
            ', д: ' + position[1].toFixed(6);

        this._updateCenter(position);
        this._updateLabel(position, labelContent);

        return this;
    },
    clearCenter: function () {
        if(this._center) {
            this._map.geoObjects.remove(this._center);
            this._center = null;
        }

        return this;
    },
    _updateCenter: function (position) {
        if(this._center) {
            this._center.geometry.setCoordinates(position);
        }
        else {
            this._map.geoObjects.add(
                this._center = this._createPlacemark(position)
            );
        }
    },
    _getCenterIconClipRect: function (key) {
        var clipRects = {
            center: [[0, 0], [21, 21]],
            radius: [[21, 0], [42, 21]],
            sector: [[42, 0], [63, 21]]
        };

        return clipRects[key];
    },
    setCenterIcon: function (key) {
        this._center.options.set({
            iconImageClipRect: this._getCenterIconClipRect(key)
        });

        return this;
    },
    _rotateCenterIcon: function (azimuth) {
        var angle = 90 - azimuth * 180 / Math.PI;

        this._center.options.set({
            iconImageRotation: angle
        });
    },
    drawRadius: function (coords) {
        var center = coords[0],
            position = coords[1],
            geodesic = ymaps.coordSystem.geo.solveInverseProblem(center, position),
            azimuth = Math.atan2(geodesic.startDirection[0], geodesic.startDirection[1]);

        this._updateLabel(position, ymaps.formatter.distance(geodesic.distance));
        this._updateRadius(coords);

        this._rotateCenterIcon(azimuth);

        return this;
    },
    clearRadius: function () {
        if(this._radius) {
            this._map.geoObjects.remove(this._radius);
            this._radius = null;
        }

        return this;
    },
    _updateRadius: function (coords) {
        if(this._radius) {
            this._radius.geometry.setCoordinates(coords);
        }
        else {
            this._map.geoObjects.add(
                this._radius = this._createPolyline(coords)
            );
        }
    },
    drawSector: function (position) {
        var coordSystem = ymaps.coordSystem.geo,
            center = this._center.geometry.getCoordinates(),
            pointA = this._radius.geometry.get(1),
            // Решаем обратную задачу между двумя точками.
            geodesicA = coordSystem.solveInverseProblem(center, pointA),
            geodesicB = coordSystem.solveInverseProblem(center, position),
            // Находим угол в радианах.
            azimuthA = Math.atan2(geodesicA.startDirection[0], geodesicA.startDirection[1]),
            azimuthB = Math.atan2(geodesicB.startDirection[0], geodesicB.startDirection[1]),
            // Находим расстояние.
            distance = geodesicA.distance,
            // Находим второй конец дуги.
            pointB = coordSystem.solveDirectProblem(center, geodesicB.startDirection, distance).endPoint,
            angleA = azimuthA,
            angleB = azimuthB,
            coordinates = [center],
            // Определяем направление в котором рисуется сектор.
            direction = - (geodesicA.startDirection[0] * geodesicB.startDirection[1] - geodesicA.startDirection[1] * geodesicB.startDirection[0]);

        if(!this._direction || (this._direction * direction < 0 && Math.abs(angleA - angleB) < 0.01)) {
            this._direction = direction;
        }

        if(this._direction >= 0 && angleA > angleB) {
            angleB += 2 * Math.PI;
        }
        else if(this._direction < 0 && angleA < angleB) {
            angleA += 2 * Math.PI;
        }

        var step = Math.abs(angleA - angleB) / Math.ceil(Math.abs(angleA - angleB) / 0.01);

        this._rotateCenterIcon(azimuthB);
        this._updateLabel(
            pointB,
            Math.abs(Math.floor((angleA - angleB) * 180 / Math.PI)) + '&deg;'
        );

        while (Math.abs(angleA - angleB) >= 1e-6) {
            var dir = [Math.sin(angleA), Math.cos(angleA)],
                point = coordSystem.solveDirectProblem(center, dir, distance).endPoint;

            coordinates.push(point);
            angleA += this._direction > 0 ? step : -step;
        }

        this._updateSector(coordinates);

        return this;
    },
    clearSector: function () {
        if(this._sector) {
            this._map.geoObjects.remove(this._sector);
            this._sector = null;
        }

        return this;
    },
    _updateSector: function (coords) {
        if(this._sector) {
            this._sector.geometry.set(0, coords);
        }
        else {
            this._map.geoObjects.add(
                this._sector = this._createPolygon([coords])
            );
        }
    },
    _createPlacemark: function (position) {
        return new ymaps.Placemark(position, {}, {
            overlayFactory: 'default#interactiveGraphics',
            cursor: this._cursor.getKey(),
            iconImageHref: 'icons-grey.png',
            iconImageSize: [21, 21],
            iconImageOffset: [-10, -10],
            iconImageClipRect: this._getCenterIconClipRect('center')
        });
    },
    _createPolyline: function (coords) {
        return new ymaps.Polyline(coords, {}, {
            cursor: this._cursor.getKey(),
            strokeStyle: 'dash'
        });
    },
    _createPolygon: function (coords) {
        return new ymaps.Polygon(coords, {}, {
            // simplification: false,
            cursor: this._cursor.getKey(),
            geodesic: true,
            overlayFactory: 'default#staticGraphics'
        })
    }
};
