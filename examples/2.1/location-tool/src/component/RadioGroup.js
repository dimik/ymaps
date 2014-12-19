ym.modules.define('LocationTool.component.RadioGroup', [
    'util.defineClass',
    'Collection',
    'data.Manager',
    'Monitor',
    'vow'
], function (provide, defineClass, Collection, DataManager, Monitor, vow) {
    /**
     * Класс радиогруппы для кнопок.
     * @class
     * @name RadioGroup
     */
    var RadioGroup = defineClass(function (options) {
        RadioGroup.superclass.constructor.call(this, options);
        this.state = new DataManager();
        this._el = document.createElement('div');
        this._setupListeners();
    }, Collection, /** @lends RadioGroup.prototype */{
        add: function (child) {
            child.options.setParent(this.options);
            child.events.setParent(this.events);
            child.setParent(this);
            child.getLayout().then(function (layout) {
                layout.setParentElement(this._el);
            }, function (err) {
                console.log(err);
            }, this);

            return RadioGroup.superclass.add.call(this, child);
        },
        remove: function (child) {
            child.setParent(null);
            child.events.setParent(null);

            return RadioGroup.superclass.remove.call(this, child);
        },
        setParent: function (parent) {
            this._parent = parent;
            this._map = parent.getMap();
            this.getParent().getChildElement(this).then(this._onElement, this);
        },
        getMap: function () {
            return this._map;
        },
        getParent: function () {
            return this._parent;
        },
        getLayout: function () {
            console.log('get layout');
        },
        getChildElement: function (child) {
            console.log('in getChildElement', child);
            var el = document.createElement('div');
            this._el.appendChild(el);
            return vow.resolve(el);
        },
        onAddToMap: function (map) {
        debugger;
            RadioGroup.superclass.onAddToMap.call(this, map);
            this.getParent().getChildElement(this).then(this._onElement, this);
            console.log(this.getParent(), this.getParent() === this);
        },
        onRemoveFromMap: function (map) {
            RadioGroup.superclass.onRemoveFromMap.call(this, map);
        },
        _onElement: function (parentContainer) {
            this._el.id = 'test';
            parentContainer.appendChild(this._el);
        },
        _setupListeners: function () {
            this.events.add('select', this._onChildSelect, this);
        },
        _onChildSelect: function (e) {
            var child = e.get('target');

            this.each(function (it) {
                if(child !== it) {
                    child.deselect();
                }
            });
        }
    });

    provide(RadioGroup);
});
