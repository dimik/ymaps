/**
 * @fileOverview
 * Класс для посчета вершин ломаной при ее создании/редактировании.
 * @example
 * var polyline = new ymaps.Polyline([map.getCenter()]);
 *
 * map.geoObjects.add(polyline);
 *
 * new PolylineVertexCounter(polyline);
 *
 * polyline.editor
 *     .startEditing()
 *
 * polyline.editor
 *     .startDrawing();
 */

/**
 * Класс для индексирования вершин ломаной.
 * @class
 * @name PolylineVertexCounter
 * @param {ymaps.Polyline} polyline Полилиния.
 */
function PolylineVertexCounter(polyline) {
    this.vertices = polyline.geometry.getCoordinates().slice(0);
    this.placemarks = [];
    this.map = polyline.getMap();

    this.reIndex();

    polyline.geometry.events.add('change', this.onGeometryChange, this);
}

/**
 * Обработчик добавления вершины.
 * @function
 * @name PolylineVertexCounter.onVertexAdd
 * @param {Array} geometry Новая геометрия полилинии.
 */
PolylineVertexCounter.prototype.onVertexAdd = function (geometry) {
    var added = geometry.filter(function (vertex) {
            return this.vertices.indexOf(vertex) === -1;
        }, this)[0],
        index = this.vertices.push(added) - 1;

    this.createMarker(added, index);
    this.reIndex();
};

/**
 * Обработчик удаления вершины.
 * @function
 * @name PolylineVertexCounter.onVertexRemove
 * @param {Array} geometry Новая геометрия полилинии.
 */
PolylineVertexCounter.prototype.onVertexRemove = function (geometry) {
    var removed = this.vertices.filter(function (vertex) {
            return geometry.indexOf(vertex) === -1;
        })[0],
        index = this.vertices.indexOf(removed);

    this.removeMarker(index);
    this.reIndex();
};

/**
 * Обработчик перемещения вершины.
 * @function
 * @name PolylineVertexCounter.onVertexMove
 * @param {Array} geometry Новая геометрия полилинии.
 */
PolylineVertexCounter.prototype.onVertexMove = function (geometry) {
    var vertices = this.vertices,
        moved = geometry.filter(function (vertex) {
            return vertices.indexOf(vertex) === -1;
        })[0],
        index;

    for(index = 0; geometry.indexOf(vertices[index]) > -1; index++) /* */

    this.vertices[index] = moved;
    this.reIndex();
};

/**
 * Обработчик изменения геометрии.
 * @function
 * @name PolylineVertexCounter.onGeometryChange
 * @param {ymaps.Event} e Объект-событие.
 */
PolylineVertexCounter.prototype.onGeometryChange = function (e) {
    var coordinates = e.get('newCoordinates'),
        newLength = coordinates.length,
        oldLength = e.get('oldCoordinates').length;

    // Если добавили вершину.
    if(newLength > oldLength) {
        this.onVertexAdd(coordinates);
    }
    // Если удалили вершину.
    else if(oldLength > newLength) {
        this.onVertexRemove(coordinates);
    }
    // Если переместили вершину.
    else {
        this.onVertexMove(coordinates);
    }
};

/**
 * Создание маркера-индекса.
 * @function
 * @name PolylineVertexCounter.createMarker
 * @param {Array} vertex Точка вершины для которой создаем маркер.
 * @param {Number} index Индекс вершины для которой создаем маркер.
 */
PolylineVertexCounter.prototype.createMarker = function (vertex, index) {
    var placemark = new ymaps.Placemark(vertex);

    this.map.geoObjects.add(placemark);

    return this.placemarks[index] = placemark;
};

/**
 * Удаление маркера-индекса.
 * @function
 * @name PolylineVertexCounter.removeMarker
 * @param {Number} index Индекс вершины для которой удаляем маркер.
 */
PolylineVertexCounter.prototype.removeMarker = function (index) {
    var placemark = this.placemarks.splice(index, 1)[0];

    this.vertices.splice(index, 1);
    this.map.geoObjects.remove(placemark);
};

/**
 * Переиндексирование вершин полилинии.
 * @function
 * @name PolylineVertexCounter.reIndex
 */
PolylineVertexCounter.prototype.reIndex = function () {
    this.vertices.forEach(function (vertex, index) {
        var placemark = this.placemarks[index] || this.createMarker(vertex, index);

        placemark.properties.set('iconContent', index);
        placemark.geometry.setCoordinates(vertex);
    }, this);
};

