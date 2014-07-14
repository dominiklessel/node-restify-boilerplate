
'use strict';

/**
 * Module dependencies
 */

var path = require('path');

var nconf = require('nconf').file({
  file: path.join( __dirname, '..', 'config', 'global.json' )
});
var restify = require('restify');
var ACL = require('acl');

/**
 * ACL
 */

var acl;
var getACLInstance;

getACLInstance = function( aclBackend ) {

  if ( acl ) {
    return acl;
  }

  aclBackend = aclBackend || { type: 'memory' };

  aclBackend = aclBackend.type === 'memory' ? new ACL.memoryBackend()
    : aclBackend.type === 'redis' ? aclBackend = new ACL.redisBackend( aclBackend.options.client, aclBackend.options.prefix )
    : aclBackend.type === 'mongodb' ? aclBackend = new ACL.mongodbBackend( aclBackend.options.client, aclBackend.options.prefix )
    : new ACL.memoryBackend();

  acl = new ACL( aclBackend );

  var rules = nconf.get('Security:ACL:Rules');
  var users = nconf.get('Security:Users');

  acl.allow( rules );

  users.forEach(function( user ) {
    acl.addUserRoles( user.name, user.role );
  });

  return acl;

};

/**
 * Export
 */

module.exports = function( aclBackend ) {

  var ACLMiddleware = function( req, res, next ) {

    req.acl = getACLInstance( aclBackend );

    console.log({ acl: {
      user: req.user.name,
      path: req.path(),
      route: req.route,
      method: req.method
    }});

    req.acl.isAllowed( req.user.name, req.path(), req.method.toLowerCase(), function( err, isAllowed ) {
      if ( !!err ) {
        console.log( err );
        return next( new restify.InternalError() );
      }
      if ( !isAllowed ) {
        return next( new restify.ForbiddenError() );
      }
      return next();
    });

  };

  return ACLMiddleware;

};
