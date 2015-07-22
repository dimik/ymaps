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

    var cssStyles = [
	'font:10pt arial,sans-serif',
	'position:absolute',
	'display:block',
	'text-align:center',
	'background-repeat:no-repeat',
	'background-position:center'
    ];
    var PieChartClustererLayout = templateLayoutFactory.createClass('<ymaps style="' + cssStyles.join(';') + '">{{ features.length }}</ymaps>', {
	build: function () {
    	    PieChartClustererLayout.superclass.build.call(this);

	    var geoObjects = this.getData().features;
	    var sizeType = geoObjects.length >= 100? 'large'
		: geoObjects.length >= 10? 'medium' : 'small';
	    var icon = this._icon = iconParams.icons[sizeType];
	    var size = icon.size;
	    var offset = icon.offset;
	    var element = this.getParentElement().firstChild.firstChild;
	    var canvas = new PieChartClustererCanvas(iconParams.icons.large.size);
	    canvas.options.setParent(this.options);
            var styleGroups = geoObjects.reduce(function (groups, geoObject) {
                var style = getIconStyle(geoObject.options.preset, 'islands#blueIcon');

                groups[style] = ++groups[style] || 1;

                return groups;
            }, {});
            var iconUrl = canvas.generateIconDataURL(styleGroups, geoObjects.length);
	    element.style.width = size[0] + 'px';
	    element.style.height = size[1] + 'px';
	    element.style.left = offset[0] + 'px';
	    element.style.top = offset[1] + 'px';
	    element.style['line-height'] = size[1] + 'px';
	    element.style['background-image'] = 'url(' + iconUrl + ')';
	    element.style['background-size'] = size[0] + 'px ' + size[1] + 'px';
	},
	clear: function () {
    	    PieChartClustererLayout.superclass.clear.call(this);
	},
	getShape: function () {
	    return this._icon.shape;
	}
    });

    function getIconStyle(preset) {
        return preset.match(STYLE_REG_EXP)[1];
    }

    provide(PieChartClustererLayout);
});
