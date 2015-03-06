ym.modules.define('PieChartClustererLayout', [
    'templateLayoutFactory',
    'util.extend',
    'PieChartClusterer.icon.params',
    'PieChartClusterer.component.Canvas'
], function (
    provide,
    templateLayoutFactory,
    extend,
    iconParams,
    PieChartClustererCanvas
) {

    var STYLE_REG_EXP = /#(.+?)(?=Icon|DotIcon|StretchyIcon|CircleIcon|CircleDotIcon)/;

    var PieChartClustererLayout = templateLayoutFactory.createClass('<ymaps>{{ features.length }}</ymaps>', {
	build: function () {
    	    PieChartClustererLayout.superclass.build.call(this);

	    this._element = this.getParentElement().firstChild;
	    var canvas = new PieChartClustererCanvas(iconParams.icons.large.size);
	    canvas.options.setParent(this.options);
	    	    
	    var geoObjects = this.getData().features;
            var styleGroups = geoObjects.reduce(function (groups, geoObject) {
                var style = getIconStyle(geoObject.options.preset, 'islands#blueIcon');

                groups[style] = ++groups[style] || 1;

                return groups;
            }, {});
            var iconUrl = canvas.generateIconDataURL(styleGroups, geoObjects.length);
	    this._element.position = 'absolute';
	    this._element.style.width = '50px';
	    this._element.style.height = '50px';
	    this._element.style.background = 'url("' + iconUrl + '") no-repeat fixed center';
	},
	clear: function () {
    	    PieChartClustererLayout.superclass.clear.call(this);
	}
    });

    function getIconStyle(preset) {
        return preset.match(STYLE_REG_EXP)[1];
    }

    provide(PieChartClustererLayout);
});
