function TrafficModel(map, options) {
    this._map = map;
    this._options = options || {};
    this._provider = null;
    this._monitor = null;
    this._providers = {
        actual: new ActualProvider(),
        archive: new ArchiveProvider()
    };

    this.events = new ymaps.event.Manager();
}

TrafficModel.prototype = {
    constructor: TrafficModel,
    getProvider: function () {
        return this._provider;
    },
    setProvider: function (key) {
        if(this._provider === this._providers[key]) {
            return;
        }
        this._clearProvider();
        this._setupProvider(this._providers[key]);
    },
    showInfoLayer: function () {
        this._provider.state.set('infoLayerShown', true);
    },
    hideInfoLayer: function () {
        this._provider.state.set('infoLayerShown', false);
    },
    _setupProvider: function (provider) {
        this._provider = provider;
        provider.setMap(this._map);
        this._setupUpdater();
        this._setupMonitor();
    },
    _clearProvider: function () {
        if(this._provider) {
            this._provider.setMap(null);
            this._clearUpdater();
            this._clearMonitor();
        }
    },
    _setupUpdater: function () {
        if(this._options.autoUpdate) {
            this._intervalId = window.setInterval(
                ymaps.util.bind(function () {
                    this._provider.update();
                }, this)
            , this._provider.getUpdateTimeout() * 60 * 1000);
        }
    },
    _clearUpdater: function () {
        if(this._intervalId) {
            window.clearTimeout(this._intervalId);
        }
    },
    _setupMonitor: function () {
        this._monitor = new ymaps.Monitor(this._provider.state);
        // this._monitor.add(['level', 'timestamp', 'timeZone', 'localtime'], this._onStateChange, this);
        this._provider.state.events.add('change', this._onProviderStateChange, this);
    },
    _clearMonitor: function () {
        this._monitor.removeAll();
        this._monitor = null;
    },
    _onStateChange: function (data) {
        if(this._isData(data)) {
            this.events.fire('change', ymaps.util.extend(this._provider.getTime(), data));
        }
    },
    _onProviderStateChange: function (e) {
        var data = e.get('target').getAll();

        if(this._isData(data)) {
            this.events.fire('change', ymaps.util.extend(this._provider.getTime(), data));
        }
    },
    _isData: function (data) {
        return !(
            data.level == null ||
            data.localtime == null ||
            data.timestamp == null ||
            'timeZone' in data && data.timeZone == null
        );
    }
};

function ArchiveProvider() {
    ymaps.traffic.provider.Archive.apply(this, arguments);
    /**
     * Чаще запрашивать смысла нет, так как данные на сервере доступны для моментов времени с разницей в 15 минут.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/traffic.provider.Archive.xml
     */
    this._updateTimeout = 15;
}

ymaps.ready(function () {
    ymaps.util.augment(ArchiveProvider, ymaps.traffic.provider.Archive, {
        getUpdateTimeout: function () {
            return this._updateTimeout;
        },
        update: function () {
            this.state.set('timestamp', this.state.get('timestamp') + this.getUpdateTimeout() * 60);
        }
    });
});

function ActualProvider() {
    ymaps.traffic.provider.Actual.apply(this, arguments);
    /**
     * Оставил значение по-умолчанию (4 минуты).
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/traffic.provider.Actual.xml
     */
    this._updateTimeout = 4;
}

ActualProvider.DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];

ymaps.ready(function () {
    ymaps.util.augment(ActualProvider, ymaps.traffic.provider.Actual, {
        getUpdateTimeout: function () {
            return this._updateTimeout;
        },
        getTime: function () {
            var date = new Date();

            return {
                dayOfWeek: ActualProvider.DAYS_OF_WEEK[date.getDay()],
                hours: Number(date.getHours()),
                minutes: Number(date.getMinutes())
            };
        }
    });
});
