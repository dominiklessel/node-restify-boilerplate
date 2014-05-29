
'use strict';

/**
 * Routes
 */

var routes = [];

/**
 * GET /
 * Version: 1.0.0
 */

routes.push({
  meta: {
    name: 'getRoot',
    method: 'GET',
    paths: [
      '/'
    ],
    version: '1.0.0',
  },
  middleware: function( req, res, next ) {
    res.send({
      foo: 'bar'
    });
    return next();
  }
});

/**
 * Setup
 */

exports.setup = function ( server ) {
  routes.forEach(function( route ) {
    route.meta.paths.forEach(function( aPath ) {
      route.meta.method = route.meta.method.toLowerCase();
      server[route.meta.method]({
        name: route.meta.name,
        path: aPath,
        version: route.meta.version
      }, route.middleware );
    });
  });
};
