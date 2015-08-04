ym.modules.define('form-view', [
  'util.defineClass',
  'util.bind',
  'event.Manager',
  'suggest-view'
], function (provide, defineClass, bind, EventManager, SuggestView) {
  var FormView = defineClass(function () {
    this.events = new EventManager({ context: this });

    var form = this._form = jQuery('form');
    this._controls = form.find('.control-group');
    this._message = form.find('.help-inline');
    this._suggestView = new SuggestView();

    this._setupListeners();
  }, {
    _setupListeners: function () {
      this._form
        .on('submit', bind(this._onFormSubmit, this));
      this._suggestView.events
        .add('querychange', this.hideMessage, this);
    },
    _clearListeners: function () {
      this._form.off("submit");
      this._suggestView.events
        .remove('querychange', this.hideMessage, this);
    },
    _onFormSubmit: function (e) {
      e.preventDefault();

      this.events.fire('requestsubmit', {
        request: this._suggestView.getRequest()
      });
    },
    showMessage: function (text) {
      this._controls
          .addClass('error');
      this._message
          .removeClass('invisible')
          .text(text instanceof Error? text.message : text);
    },
    hideMessage: function () {
      this._controls
          .removeClass('error');
      this._message
          .addClass('invisible')
          .text('');
    },
    setSuggestBounds: function (bounds) {
      this._suggestView.setSuggestBounds(bounds);
    }
  });
  provide(FormView);
});
