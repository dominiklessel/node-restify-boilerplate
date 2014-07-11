
'use strict';

/**
 * Module dependencies.
 */

var util = require('util');
var crypto = require('crypto');
var path = require('path');
var nconf = require('nconf').file({
  file : path.join( __dirname, '..', '..', 'config', 'global.json' )
});

var request = require('supertest')('http://localhost:' + nconf.get('Server:Port') );


/**
 * Config
 */

var scheme = nconf.get('Security:Scheme');
var dateIdentifier = 'X-Custom-Date';

var key = 'df7cab0c18e3c3d82b977bcd667d1aeb70ada9fd';
var secret = '33yrDBjjw9grl3vNZn0a63Ctqf0=';

/**
 * Signature
 */

var getAuthorizationHeader = function( aScheme, aKey, aSecret, aStringToSign ) {
  var sha1 = crypto.createHmac( 'sha1', aSecret );
  var hash = sha1.update( aStringToSign ).digest('hex');
  var signature = new Buffer( hash ).toString( 'base64' );
  return util.format( '%s %s:%s', aScheme, aKey, signature );
};

/**
 * Auth config
 */

var dateString = new Date().toUTCString();
var headers = {};
headers.Authorization = getAuthorizationHeader( scheme, key, secret, dateString );
headers[ dateIdentifier ] = dateString;

/**
 * Export
 */

module.exports.get = function( path, useCredentials ) {

  var get = request.get( path );

  if ( useCredentials === true ) {
    get
      .set('authorization', headers.Authorization )
      .set( dateIdentifier, headers[dateIdentifier] );
  }

  return get;

};
