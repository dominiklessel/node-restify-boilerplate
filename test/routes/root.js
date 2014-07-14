
'use strict';

/**
 * Moduel dependencies
 */

var path = require('path');
var util = require('util');
var get = require( path.join(__dirname,'..','utils','client') ).get;

/**
 * Tests
 */

var route = '/';

var testName = util.format(
  'Root [%s]',
  route
);

describe(testName, function() {

  describe('[GET as `dominik`]', function() {

    it('[GET as dominik] - should return status code 200', function( done ) {
      get( route, 'dominik' )
        .expect( 200 )
        .end(function( err, res ) {
          if ( !!err ) {
            console.error( res.body );
            return done( err );
          }
          return done();
        });
    });

    it('[GET as dominik] - should respond with json', function( done ) {
      get( route, 'dominik' )
        .set( 'Accept', 'application/json' )
        .expect( 'Content-Type', /json/ )
        .expect( 200, done );
    });

  });

  describe('[GET as `not_dominik`]', function() {

    it('[GET as not_dominik] - should return status code 200', function( done ) {
      get( route, 'not_dominik' )
        .expect( 200 )
        .end(function( err, res ) {
          if ( !!err ) {
            console.error( res.body );
            return done( err );
          }
          return done();
        });
    });

    it('[GET as not_dominik] - should respond with json', function( done ) {
      get( route, 'not_dominik' )
        .set( 'Accept', 'application/json' )
        .expect( 'Content-Type', /json/ )
        .expect( 200, done );
    });

  });

  describe('[GET as `anonymous`]', function() {

    it('[GET as anonymous] - should return status code 200', function( done ) {
      get( route, 'anonymous' )
        .expect( 200 )
        .end(function( err, res ) {
          if ( !!err ) {
            console.error( res.body );
            return done( err );
          }
          return done();
        });
    });

    it('[GET as anonymous] - should respond with json', function( done ) {
      get( route, 'anonymous' )
        .set( 'Accept', 'application/json' )
        .expect( 'Content-Type', /json/ )
        .expect( 200, done );
    });

  });

});
