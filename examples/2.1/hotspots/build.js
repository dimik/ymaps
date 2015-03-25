var vow = require('vow');
var fs = require('vow-fs');
var util = require('util');

function getTilesCount(zoom) {
  return Math.pow(2, zoom);
}

function formatHotspotData(features) {
  var data = {
    data: {
      type: "FeatureCollection",
      "features": features || []
    }
  };

  return util.format('hotspot_callback(%j)', data);
}

[4, 5, 6].forEach(function (n) {
  var tilesCount = getTilesCount(n);
  var handlers = [];

  for(var x = 0; x < tilesCount; x++) {
    for(var y = 0; y < tilesCount; y++) {
      var p = util.format('hotspots/%s/hotspot-%s-%s.js', n, x, y);
      var data = formatHotspotData();
      handlers.push(fs.write(p, data));
    }
  }

  vow.all(handlers)
    .then(function (res) {
      util.log('%d files have written for zoom %d', res.length, n);
      fs.read(util.format('data/%s.json', n))
        .then(function (buf) {
          var tiles = {};
          var data = JSON.parse(buf);

          data.forEach(function (it) {
            it.tiles.forEach(function (t) {
              var key = t.tile[0] + '-' + t.tile[1];

              tiles[key] || (tiles[key] = []);
              tiles[key].push({
                "type": "Feature",
                "properties": {
                  "hintContent": it.text,
                  "HotspotMetaData": {
                    "id": it.id,
                    "RenderedGeometry": {
                      "type": "Rectangle",
                      "coordinates": t.coords
                    }
                  }
                }
              });
            });
          });

          var handlers = [];

          for(var tile in tiles) {
            handlers.push(
              fs.write(
                util.format('hotspots/%s/hotspot-%s.js', n, tile),
                formatHotspotData(tiles[tile])
              )
            );
          }
          return vow.all(handlers);
        })
        .then(function (res) {
          console.log('%d tiles data have written for zoom %d', res.length, n);
        });
    });
});
