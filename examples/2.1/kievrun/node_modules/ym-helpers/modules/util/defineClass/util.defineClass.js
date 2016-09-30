if (typeof modules == 'undefined' && typeof require == 'function') {
    var modules = require('ym');
}

modules.define('util.defineClass', ['util.extend'], function (provide, extend) {
    function augment (childClass, parentClass, override) {
        childClass.prototype = (Object.create || function (obj) {
            function F () {}

            F.prototype = obj;
            return new F();
        })(parentClass.prototype);

        childClass.prototype.constructor = childClass;
        childClass.superclass = parentClass.prototype;
        childClass.superclass.constructor = parentClass;

        if (override) {
            extend(childClass.prototype, override);
        }

        return childClass.prototype;
    }

    function createClass (childClass, parentClass, override) {
        if (typeof parentClass == 'function') {
            augment(childClass, parentClass, override);
        } else {
            override = parentClass;
            extend(childClass.prototype, override);
        }

        return childClass;
    }

    provide(createClass);
});