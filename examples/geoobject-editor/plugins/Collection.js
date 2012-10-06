define(['ready!ymaps', 'CollectionBalloon', 'CollectionEditor'], function (ymaps, CollectionBalloon, CollectionEditor) {
    /**
     * Editable ordered GeoObject Collection.
     * @augments ymaps.GeoObjectArray
     */
    function Collection() {
        Collection.superclass.constructor.apply(this, arguments);

        this.editor = new CollectionEditor(this);
        this.balloon = new CollectionBalloon(this);
    }

    ymaps.util.augment(Collection, ymaps.GeoObjectArray);

    return Collection;
});
