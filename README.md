# restify API boilerplate

[![Dependency Status](https://gemnasium.com/dominiklessel/restify-api-boilerplate.png)](https://gemnasium.com/dominiklessel/restify-api-boilerplate)

Get your [restify](https://github.com/mcavage/node-restify) API up and running in no time :) Most of the things the boilerplate does should be self-explaining. If not: [AMA](mailto:dominik@mifitto.com?subject=Question:%20restify%20API%20boilerplate)

I included a custom authorization plugin, which is enabled by default. Feel free to modify its settings inside `config/global.json`

## Index

- [Authorization](#authorization)

## Authorization

Every request you make must be authenticated. The REST API uses a custom HTTP scheme based on a keyed-HMAC (Hash Message Authentication Code) for authentication.

The value of the Authorization header is as follows:

```
Authorization: <Config/Security/Scheme> <AccessKey>:<Signature(Base64(HMAC-SHA1(UTF-8(<String to Sign>), UTF-8(<SecretAccessKey>))))>
```

AccessKey: Provided by `config/global.json`  
SecretAccessKey: Provided by `config/global.json`  
String to Sign: Value of the `<Config/Security/DateIdentifier>` header

## Enviroments

`NODE_ENV` is not yet used to allow different configurations for developemnt / production. The only thing it does is disabling the Auth- and CORS-Plugin in development.

```
$ NODE_ENV=production node server
```

vs.

```
$node server
```
