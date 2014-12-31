ym.modules.define('control.RadioGroup', [
    'util.defineClass',
    'util.extend',
    'util.id',
    'Collection',
    'data.Manager',
    'Monitor',
    'vow',
    'event.Mapper',
    'control.RadioGroup.component.EventMappingTable'
], function (provide, defineClass, extend, Id, Collection, DataManager, Monitor, vow, EventMapper, EventMappingTable) {
    var defaultOptions = {
        margin: 5
    };
    /**
     * Класс радиогруппы для кнопок.
     * @class
     * @name RadioGroup
     */
    var RadioGroup = defineClass(function (options) {
        RadioGroup.superclass.constructor.call(this, extend({}, defaultOptions, options));
        this.state = new DataManager();
        this._optionMonitor = new Monitor(this.options);
        this._element = document.createElement('ymaps');
        this._childElements = {};
        this._setupListeners();
        this._setupMonitor();
    }, Collection, /** @lends RadioGroup.prototype */{
        add: function (child) {
            var parent = this.getParent();

            if(parent) {
                child.options.setParent(parent.options);
            }
            child.events.setParent(new EventMapper(this.events, new EventMappingTable(child)));
            child.setParent(this);

            return RadioGroup.superclass.add.call(this, child);
        },
        remove: function (child) {
            var id = Id.get(child);

            child.setParent(null);
            child.options.setParent(null);
            child.events.setParent(null);
            delete this._childElements[id];

            return RadioGroup.superclass.remove.call(this, child);
        },
        setParent: function (parent) {
            parent.getChildElement(this).then(this._onElement, this);

            return RadioGroup.superclass.setParent.call(this, parent);
        },
        getChildElement: function (child) {
            var id = Id.get(child);
            var el = this._childElements[id] = this._createChildElement();
            this._element.appendChild(el);

            return vow.resolve(el);
        },
        _createChildElement: function () {
            var el = document.createElement('ymaps');

            this._setChildElementMargin(el);

            return el;
        },
        _setChildElementMargin: function (el) {
            var options = this.options,
                side = options.get('float', 'right'),
                margin = parseFloat(options.get('margin', 5)) + 'px';

            el.style['margin'] = side === 'left'? '0 ' + margin + ' 0 0': '0 0 0 ' + margin;
        },
        _onElement: function (parentContainer) {
            parentContainer.appendChild(this._element);
        },
        _setupListeners: function () {
            this.events
                .add('select', this._onChildSelect, this)
                .add('parentchange', this._onParentChange, this);
        },
        _setupMonitor: function () {
            this._optionMonitor
                .add(['float', 'margin'], this._updateChildMargin, this);
        },
        _updateChildMargin: function () {
            this.each(function (child) {
                var el = this._childElements[Id.get(child)];

                this._setChildElementMargin(el);
            }, this);
        },
        _onParentChange: function (e) {
            var parent = this.getParent();

            this.each(function (child) {
                child.options.setParent(parent && parent.options || null);
            });
        },
        _onChildSelect: function (e) {
            var target = e.get('target');

            this.each(function (child) {
                if(target !== child && child.isSelected()) {
                    child.deselect();
                }
            });
        }
    });

    provide(RadioGroup);
});
