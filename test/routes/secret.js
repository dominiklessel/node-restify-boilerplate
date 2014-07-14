
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

var route = '/secret';

var testName = util.format(
  'Root [%s]',
  route
);

describe(testName, function() {

  var userName = 'dominik';

  it('[GET as '+userName+'] - should return status code 200', function( done ) {
    get( route, userName )
      .expect( 200 )
      .end(function( err, res ) {
        if ( !!err ) {
          console.error( res.body );
          return done( err );
        }
        return done();
      });
  });

  it('[GET as '+userName+'] - should respond with json', function( done ) {
    get( route, userName )
      .set( 'Accept', 'application/json' )
      .expect( 'Content-Type', /json/ )
      .expect( 200, done );
  });

  it('[GET as '+userName+'] - should return status code 200', function( done ) {
    get( route + '/foo', userName )
      .expect( 200 )
      .end(function( err, res ) {
        if ( !!err ) {
          console.error( res.body );
          return done( err );
        }
        return done();
      });
  });

});
