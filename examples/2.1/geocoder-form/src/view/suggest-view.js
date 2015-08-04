ym.modules.define('suggest-view', [
  'util.defineClass',
  'util.bind',
  'util.extend',
  'suggest',
  'event.Manager'
], function (provide, defineClass, bind, extend, suggest, EventManager) {
  var defaultOptions = {
    results: 5,
    minLength: 3
  };
  var SuggestView = defineClass(function (options) {
    this.events = new EventManager();
    this._input = jQuery('.search-query');
    this._options = extend({}, defaultOptions, options);
    this._setupListeners();
  }, {
    _setupListeners: function () {
      var options = this._options;
      var originalItems, getItem = function (displayName) {
        for(var i = 0, len = originalItems.length; i < len; i++) {
          if(originalItems[i].displayName === displayName) {
            return originalItems[i];
          }
        }
      };

      this._input
        .on('keydown', bind(this._onQueryChange, this))
        .typeahead(extend({
          source: function (query, fn) {
            suggest(query, options).then(function (items) {
              originalItems = items;
              fn(items.map(function (it) { return it.displayName; }));
            }, this);
          },
          updater: function (item) {
            var val = getItem(item).value;

            this.$element.val(val);
            // this.$element[0].form.submit();
            this.$element.closest('form').submit();

            return val;
          },
          matcher: function (item) {
            return true;
          },
          sorter: function (items) {
            return items;
          },
          highlighter: function (item) {
            return getItem(item).hl.reduceRight(function (s, range, index, hl) {
              return s.substring(0, range[0]) + '<strong>' + s.slice.apply(s, range) + '</strong>' + s.substring(range[1]);
            }, item);
          }
        }, options));
    },
    _clearListeners: function () {
      this._input.off('keydown');
    },
    _onQueryChange: function (e) {
      this.events.fire('querychange', {
        query: this._input.val()
      });
    },
    setSuggestBounds: function (bounds) {
      this._options.boundedBy = bounds;
    },
    getRequest: function () {
      return this._input.val();
    }
  });

  provide(SuggestView);
});
