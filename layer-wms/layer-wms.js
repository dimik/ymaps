ymaps.modules.define('LayerWMS', [
  'Layer',
  'projection.wgs84Mercator',
  'projection.sphericalMercator',
  'projection.Cartesian',
  'util.extend'
 ], function (provide, Layer, wgs84Mercator, sphericalMercator, Cartesian, extend) {
   var DEFAULT_WMS_PARAMS = {
     request: 'GetMap',
     layers: '',
     styles: '',
     format: 'image/jpeg',
     transparent: false,
     version: '1.1.1',
     crs: null, // WMS 1.3.0 only
     srs: null, // WMS 1.1.1 and earlier only
     width: 256,
     height: 256,
     // Some servers need correction
     offsetX: 0,
     offsetY: 0
   };
   function getProjection(crs, options) {
     switch(true) {
       case /^(CRS:84|EPSG:4326)$/i.test(crs):
         return wgs84Mercator;
       case /^EPSG:3857$/i.test(crs): // Google, OSM
         return sphericalMercator;
       case /^CRS:1$/i.test(crs): // Cartesian
         return new Cartesian([
           [-options.width, -options.height],
           [+options.width, +options.height]
         ]);
       default:
         throw(new TypeError('Invalid CRS'));
     }
   }
   function getCrs(projection) {
     switch(true) {
       case projection === wgs84Mercator:
         return 'CRS:84';
       case projection === sphericalMercator:
         return 'EPSG:3857';
       case projection instanceof Cartesian:
         return 'CRS:1';
     }
     return 'EPSG:4326';
   }
   function LayerWMS(baseUrl, options) {
     var opts = extend({}, DEFAULT_WMS_PARAMS, options);
     var crs = opts.crs || opts.srs;
     var layer = new Layer('', extend({
       tileTransparent: opts.transparent,
     }, crs && {projection: getProjection(crs, opts)}));

     layer.getTileUrl = function (tileNumber, tileZoom) {
       var map = this.getMap();
       var projection = this.options.get('projection', map.options.get('projection'));
       var pixelBounds = [
         [tileNumber[0] * opts.width, tileNumber[1] * opts.height],
         [(tileNumber[0] + 1) * opts.width, (tileNumber[1] + 1) * opts.height]
       ];
       var bounds = pixelBounds.map(function (pixelPoint) {
         return projection.fromGlobalPixels(pixelPoint, tileZoom);
       });
       var wmsParams = extend({}, opts, {
         bbox: [
           bounds[0][1] + opts.offsetX,
           bounds[1][0] + opts.offsetY,
           bounds[1][1] + opts.offsetX,
           bounds[0][0] + opts.offsetY,
         ].join(),
         transparent: String(opts.transparent).toUpperCase(),
         crs: opts.crs || getCrs(projection),
         srs: opts.srs || getCrs(projection) // fallback for old WMS versions
       });
       return baseUrl + (baseUrl.indexOf('?') > -1 ? '&' : '?') +
         Object.keys(wmsParams)
           .filter(function (param) { return Boolean(wmsParams[param]) })
           .reduce(function (urlParts, param) {
             var name = encodeURI(param);
             return urlParts.concat([
               opts.uppercase ? name.toUpperCase() : name,
               encodeURI(wmsParams[name])
             ].join('='));
           }, []).join('&');
     };
     return layer;
   }

   provide(LayerWMS);
});
