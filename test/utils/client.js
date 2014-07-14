
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
var stringTosing = nconf.get('Security:StringToSign');
var users = nconf.get('Security:Users');

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

var stringToSign = new Date().toUTCString();
var headers = {};

users.forEach(function( user ) {
  if ( !user.key || !user.secret ) {
    headers[user.name] = {};
    headers[user.name].Authorization = '';
    headers[user.name][stringTosing] = '';
    return;
  }
  headers[user.name] = {};
  headers[user.name].Authorization = getAuthorizationHeader( scheme, user.key, user.secret, stringToSign );
  headers[user.name][stringTosing] = stringToSign;
});


/**
 * Export
 */

module.exports.get = function( path, user ) {

  var get = request
      .get( path )
      .set('authorization', headers[user].Authorization )
      .set( stringTosing, headers[user][stringTosing] );

  return get;

};
