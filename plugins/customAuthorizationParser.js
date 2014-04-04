
'use strict';

/**
 * Module dependencies.
 */

var crypto = require('crypto');

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
 * `req.username` will also be set, and defaults to 'anonymous'.
 *
 * @return {Function} restify handler.
 * @throws {TypeError} on bad input
 */

module.exports = function( InvalidHeaderError, NotAuthorizedError ) {

  var parseAuthorization = function( req, res, next ) {

    var credentialList = nconf.get('Security:Credentials'),
        authorizationPieces,
        secret,
        checkSignatureString,
        checkSignatureBase64;

    req.authorization = {};
    req.username      = 'anonymous';

    if ( !req.headers.authorization ) {
      return next( new InvalidHeaderError('Authorization header required.') );
    }

    authorizationPieces = req.headers.authorization.split(' ', 2);

    if ( !authorizationPieces || authorizationPieces.length !== 2 ) {
      return next( new InvalidHeaderError('Authorization header is invalid.') );
    }

    req.authorization.scheme      = authorizationPieces[0];
    req.authorization.credentials = authorizationPieces[1];

    if ( req.authorization.scheme !== nconf.get('Security:Scheme') ) {
      return next( new InvalidHeaderError('Authorization scheme is invalid.') );
    }

    if ( !req.headers[ nconf.get('Security:DateIdentifier').toLowerCase() ] ) {
      return next( new InvalidHeaderError('Authorization header is invalid: "' + nconf.get('Security:DateIdentifier') + '" missing') );
    }

    req.authorization[ req.authorization.scheme ] = {
      key       : req.authorization.credentials.split(':', 2)[0],
      signature : req.authorization.credentials.split(':', 2)[1],
      date      : req.headers[ nconf.get('Security:DateIdentifier').toLowerCase() ]
    };

    // check if key is known & grab infos
    if ( !credentialList[ req.authorization[req.authorization.scheme].key ] ) {
      return next( new NotAuthorizedError('Authorization key unknown.') );
    }
    secret                    = credentialList[ req.authorization[req.authorization.scheme].key ].secret;
    req.username              = credentialList[ req.authorization[req.authorization.scheme].key ].username;
    req.authorization.isAdmin = credentialList[ req.authorization[req.authorization.scheme].key ].admin;

    // calc check signature
    checkSignatureString = crypto.createHmac('sha1', secret )
                                 .update( req.authorization[ req.authorization.scheme ].date )
                                 .digest('hex');
    checkSignatureBase64 = new Buffer( checkSignatureString ).toString( 'base64' );

    // check signature
    if ( checkSignatureBase64 !== req.authorization[ req.authorization.scheme ].signature ) {
      return next( new NotAuthorizedError('Authorization signature is invalid.') );
    }

    return next();

  };

  return parseAuthorization;

};
