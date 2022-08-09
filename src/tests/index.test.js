// index.js

const express = require('express'); // (npm install --save express)
const request = require('supertest');
const app = require('../server');

// get .env variables
const notionDbId = process.env.NOTION_DATABASE_ID
const wordpressApiUrl = process.env.WORDPRESS_API_URL


// Test the route /api/test
describe('API test route', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/test')
      // expect the string test to be in the response body
      .expect('test', done);
  });
})

// Test the route /api/conf/kepler
describe('API kepler conf route', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/conf/kepler')
      // expect to have a json response
      .expect('Content-Type', /json/, done)
  })
})

// Test the route /api/conf/instance
describe('API instance conf route', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/conf/instance')
      // expect to have a json response
      .expect('Content-Type', /json/, done);
  })
})

// Test the route /api/data/notion/notion_database_id
describe('API get notion data', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/data/notion/' + notionDbId)
      // expect to have a json response
      .expect('Content-Type', /json/, done);
  })
})

// Test the route /api/data/wordpress/ tree_hotspots
describe('API get wordpress data type Arbres', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/data/wordpress/' + wordpressApiUrl + '%2Fwp-json%2Fwp%2Fv2%2Ftrees_hotspot%2F')
      // expect to have a json response
      .expect('Content-Type', /json/, done);
  })
})

// Test the route /api/data/wordpress/ events
describe('API get wordpress data type Evenements', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/data/wordpress/' + wordpressApiUrl + '%2Fwp-json%2Fwp%2Fv2%2Fevenement%2F')
      // expect to have a json response
      .expect('Content-Type', /json/, done);
  })
})

// Test the route /api/data/wordpress/ Projets
describe('API get wordpress data type Projet ', function() {
  it('should return a 200 response', function(done) {
    request(app)
      .get('/api/data/wordpress/' + wordpressApiUrl + '%2Fwp-json%2Fwp%2Fv2%2Fprojet%2F')
      // expect to have a json response
      .expect('Content-Type', /json/, done);
  })
})