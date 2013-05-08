
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

var throttleOptions = {
  rate: nconf.get('Server:ThrottleRate'),
  burst: nconf.get('Server:ThrottleBurst'),
  ip: false,
  username: true
};

var corsOptions = {
  origins: nconf.get('CORS:Origins'),
  credentials: nconf.get('CORS:Credentials'),
  headers: nconf.get('CORS:Headers'),
};

server.use([
  restify.acceptParser( server.acceptable ),
  restify.throttle( throttleOptions ),
  restify.dateParser(),
  restify.queryParser(),
  restify.fullResponse(),
  restify.CORS( corsOptions ),
  require( path.join(__dirname, 'plugins', 'customAuthorizationParser') )( restify.InvalidHeaderError, restify.NotAuthorizedError ),
  restify.bodyParser(),
  restify.gzipResponse()
]);

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

server.listen( nconf.get('Server:Port'), function() {
  console.log('listening: %s', server.url);
});
