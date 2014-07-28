
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

var plugins = [
  restify.acceptParser( server.acceptable ),
  restify.throttle( throttleOptions ),
  restify.dateParser(),
  restify.queryParser(),
  restify.fullResponse(),
];

if ( nconf.get('Security:UseAuth') ) {
  plugins.push( require( path.join(__dirname, 'plugins', 'customAuthorizationParser') )() );
}

if ( nconf.get('Security:UseACL') ) {
  plugins.push( require( path.join(__dirname, 'plugins', 'customACLPlugin') )() );
}

plugins.push( restify.bodyParser() );
plugins.push( restify.gzipResponse() );

server.use( plugins );

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

var registerRoute = function( route ) {

  var routeMethod = route.meta.method.toLowerCase();
  var routeName = route.meta.name;
  var routeVersion = route.meta.version;

  route
    .meta
    .paths
    .forEach(function( aPath ) {
      var routeMeta = {
        name: routeName,
        path: aPath,
        version: routeVersion
      };
      server[routeMethod]( routeMeta, route.middleware );
    });

};

var setupMiddleware = function ( middlewareName ) {
  var routes = require( path.join(__dirname, 'middleware', middlewareName) );
  routes.forEach( registerRoute );
};

[
  'root',
  'secret'
  // ... more middleware ... //
]
.forEach( setupMiddleware );

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
