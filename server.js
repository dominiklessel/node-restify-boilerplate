
/**
 * Module dependencies.
 */

var path    = require('path');
var restify = require('restify');
var bunyan  = require('bunyan');
nconf       = require('nconf'); // global

/**
 * Config
 */

nconf.file({
  file : path.join( __dirname, 'config', 'global.json' )
});

/**
 * Logging
 */

// logs thrown errors
var Logger = bunyan.createLogger({
  name    : nconf.get('Logging:Name'),
  streams : [{
    path  : path.join( nconf.get('Logging:Dir'), nconf.get('Logging:File') )
  }]
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

server.use(
  restify.gzipResponse()
);

server.use(
  restify.acceptParser( server.acceptable )
);

server.use(
  restify.throttle({
    burst    : 100,
    rate     : 50,
    ip       : false,
    username : true
  })
);

server.use( require( path.join(__dirname, 'plugins', 'customAuthorizationParser') )( restify.InvalidHeaderError, restify.NotAuthorizedError ) );
server.use( restify.dateParser() );
server.use( restify.queryParser() );
server.use( restify.bodyParser() );

/**
 * Request / Response Logging
 */

server.on('after', restify.auditLogger({
  log : Logger
}));

/**
 * Server routes
 */

var middlewareList = [
  'base'
].map(function ( middlewareName ) {
  var middleware;
  middleware = require( path.join(__dirname, 'middleware', middlewareName) );
  return middleware.setup( server );
});

/**
 * Listen
 */

server.listen( nconf.get('Server:Port') );
