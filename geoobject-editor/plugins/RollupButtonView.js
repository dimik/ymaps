define(['ready!ymaps'], function (ymaps) {

    return RollupButtonView = ymaps.templateLayoutFactory.createClass([
        '<button class="btn btn-editor" title="$[data.title]">',
            '<i class="icon-$[data.geometry] icon-large"/>',
        '</button>'
    ].join(''));

});
