
/**
 * Route   : /
 * Version : 1.0.0
 */

var v1 = {

  get : function( req, res, next ) {
    return res.send({
      foo : 'bar'
    });
  }

};

/**
 * Setup
 */

exports.setup = function ( server ) {

  server.get(
    { path : '/', version : '1.0.0' },
    v1.get
  );

};
