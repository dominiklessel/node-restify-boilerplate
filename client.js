
/**
 * Module dependencies.
 */

var path = require('path');
var util = require('util');
var crypto = require('crypto');

var restify = require('restify');

/**
 * Config
 */

var scheme = 'Custom';
var dateIdentifier = 'X-Custom-Date';
var key = 'df7cab0c18e3c3d82b977bcd667d1aeb70ada9fd';
var secret = '33yrDBjjw9grl3vNZn0a63Ctqf0=';

/**
 * Signature
 */

var getAuthorizationHeader = function( aScheme, aKey, aSecret, aStringToSign ) {
  var sha1 = crypto.createHmac( 'sha1', aSecret );
  var hash = sha1.update( aStringToSign ).digest('hex');
  var signature = new Buffer( hash ).toString( 'base64' )
  return util.format( '%s %s:%s', aScheme, aKey, signature );
};

/**
 * Client
 */

var dateString = new Date().toUTCString();

var headers = {
  'Authorization': getAuthorizationHeader( scheme, key, secret, dateString ),
  'X-Custom-Date': dateString
};

var client = restify.createJsonClient({
  url: 'http://localhost:8080/',
  version: '*',
  headers: headers
});

client.get('/', function( err, req, res, obj ) {
  if ( err ) {
    console.dir( err );
    process.exit();
  }
  console.dir( obj );
  process.exit();
});
