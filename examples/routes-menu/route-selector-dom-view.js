function RouteSelectorDomView(container) {
    this._container = container;
    this._element = $('<ul class="nav nav-list"/>');
    this._itemTemplate = '<li><a href="#">#{name}</a></li>';
    this._activeItem = null;
    this.events = $({});

    this._attachHandlers();
    this._container.append(this._element);
}

RouteSelectorDomView.prototype = {
    constructor: RouteSelectorDomView,
    _attachHandlers: function () {
        this._element.on('click', $.proxy(this._onItemSelected, this));
    },
    _detachHandlers: function () {
        this._element.off();
    },
    _onItemSelected: function (e) {
        e.preventDefault();

        var item = $(e.target).parent(),
            index = this._element.children().index(item);

        this.events.trigger($.Event('itemselected', {
            itemIndex: index
        }));
    },
    setActiveItem: function (index) {
        this._activeItem = this._element.children().eq(index)
            .addClass('active');

        return this;
    },
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem.removeClass('active');
            this._activeItem = null;
        }

        return this;
    },
    render: function (data) {
        for(var i = 0, len = data.length; i < len; i++) {
            this._element.append(
                this._itemTemplate.replace('#{name}', data[i].name)
            );
        }

        return this;
    },
    clear: function () {
        this._element.empty();
        this.unsetActiveItem();
        this._detachHandlers();

        return this;
    }
};
