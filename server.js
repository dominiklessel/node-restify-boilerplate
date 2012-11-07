
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
var ServerLog = bunyan.createLogger({
  name    : 'ServerLog',
  streams : [{
    path  : path.join( __dirname, 'logs', 'server.log' )
  }]
});

var AccessLog = bunyan.createLogger({
  name    : 'AccessLog',
  streams : [{
    path  : path.join( __dirname, 'logs', 'access.log' )
  }]
});

// global logger
log = bunyan.createLogger({
  name    : 'CustomLog',
  streams : [{
    path  : path.join( __dirname, 'logs', 'custom.log' )
  }]
});

/**
 * Server
 */

var server = restify.createServer({
  name       : nconf.get('Server:Name'),
  version    : nconf.get('Server:DefaultVersion'),
  acceptable : nconf.get('Server:Acceptable'),
  log        : ServerLog
});

/**
 * Server plugins
 */

server.use(
  restify.acceptParser( server.acceptable )
);

server.use(
  require( path.join(__dirname, 'plugins', 'customAuthorizationParser') )( restify.InvalidHeaderError, restify.NotAuthorizedError )
);

server.use(
  restify.dateParser()
);

server.use(
  restify.queryParser()
);

server.use(
  restify.bodyParser()
);

server.use(
  restify.throttle({
    burst : 100,
    rate  : 50,
    ip    : true
  })
);

server.on('after', restify.auditLogger({
  log : AccessLog
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
