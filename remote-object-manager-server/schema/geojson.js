var inspector = require('schema-inspector');

exports['coordinates'] = {
  "type": "array",
  "exactLength": 2,
  "items": [
    { "type": "number", "gte": -180, "lte": 180 - 1e-10 },
    { "type": "number", "gte": -90, "lte": 90 }
  ]
};

exports['Point'] = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "eq": "Point"
    },
    "coordinates": {
      "exec": function (schema, coordinates) {
        var result = inspector.validate(exports['coordinates'], coordinates);

        result.valid || this.report(result.format());
      }
    }
  }
};

exports['bbox'] = {
  "type": "array",
  "optional": true,
  "exactLength": 4,
  "items": [
    { "type": "number", "gte": -180, "lte": 180 - 1e-10 },
    { "type": "number", "gte": -90, "lte": 90 },
    { "type": "number", "gte": -180, "lte": 180 - 1e-10 },
    { "type": "number", "gte": -90, "lte": 90 }
  ]
};

exports['Feature'] = {
  "type": "object",
  "properties": {
    "id": {
      "optional": true,
      "type": ["string", "number"]
    },
    "type": {
      "type": "string",
      "eq": "Feature"
    },
    "geometry": {
      "exec": function (schema, geometry) {
        var result = inspector.validate(exports['Point'], geometry);

        result.valid || this.report(result.format());
      }
    },
    "bbox": {
      "optional": true,
      "exec": function (schema, bbox) {
        var result = inspector.validate(exports['bbox'], bbox);

        result.valid || this.report(result.format());
      }
    }
  }
};

exports['FeatureCollection'] = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "eq": "FeatureCollection"
    },
    "features": {
      "type": "array",
      "items": {
        "exec": function (schema, feature) {
          var result = inspector.validate(exports['Feature'], feature);

          result.valid || this.report(result.format());
        }
      }
    },
    "bbox": {
      "optional": true,
      "exec": function (schema, bbox) {
        var result = inspector.validate(exports['bbox'], bbox);

        result.valid || this.report(result.format());
      }
    }
  }
};
