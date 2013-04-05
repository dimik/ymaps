function TrafficView(model) {
    this._model = model;
    this._buttons = $(':button');
    this._info = $('#status');
    this._statusTemplate = $('#trafficStatusTemplate').template('statusTemplate');

    this._attachHandlers();
}

TrafficView.DAYS_OF_WEEK = {
    sun: 'Воскресенье',
    mon: 'Понедельник',
    tue: 'Вторник',
    wen: 'Среда',
    thu: 'Четверг',
    fri: 'Пятница',
    sat: 'Суббота'
};

TrafficView.prototype = {
    constructor: TrafficView,
    _attachHandlers: function () {
        this._buttons
            .on('click', $.proxy(this._onButtonClick, this));
        this._model.events.add('change', this._onModelChange, this);
    },
    _detachHandlers: function () {
        this._buttons
            .off('click');
        this._model.events.remove('change', this._onModelChange, this);
    },
    _onButtonClick: function (e) {
        var provider = e.target.id;

        this._model.setProvider(provider);
    },
    _onModelChange: function (e) {
        this._info.html($.tmpl(this._statusTemplate, {
            dayOfWeek: e.get('dayOfWeek'),
            hours: e.get('hours'),
            minutes: e.get('minutes'),
            level: e.get('level')
        }, {
            getBadgeColor: this._getBadgeColor,
            getDay: this._getDay,
            decline: this._decline
        }));
    },
    _getBadgeColor: function (level) {
        if(level < 4) {
            return 'success';
        }
        else if(level > 6) {
            return 'important';
        }
        else {
            return 'warning';
        }
    },
    _decline: function (n, w) {
        n = n >= 0 ? n : 0;
        w = w || ['балл', 'балла', 'баллов'];

        if(n % 100 >= 11 && n % 100 <= 20) {
            return w[2];
        }
        else if(n % 10 === 1) {
            return w[0];
        }
        else if(n % 10 >= 2 && n % 10 <= 4) {
            return w[1];
        }
        else {
            return w[2];
        }
    },
    _getDay: function (dayOfWeek) {
        return TrafficView.DAYS_OF_WEEK[dayOfWeek];
    }
};
