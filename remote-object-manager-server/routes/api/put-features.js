var inspector = require('schema-inspector');
var schema = require('../../schema/geojson.js');

var StorageFacade = require('../../lib/storage/facade');
var storage = new StorageFacade();

var FeatureIds = require('../../lib/serializer/feature-ids');
var fIds = new FeatureIds();

module.exports = function (req, res) {
  var result = inspector.validate(schema['FeatureCollection'], req.body);
  if(result.valid) {
    storage.addFeatures(req.body.features)
      .then(function (data) {
        var ids = data.serialize(fIds).getData();

        res.json({
          "error": null,
          "data": {
            "total": ids.length,
            "ids": ids
          }
        });
      })
      .fail(function (err) {
        console.log(err, err.stack);
        res.status(500).json({
          "error": err.message,
          "stack": err.stack
        });
      });
  }
  else {
    res.status(400).json({
      "error": result.format()
    });
  }
};
