
'use strict';

/**
 * Module dependencies.
 */

var util = require('util');
var request = require('request');

/**
 * Logger
 */

var LogglyStream = function() {

  this.options = {
    enabled: nconf.get('Logging:Loggly:Enabled'),
    tags: nconf.get('Logging:Loggly:Tags').concat( [process.env.NODE_ENV] ),
    endpoint: nconf.get('Logging:Loggly:Endpoint'),
  };

  this.options.endpoint = util.format( '%stag/%s', this.options.endpoint, this.options.tags.join(',') );

};

LogglyStream.prototype.write = function( record ) {

  if ( !this.options.enabled || 'object' !== typeof(record) ) {
    return;
  }

  var requestObject = {
    method: 'POST',
    uri: this.options.endpoint,
    json: record
  };

  request(requestObject, function( err ) {
    if ( err ) {
      console.log( 'LogglyStream - Error:' );
      console.error( err );
    }
  });

};

/**
 * Export
 */

module.exports = LogglyStream;
