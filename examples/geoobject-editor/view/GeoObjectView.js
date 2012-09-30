var GeoObjectView = (function () {

    var views = {
        EditMenu: ymaps.templateLayoutFactory.createClass([
            '<ul class="nav nav-list">',
                '<li><a href="#" data-action="edit">Редактировать</a></li>',
                '<li><a href="#" data-action="clone">Редактировать копию</a></li>',
                '<li><a href="#" data-action="delete">Удалить</a></li>',
            '</ul>'
        ].join('')),

        StrechyIconContent: ymaps.templateLayoutFactory.createClass('<span>$[properties.name]</span>'),

        BalloonContent: ymaps.templateLayoutFactory.createClass([
            '<div>',
                '<h3>$[properties.name]</h3>',
                '<p class="lead">$[properties.description]</p>',
                '[if properties.address]<address>$[properties.address]</address>[endif]',
            '</div>'
        ].join(''))
    };

    return {
        getLayout: function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        }
    };

}());

