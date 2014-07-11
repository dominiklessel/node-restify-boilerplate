
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

  it('should return status code 200', function( done ) {
    get( route, true )
      .expect( 200 )
      .end(function( err ){
        if ( !!err ) {
          return done( err );
        }
        return done();
      });
  });

  it('should return status code 400, if auth header is missing', function( done ) {
    get( route, false )
      .expect( 400 )
      .end(function( err ){
        if ( !!err ) {
          return done( err );
        }
        return done();
      });
  });

  it('should respond with json', function( done ) {
    get( route, true )
      .set( 'Accept', 'application/json' )
      .expect( 'Content-Type', /json/ )
      .expect( 200, done );
  });

});
