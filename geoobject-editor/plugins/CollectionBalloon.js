define(['ready!ymaps'], function (ymaps) {

    function CollectionBalloon(collection) {
        this.geoObjects = collection;
    }

    CollectionBalloon.prototype = {
        constructor: CollectionBalloon,

        open: function (position, data, options) {
            var map = this.geoObjects.getMap(),
                balloon = map && map.balloon;

            if(balloon) {
                this.balloon = balloon.open(position, data, options);
                this.geoObjects.events.fire('balloonopen', {
                    balloon: this.balloon
                });
            }

            return this.balloon;
        },

        close: function () {
            if(this.balloon) {
                this.balloon.close();
                this.geoObjects.events.fire('balloonclose', {
                    balloon: this.balloon
                });
            }

            return this.balloon;
        }
    };

    return CollectionBalloon;
});
