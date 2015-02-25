ym.modules.define('DemoLayout', [
    'templateLayoutFactory',
    'option.presetStorage'
], function (provide, templateLayoutFactory, presetStorage) {

    var DemoLayout = templateLayoutFactory.createClass([
        '<div class="well well-white demo" style="width:700px;">',
            '<a class="close" href="#">&times;</a>',
            '<h1>Определение координат</h1>',
            '<p class="lead">Приложение &laquo;Определение координат&raquo; позволяет получать координаты мест, областей а также различных типов геообъектов для дальнейшего использования их в <strong>API&nbsp;Яндекс.Карт</strong>.</p>',
            '<p class="lead">Приложение использует порядок координат&nbsp;',
                '<strong>',
                    '{% if data.coordOrder == "latlong" %}',
                        'широта-долгота',
                    '{% else %}',
                        'долгота-широта',
                    '{% endif %}',
                '</strong>',
            '.</p>',
            '<p class="lead">Информация о состоянии карты доступна в правом нижнем углу карты.</p>',
            '<p class="lead"Для создания геообъектов различных геометрий нужно использовать тулбар в левом верхнем углу карты.</p>',
            '<a class="btn btn-success btn-large" href="#">Продолжить</a>&nbsp;',
            '<a class="btn btn-warning btn-large" href="?coordorder={% if data.coordOrder == "latlong" %}longlat{% else %}latlong{% endif %}">Сменить порядок координат</a>',
        '</div>'
    ].join(''), {
        build: function () {
            DemoLayout.superclass.build.call(this);

            this._setupListeners();
        },
        clear: function () {
            this._clearListeners();

            DemoLayout.superclass.clear.call(this);
        },
        _setupListeners: function () {
            jQuery(this.getElement())
                .on('click', '.close,.btn-success', jQuery.proxy(this._onClose, this));
        },
        _clearListeners: function () {
            jQuery(this.getElement())
                .off('click');
        },
        _onClose: function (e) {
            e.preventDefault();

            var control = this.getData().control;

            control.getParent().remove(control);
        }
    });

    presetStorage.add('popup#demo', {
        contentBodyLayout: DemoLayout
    });

    provide(DemoLayout);
});
