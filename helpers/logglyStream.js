
/**
 * Module dependencies.
 */

var request = require('request');
var endpoint = nconf.get('Logging:LogglyEndpoint');

/**
 * Logger
 */

var LogglyStream = function() {};

LogglyStream.prototype.write = function( record ) {

  if ( !endpoint || 'object' !== typeof(record) ) {
    return;
  }

  request({ method: 'POST', uri: endpoint, json: record }, function( err, response, body ) {
    if ( err ) {
      console.log( 'LogglyStream Error:' );
      console.error( err );
    }
  });

};

/**
 * Export
 */

module.exports = LogglyStream;
