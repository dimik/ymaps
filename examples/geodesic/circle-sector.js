function CircleSector(map) {
    this._model = new CircleSector.Model(map);
    this._view = new CircleSector.MapView(map);
    this.state = new ymaps.data.Manager(this.getDefaultState());
    this._monitor = new ymaps.Monitor(this.state);
    this._setupMonitor();
}

CircleSector.prototype = {
    constructor: CircleSector,
    getModel: function () {
        return this._model;
    },
    startDrawing: function () {
        this.state.set('drawing', true);
    },
    stopDrawing: function () {
        this.state.set('drawing', false);
    },
    _setupMonitor: function () {
        this._monitor
            .add('drawing', this._onDrawingChange, this)
            .add('center', this._onCenterChange, this)
            .add('radius', this._onRadiusChange, this)
            .add('sector', this._onSectorChange, this);
    },
    _clearMonitor: function () {
        this._monitor.removeAll();
    },
    _onDrawingChange: function (drawing) {
        if(drawing) {
            this._attachHandlers();
            this._model.listen(['mousedown', 'mousemove']);
            this._view
                .setCursor('crosshair');
        }
        else {
            this._model.unlisten(['mousemove', 'mousedown']);
            this._detachHandlers();
            // this._clearMonitor();
        }
    },
    _attachHandlers: function () {
        this._model.events
            .add('mousedown', this._onMouseDown, this)
            .add('mouseup', this._onMouseUp, this)
            .add('mousemove', this._onMouseMove, this)
            .add('click', this._onClick, this);
    },
    _detachHandlers: function () {
        this._model.events
            .remove('click', this._onClick, this)
            .remove('mousemove', this._onMouseMove, this)
            .remove('mouseup', this._onMouseUp, this)
            .remove('mousedown', this._onMouseDown, this);
    },
    _onMouseDown: function (e) {
        var position = e.get('coordPosition');

        this.state
            .set('center', position)
            .set('radius', [ position, position ]);
        this._model
            .unlisten('mousedown')
            .listen('mouseup');
        this._view
            .setCenterIcon('radius')
            .setCursor('move');
    },
    _onMouseUp: function (e) {
        var center = this.state.get('center'),
            position = e.get('coordPosition');

        this.state
            .set('radius', [ center, position ])
            .set('sector', position);
        this._model
            .unlisten('mouseup')
            .listen('click');
        this._view
            .setCenterIcon('sector')
            .setCursor('hand');
    },
    _onMouseMove: function (e) {
        var state = this.state,
            position = e.get('coordPosition');

        if(state.get('sector')) {
            state.set('sector', position);
        }
        else if(state.get('radius')) {
            state.set('radius', [ state.get('center'), position ]);
        }
        else {
            state.set('center', position);
        }
    },
    _onClick: function (e) {
        this.state.set('sector', e.get('coordPosition'));

        this._model
            .unlisten(['click', 'mousemove']);
    },
    _onCenterChange: function (center) {
        this._view
            .setCenter(center);
    },
    _onRadiusChange: function (radius) {
        this._view
            .drawRadius(radius);
    },
    _onSectorChange: function (sector) {
        this._view
            .drawSector(sector);
    },
    getDefaultState: function () {
        return {
            drawing: false,
            editing: false,
            center: null,
            radius: null,
            sector: null
        };
    }
};
