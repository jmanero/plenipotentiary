var Errors = require('./errors');
var HTTP = require('http');
var Path = require('path');
var QS = require('qs');

var Consul = module.exports = {};
Consul.host = 'localhost';
Consul.port = 8500;

var Watcher = Consul.Watcher = require('./watcher');

Consul.request = function(method, resource, params, callback) {
  var query = params.query || {};
  var body = params.body || {};

  if (this.dc) query.dc = this.dc;

  // Encode request body into a utf8 buffer of JSON
  body = JSON.stringify(body);
  body = Buffer(body, 'utf8');

  var options = {
    hostname: this.host,
    port: this.port,
    method: method.toUpperCase(),
    path: Path.join('/v1', this.path, resource),
  };

  // GET requests don't have body content
  if (options.method != 'GET')
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    };

  // Query Parameters
  if (Object.keys(query).length)
    options.path += '?' + QS.stringify(query);

  req = HTTP.request(options);
  req.on('response', function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });

    res.on('end', function(chunk) {
      if (chunk) chunks.push(chunk);

      // Concatinate response chunks and get a string
      var raw_data = Buffer.concat(chunks).toString('utf8');

      if (res.statusCode >= 400)
        return callback({
          ok: false,
          error: new Errors.RequestError(res.statusCode, raw_data)
        });

      // Parse JSON response payload
      try {
        data = JSON.parse(raw_data);
      } catch (err) {
        return callback({
          ok: false,
          error: Errors.PayloadError(raw_data, err.message)
        });
      }

      var state = {};
      if (res.headers['x-consul-index'])
        state.index = +(res.headers['x-consul-index']);

      callback({
        ok: true,
        data: data
      }, state);
    });
  });

  req.on('error', function(err) {
    callback({
      ok: false,
      error: err
    });
  });

  // Don't send body content for GET requests
  if (options.method != 'GET') req.write(body);
  req.end();

  return req;
};

Consul.watch = function(method, options) {
  if (!method.watchable) throw TypeError('Mathod ' + method.name + ' is not watchable!');
  return new Watcher(this, method, options);
};

Consul.createSession = function(callback) {
  Session.create()
};

Consul.dc = function(name) {
  return this.extend({
    dc: name
  });
};

Consul.extend = function(child) {
  child.super = this;
  Object.setPrototypeOf(child, this);

  return child;
};

/**
 * Helpers
 */
Consul.toConsulTTL = function(v) {
  if (isNaN(+v)) throw TypeError('Input must be a number!');

  return v + 's';
};

Consul.fromConsulTTL = function(v) {
  if (+v) return v / 1000000000; // Nanoseconds
  return parseInt(v.slice(0, -1), 10);
};


/**
 * API Services
 */
Consul.Catalog = require('./service/catalog');
Consul.Event = require('./service/event');
Consul.Health = require('./service/health');
Consul.KV = require('./service/kv');
Consul.Session = require('./service/session');
