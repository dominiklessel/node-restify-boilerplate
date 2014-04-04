
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
    method: 'GET',
    path: '/',
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
    server[route.meta.method.toLowerCase()](
      {
        path: route.meta.path,
        version: route.meta.version
      },
      route.middleware
    );
  });

};
