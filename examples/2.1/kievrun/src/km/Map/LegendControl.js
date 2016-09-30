ym.modules.define('km.Map.LegendControl', [
 'util.defineClass',
 'event.Manager',
 'collection.Item',
 'km.Data.Poi',
], function (provide, defineClass, EventManager, CollectionItem, PoiData) {
  var LegendControl = defineClass(function (options) {
    LegendControl.superclass.constructor.call(this, options);
    this.events = new EventManager();
    this._$content = null;
  }, CollectionItem, {
    onAddToMap: function (map) {
      LegendControl.superclass.onAddToMap.call(this, map);
      this.getParent().getChildElement(this).then(this._onGetChildElement, this);
    },
    onRemoveFromMap: function (oldMap) {
        if (this._$content) {
            this._clearListeners();
            this._$content.remove();
        }
        LegendControl.superclass.onRemoveFromMap.call(this, oldMap);
    },
    _onGetChildElement: function (parentDomContainer) {
        this._$content = $('<div class="km-legend"></div>')
          .append(this._createLegend())
          .appendTo(parentDomContainer);

        this._setupListeners();
    },

    _setupListeners: function () {
      this._$content
        .on('click', '.list-group-item', $.proxy(this._handleLegendItemClick, this));
    },

    _clearListeners: function () {
      this._$content
        .off('click')
    },

    _handleLegendItemClick: function (e) {
      e.preventDefault()
      var groupId = $(e.target).data('id')

      if(this._activeItemId === groupId) {
        return;
      }

      this._activeItemId = groupId;

      this.events.fire('activegroupchange', {
        target: this,
        groupId: groupId
      })
    },

    _createLegendItem: function (it, index) {
      return $([
        '<a href="#" class="list-group-item" data-id="' + it.id + '">',
          '<span class="badge">',
            it.items.length,
          '</span>',
          it.name,
        '</a>'
      ].join(''));
    },

    _createLegend: function () {
      return $('<ul class="list-group"></ul>')
        .append(PoiData.map(this._createLegendItem, this));
    },

    getDefaultParameters: function () {
      return {
        float: 'none',
        position: {
          right: 40,
          top: 40
        }
      };
    },
  });

  provide(LegendControl);
});
