ym.modules.define('control.RadioGroup.component.EventMappingTable', [
    'util.defineClass',
    'Event'
], function (provide, defineClass, Event) {
    var EventMappingTable = function (context) {
        this._context = context;
        this['*'] = this._defaultMappingFunction;

        this['parentchange'] = false;
        this['mapchange'] = false;
        this['optionschange'] = false;
    };

    defineClass(EventMappingTable, {
        _defaultMappingFunction: function (event) {
            return new Event({
                currentTarget: this._context
            }, event);
        }
    });

    provide(EventMappingTable);
});
