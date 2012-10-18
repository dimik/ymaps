define(['ready!ymaps'], function (ymaps) {

    function RectangleGeometry(coordinates, options) {
        RectangleGeometry.superclass.constructor.call(this, coordinates, options);
    }

    ymaps.util.augment(RectangleGeometry, ymaps.geometry.Rectangle, {
        getWidth: function () {
            var coordinates = this.getCoordinates(),
                coordSystem = this.options.get('projection').getCoordSystem(),
                width = coordSystem.solveInverseProblem(coordinates[0], [coordinates[1][0], coordinates[0][1]]).distance;

            return width;
        },
        setWidth: function (width) {
            var center = this.getCenter(),
                height = this.getHeight(),
                coordinates = getCoordinatesFromCenterAndSize(center, [width, height], this.options);

            this.setCoordinates(coordinates);

            return this;
        },
        getHeight: function () {
            var coordinates = this.getCoordinates(),
                coordSystem = this.options.get('projection').getCoordSystem(),
                height = coordSystem.solveInverseProblem(coordinates[0], [coordinates[0][0], coordinates[1][1]]).distance;

            return height;
        },
        setHeight: function (height) {
            var center = this.getCenter(),
                width = this.getWidth(),
                coordinates = getCoordinatesFromCenterAndSize(center, [width, height], this.options);

            this.setCoordinates(coordinates);

            return this;
        },
        getCenter: function () {
            var coordinates = this.getCoordinates(),
                coordSystem = this.options.get('projection').getCoordSystem(),
                path = coordSystem.solveInverseProblem(coordinates[0], coordinates[1]).pathFunction,
                center = path(1/2).point;

            return center;
        },
        setCenter: function (center) {
            var width = this.getWidth(),
                height = this.getHeight(),
                coordinates = getCoordinatesFromCenterAndSize(center, [width, height], this.options);

            this.setCoordinates(coordinates);

            return this;
        }
    });

    RectangleGeometry.fromCenterAndSize = function (center, size, options) {
        var coordinates = getCoordinatesFromCenterAndSize(center, size, options);

        return new RectangleGeometry(coordinates, options);
    }

    function getCoordinatesFromCenterAndSize(center, size, options) {
        var projection = options && (options.get('projection') || options.projection) || ymaps.projection.wgs84Mercator,
            coordSystem = projection.getCoordSystem(),
            width = Number(size[0]),
            height = Number(size[1]);

        if(center.length !== 2 || isNaN(width) || isNaN(height)) {
            throw new TypeError('Wrong params center or size');
        }

        var topCenter = coordSystem.solveDirectProblem(center, [1, 0], height/2).endPoint,
            bottomCenter = coordSystem.solveDirectProblem(center, [-1, 0], height/2).endPoint,
            leftCenter = coordSystem.solveDirectProblem(center, [0, -1], width/2).endPoint,
            rightCenter = coordSystem.solveDirectProblem(center, [0, 1], width/2).endPoint,
            lowerCorner = [bottomCenter[0], leftCenter[1]],
            upperCorner = [topCenter[0], rightCenter[1]];

        return [lowerCorner, upperCorner];
    }

    return RectangleGeometry;
});
