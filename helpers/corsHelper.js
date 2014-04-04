
'use strict';

/**
 * Module dependencies.
 */

var restify = require('restify');

/**
 * CORS helper
 */

var CORSHelper = function( options ) {

  var allowedOrigins = options.origins || [];
  var allowedHeaders = restify.CORS.ALLOW_HEADERS.concat( options.headers || [] );

  var unknownMethodHandler = function( req, res ) {

    var origin = req.headers.origin;
    var originAllowed = false;

    // Skip if it's not a preflight request
    if ( req.method.toLowerCase() !== 'options' ) {
      return res.send( new restify.MethodNotAllowedError() );
    }

    allowedOrigins.forEach(function( anOrigin ) {
      if ( origin.toLowerCase() === anOrigin.toLowerCase() ) {
        originAllowed = true;
      }
    });

    if ( !originAllowed ) {
      res.header('Access-Control-Allow-Origin', '');
      return res.send( new restify.MethodNotAllowedError() );
    }

    res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));

    return res.send( 200 );

  };

  return unknownMethodHandler;

};

/**
 * Export
 */

module.exports = CORSHelper;
