
/**
 * Version: 1.0.0
 */

var v1 = {
  version: '1.0.0',
  path: '/'
};

/**
 * Route: /
 * Version: 1.0.0
 */

v1.get = function( req, res, next ) {
  res.send({
    foo: 'bar'
  });
  return next();
};


/**
 * Setup
 */

exports.setup = function ( server ) {

  server.get(
    {
      path: v1.path,
      version: v1.version
    },
    v1.get
  );

};
