
'use strict';

/**
 * Preflight-checks
 */

if ( !process.env.NODE_ENV ) {
  process.env.NODE_ENV = 'development';
}

/**
 * Module dependencies.
 */

var path    = require('path');
var restify = require('restify');
var bunyan  = require('bunyan');

var nconf = require('nconf').file({
  file: path.join( __dirname, 'config', 'global.json' )
});

/**
 * Logging
 */

var LogglyStream = require( path.join(__dirname, 'helpers', 'logglyStream.js') );
var Logger = bunyan.createLogger({
  name: nconf.get('Logging:Name'),
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  },
  streams: [
    { path: path.join(nconf.get('Logging:Dir'),process.env.NODE_ENV+'-'+nconf.get('Server:Name')+'.log') },
    { type: 'raw', stream: new LogglyStream() }
  ]
});

/**
 * Server
 */

var server = restify.createServer({
  name       : nconf.get('Server:Name'),
  version    : nconf.get('Server:DefaultVersion'),
  acceptable : nconf.get('Server:Acceptable'),
  log        : Logger
});

/**
 * Server plugins
 */

var throttleOptions = {
  rate: nconf.get('Server:ThrottleRate'),
  burst: nconf.get('Server:ThrottleBurst'),
  ip: false,
  username: true
};

server.use([
  restify.acceptParser( server.acceptable ),
  restify.throttle( throttleOptions ),
  restify.dateParser(),
  restify.queryParser(),
  restify.fullResponse(),
  require( path.join(__dirname, 'plugins', 'customAuthorizationParser') )(),
  require( path.join(__dirname, 'plugins', 'customACLPlugin') )(),
  restify.bodyParser(),
  restify.gzipResponse()
]);

/**
 * CORS
 */

var corsOptions = {
  origins: nconf.get('CORS:Origins'),
  credentials: nconf.get('CORS:Credentials'),
  headers: nconf.get('CORS:Headers'),
};

server.pre( restify.CORS(corsOptions) );

if ( corsOptions.headers.length ) {
  server.on('MethodNotAllowed', require( path.join(__dirname, 'helpers', 'corsHelper.js') )() );
}

/**
 * Request / Response Logging
 */

server.on('after', restify.auditLogger({
  log: Logger
}));

/**
 * Middleware
 */

var setupMiddleware = function ( middlewareName ) {
  var middleware = require( path.join(__dirname, 'middleware', middlewareName) );
  return middleware.setup( server );
};

[
  'root',
  // ... more middleware ... //
]
.map( setupMiddleware );

/**
 * Listen
 */


var listen = function( done ) {
  server.listen( nconf.get('Server:Port'), function() {
    if ( done ) {
      return done();
    }
    console.log();
    console.log( '%s now listening on %s', nconf.get('App:Name'), server.url );
    console.log();
  });
};

if ( !module.parent ) {
  listen();
}

/**
 * Export
 */

module.exports.listen = listen;
