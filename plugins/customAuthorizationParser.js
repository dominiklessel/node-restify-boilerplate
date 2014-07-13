
'use strict';

/**
 * Module dependencies.
 */

var crypto = require('crypto');
var path = require('path');

var _ = require('lodash');
var nconf = require('nconf').file({
  file: path.join( __dirname, '..', 'config', 'global.json' )
});
var restify = require('restify');

/**
 * Returns auth header pieces
 */

var parseAuthHeader = function( authorizationHeader ) {

  authorizationHeader = authorizationHeader.split( ' ', 2 );

  if ( authorizationHeader.length !== 2 ) {
    return null;
  }

  return {
    raw: authorizationHeader.join( ' ' ),
    scheme: authorizationHeader[0],
    key: authorizationHeader[1].split( ':' )[0],
    signature: authorizationHeader[1].split( ':' )[1],
  };

};

/**
 * Returns a request signature
 */

var getSignature = function( key, secret, stringToSign ) {

  var signatureString = new Buffer( crypto.createHmac( 'sha1', secret ).update( stringToSign ).digest('hex') ).toString( 'base64' );

  return signatureString;

};

/**
 * Returns a plugin that will parse the client's Authorization header.
 *
 * Subsequent handlers will see `req.authorization`, which looks like:
 *
 * {
 *   scheme: <Basic|Signature|...>,
 *   credentials: <Undecoded value of header>,
 *   basic: {
 *     username: $user
 *     password: $password
 *   }
 * }
 *
 * `req.user` will also be set, and defaults to `{ name: 'anonymous' }`.
 *
 * @return {Function} restify handler.
 * @throws {TypeError} on bad input
 */

module.exports = function() {

  var parseAuthorization = function( req, res, next ) {

    var credentialList = nconf.get('Security:Users');
    var allowAnon = nconf.get('Security:AllowAnonymous');
    var authorizationHeader;
    var user;

    // Skip if anonymous are allowed ...
    if ( allowAnon && !req.headers.authorization ) {
      req.user = {
        name: 'anonymous'
      };
      return next();
    }

    // Validate Headers
    if ( !req.headers.authorization ) {
      return next( new restify.InvalidHeaderError('Authorization header required.') );
    }

    if ( !req.headers[ nconf.get('Security:StringToSign').toLowerCase() ] ) {
      return next( new restify.InvalidHeaderError('Authorization wont work: "' + nconf.get('Security:StringToSign') + '" missing') );
    }

    // Parse auth header
    authorizationHeader = parseAuthHeader( req.headers.authorization );

    if ( authorizationHeader === null ) {
      return next( new restify.InvalidHeaderError('Authorization header is invalid.') );
    }

    // Fill authorization object
    req.authorization = {
      scheme: authorizationHeader.scheme,
      credentials: authorizationHeader.raw
    };

    // Validate authorization object
    if ( req.authorization.scheme.toLowerCase() !== nconf.get('Security:Scheme').toLowerCase() ) {
      return next( new restify.InvalidHeaderError('Authorization scheme is invalid.') );
    }

    req.authorization[ req.authorization.scheme ] = {
      key       : authorizationHeader.key,
      signature : authorizationHeader.signature,
      date      : req.headers[ nconf.get('Security:StringToSign').toLowerCase() ]
    };

    // grab credentials
    user = _.where( credentialList, {
      key: req.authorization[req.authorization.scheme].key
    }).pop();

    // check user
    if ( !user ) {
      return next( new restify.NotAuthorizedError('Authorization key unknown.') );
    }

    // Set user information
    req.user = user;

    // Get check signature
    var checkSignature = getSignature(
      req.authorization[ req.authorization.scheme ].key,
      user.secret,
      req.authorization[ req.authorization.scheme ].date
    );

    // check signature
    if ( checkSignature !== req.authorization[ req.authorization.scheme ].signature ) {
      return next( new restify.NotAuthorizedError('Authorization signature is invalid.') );
    }

    return next();

  };

  return parseAuthorization;

};
