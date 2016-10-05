ym.modules.define('km.Map.LogoControl', [
 'util.defineClass',
 'collection.Item',
], function (provide, defineClass, CollectionItem) {
  var LogoControl = defineClass(function (options) {
    LogoControl.superclass.constructor.call(this, options);
    this._$content = null;
  }, CollectionItem, {
    onAddToMap: function (map) {
      LogoControl.superclass.onAddToMap.call(this, map);
      this.getParent().getChildElement(this).then(this._onGetChildElement, this);
    },
    onRemoveFromMap: function (oldMap) {
        if (this._$content) {
            this._clearListeners();
            this._$content.remove();
        }
        LogoControl.superclass.onRemoveFromMap.call(this, oldMap);
    },
    _onGetChildElement: function (parentDomContainer) {
        this._$content = $([
          // does not work in iframe
          // '<a href="http://yandex.ru">',
            '<img src="//yastatic.net/maps-beta/_/BPMHTAIlmc5kh6Tymb1I2mmfSAc.svg" style="width:86px;height:32px;" title="Яндекс" aria-label="Яндекс">',
          // '</a>'
          ].join(''))
          .appendTo(parentDomContainer);
    },

    getDefaultParameters: function () {
      return {
        float: 'none',
        position: {
          right: 40,
          bottom: 40
        }
      };
    },
  });

  provide(LogoControl);
});
