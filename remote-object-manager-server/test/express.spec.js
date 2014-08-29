'use strict';

var should = require('should');
var request = require('supertest');
var inspector = require('schema-inspector');
var fs = require('fs');
var url = require('url');
var config = require('../config').get('server');
var _ = require('underscore');

describe('Geohosting API', function () {
  /*
  var apiUrl = url.format(_.extend({
    slashes: true
  }, config));
  */
  var apiUrl = 'http://nodejs-geohosting.rhcloud.com';

  var actionPutUrl = '/api/v1/features';
  describe('PUT ' + actionPutUrl, function () {
    it('should add valid GeoJSON data', function (done) {
      var data = JSON.parse(fs.readFileSync("./test/data/feature-collection.valid.json"));

      request(apiUrl)
        .put(actionPutUrl)
        .set('ContentType', 'application/json')
        .send(data)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if(err) {
            done(err);
          }
          else {
            var actual = JSON.parse(res.text);

            var schema = require("./schema/feature-collection.ok.put.res.schema.json");
            var result = inspector.validate(schema, actual);
            (result.valid).should.be.equal(true, result.format());

            done();
          }
        });
    });

    it('should return 400 with invalid GeoJSON', function (done) {
      var data = JSON.parse(fs.readFileSync("./test/data/feature-collection.invalid.json"));

      request(apiUrl)
        .put(actionPutUrl)
        .set('ContentType', 'application/json')
        .send(data)
        .expect("Content-Type", /json/)
        .expect(400)
        .end(function (err, res) {
          if(err) {
            done(err);
          }
          else {
            var actual = JSON.parse(res.text);

            var schema = require("./schema/feature-collection.invalid.put.res.schema.json");
            var result = inspector.validate(schema, actual);
            (result.valid).should.be.equal(true, result.format());

            done();
          }
        });
    });
  });

  var actionGetUrl = '/api/v1/features';
  describe.skip('GET ' + actionGetUrl, function () {
    it('should return GeoJSON data', function (done) {
      request(apiUrl)
        .get(actionGetUrl)
        .set('ContentType', 'application/json')
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if(err) {
            done(err);
          }
          else {
            var actual = JSON.parse(res.text);

            var schema = require('./schema/feature-collection.ok.get.res.schema.json');
            var result = inspector.validate(schema, actual);
            (result.valid).should.be.equal(true, result.format());

            done();
          }
        });
    });
  });

  var actionGetClusteredUrl = '/api/v1/features?bbox=36.5625,55.3589,38.6719,56.1519&zoom=10&callback=id_140926056083729104254&clusterize=1';
  describe('GET ' + actionGetClusteredUrl, function () {
    it('should return clustered GeoJSON data', function (done) {
      request(apiUrl)
        .get(actionGetClusteredUrl)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if(err) {
            done(err);
          }
          else {
            var actual = JSON.parse(res.text);

            var schema = require('./schema/feature-collection.ok.get.res.schema.json');
            var result = inspector.validate(schema, actual);
            (result.valid).should.be.equal(true, result.format());

            done();
          }
        });
    });
  });

});
