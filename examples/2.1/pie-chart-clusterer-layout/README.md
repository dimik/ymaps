# Yandex Maps API PieChartClusterer Module

**PieChartClusterer** is an extention of standard [Yandex Maps JS API 2.1 Clusterer](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer-docpage/)
that represents numerical proportion of different [Placemark](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark-docpage/)
 [types](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage-docpage/)
in [Cluster](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark-docpage/).
`PieChartClusterer` class allows to construct and display such representations over geographical maps using [PieChart](http://en.wikipedia.org/wiki/Pie_chart) icon.

Loading
-------

1. Put module source code ([pie-chart-clusterer.min.js](https://github.com/yandex/ymaps-pie-chart-clusterer/blob/master/build/pie-chart-clusterer.min.js)) on your CDN.

2. Load both [Yandex Maps JS API 2.1](http://api.yandex.com/maps/doc/jsapi/) and module source code by adding following code into &lt;head&gt; section of your page
```html
<script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
<!-- Change my.cdn.tld to your CDN host name -->
<script src="http://my.cdn.tld/pie-chart-clusterer.min.js" type="text/javascript"></script>
```

3. Get access to module functions by using [ymaps.modules.require](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/modules.require.xml) method
```js
ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
    /**
     * Supports all Clusterer constructor options.
     * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer-docpage/
     */
    var clusterer = new PieChartClusterer({margin: 10});
});
```

Demo
----
http://yandex.github.io/ymaps-pie-chart-clusterer/


Examples
--------
* Displaying Clusterer of different Placemark types.
```js
ymaps.ready(function () {
    var myMap = new ymaps.Map('YMapsID', {
        center: [55.7517318022522, 37.61691485505143],
        zoom: 10
    });
    ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
        var clusterer = new PieChartClusterer();
        var points = [
            new ymaps.Placemark(
                [55.75498702962238, 37.618202315378575],
                {balloonContent: 'museum'},
                {preset: 'islands#brownIcon'}
            ),
            new ymaps.Placemark(
                [55.754662597966856, 37.621551735588916],
                {balloonContent: 'shopping centre'},
                {preset: 'islands#blueIcon'}
            ),
            new ymaps.Placemark(
                [55.753610957072794, 37.6258667510446],
                {balloonContent: 'shopping centre'},
                {preset: 'islands#blueIcon'}
            ),
            new ymaps.Placemark(
                [55.752475871211445, 37.623210672898345],
                {balloonContent: 'temple'},
                {preset: 'islands#greenIcon'}
            ),
            new ymaps.Placemark(
                [55.755421360094026, 37.622878078980506],
                {balloonContent: 'cafe'},
                {preset: 'islands#redIcon'}
            ),
            new ymaps.Placemark(
                [55.75573597375927, 37.62162280516154],
                {balloonContent: 'restaurant'},
                {preset: 'islands#orangeIcon'}
            )
        ];

        clusterer.add(points);
        myMap.geoObjects.add(clusterer);
    });
});
```


Building
--------
Use [ym-builder](https://www.npmjs.org/package/ym-builder) if re-build is needed.
