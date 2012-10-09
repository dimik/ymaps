define(['ready!ymaps'], function (ymaps) {

    return (window.map = new ymaps.Map('map', {
        center: [55.755773, 37.617761],
        zoom: 10,
        behaviors: ['drag', 'scrollZoom']
    }));

});
