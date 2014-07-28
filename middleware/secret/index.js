
'use strict';

/**
 * Routes
 */

var routes = [];

/**
 * GET /secret
 * Version: 1.0.0
 */

routes.push({
  meta: {
    name: 'getSecret',
    method: 'GET',
    paths: [
      '/secret'
    ],
    version: '1.0.0',
  },
  middleware: function( req, res, next ) {
    res.send({
      secret: 'foo, bar, baz and qux'
    });
    return next();
  }
});

/**
 * GET /secret/:id
 * Version: 1.0.0
 */

routes.push({
  meta: {
    name: 'getSecretWidthId',
    method: 'GET',
    paths: [
      '/secret/:id'
    ],
    version: '1.0.0',
  },
  middleware: function( req, res, next ) {
    res.send({
      secret: 'foo, bar, baz and qux: ' + req.params.id
    });
    return next();
  }
});

/**
 * Export
 */

module.exports = routes;
