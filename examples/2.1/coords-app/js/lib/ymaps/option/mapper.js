ymaps.modules.define('ymaps-option-mapper', function (provide) {

function capitalize(s) {
    return s.slice(0, 1).toUpperCase() + s.slice(1);
}

provide({
    resolve: function (key, name) {
        if(name) {
            return name + capitalize(key);
        }

        return key;
    }
});

});
