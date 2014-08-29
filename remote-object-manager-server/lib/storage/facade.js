'use strict';

var inherit = require('inherit');
var vow = require('vow');
var ModelManager = require('./model-manager');
var DataSet = require('./data-set');
var FeatureSerializer = require('../serializer/features');
var fS = new FeatureSerializer();

module.exports = inherit(/** @lends StorageFacade.prototype */{
  /**
   * @constructor
   */
  __constructor: function () {
    /**
     * Singleton
     */
    var Cls = this.__self;

    if(Cls.__instance) {
      return Cls.__instance;
    }
    Cls.__instance = this;

    this._models = ModelManager.create([
      'features',
      'features-admin'
    ]);
  },
  addFeatures: function (features) {
    return this._models.get('features-admin')
      .insert(features)
      .then(this._serializeFeatures);
  },
  findFeatures: function (params) {
    return this._models.get('features')
      .find({})
      .then(this._serializeFeatures);
  },
  findFeaturesInBounds: function (bounds) {
    return this._models.get('features')
      .findInBounds(bounds)
      .then(this._serializeFeatures);
  },
  findFeaturesInside: function (geometry) {
    return this._models.get('features')
      .findInside(geometry)
      .then(this._serializeFeatures);
  },
  findFeaturesNear: function (coordinates) {
    return this._models.get('features')
      .findNear(coordinates)
      .then(this._serializeFeatures);
  },
  _serializeFeatures: function (features) {
    return (
      new DataSet(features)
    ).serialize(fS);
  }
});
