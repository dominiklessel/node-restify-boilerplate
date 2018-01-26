# restify Boilerplate

[![Dependency Status](https://gemnasium.com/dominiklessel/node-restify-boilerplate.png)](https://gemnasium.com/dominiklessel/node-restify-boilerplate)
[![Build Status](https://travis-ci.org/dominiklessel/node-restify-boilerplate.svg)](https://travis-ci.org/dominiklessel/node-restify-boilerplate)
[![Code Climate](https://codeclimate.com/github/dominiklessel/node-restify-boilerplate.png)](https://codeclimate.com/github/dominiklessel/node-restify-boilerplate)

Get your [restify](https://github.com/mcavage/node-restify) API up and running in no time :) Most of the things the boilerplate does should be self-explaining. If not: [AMA](mailto:dominik@mifitto.com?subject=Question:%20restify%20API%20boilerplate)

I included a custom authorization plugin, which is enabled by default. Feel free to modify its settings inside `config/global.json`

## Index

- [CORS](#cors)
- [Authorization](#authorization)
- [Loging](#loging)
- [Enviroments](#enviroments)

## CORS

Making CORS work properly if you use custom headers is not always straightforward ([restify / Issue #284](https://github.com/mcavage/node-restify/issues/284)). The boilerplate provides a helper, which takes care of **MethodNotAllowed responses** in conjunction with **preflight requests + custom headers**.

## Authorization (v1.1.0)

**Enable via `config.Security.UseAuth`**

Every request you make must be authenticated. The REST API uses a custom HTTP scheme based on a keyed-HMAC (Hash Message Authentication Code) for authentication.

The value of the Authorization header is as follows:

```
Authorization: <Config/Security/Scheme> <AccessKey>:<Signature(Base64(HMAC-SHA1(UTF-8(<String to Sign>), UTF-8(<SecretAccessKey>))))>
```

AccessKey: Provided by `config/global.json`
SecretAccessKey: Provided by `config/global.json`
String to Sign: Value of the `<Config/Security/StringToSign>` header

You can find an example in the [examples/client](https://github.com/dominiklessel/node-restify-boilerplate/tree/examples/client) branch.

## ACL (v1.1.0)

**Enable via `config.Security.UseACL`**

The Boilerplate now supports ACL via [node_acl](https://github.com/OptimalBits/node_acl). Take a look at `config/global.json` for configuration ...

## Logging

By default `node-bunyan` is used for logging to a file (`./logs/{{NODE_ENV}}-{{SERVER:NAME}}.log`). Additionally sending logs to Loggly is supported (take a look at the config file).

## Environments

`NODE_ENV` is not yet used to allow different configurations for development / production. The only thing it does is disabling the Auth- and CORS-Plugin in development.

```
$ NODE_ENV=production node server
```

vs.

```
$node server
```
