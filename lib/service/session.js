var Consul = require('../index');
var EventEmitter = require('events').EventEmitter;

var KV = require('./kv');

var Session = module.exports = function(id, options) {
  EventEmitter.call(this);
  options = options || {};
  var _this = this;

  this.id = id;
  this.ok = true;

  this.index = options.CreateIndex;
  this.ttl = Consul.fromConsulTTL(options.TTL);

  // By default, enable the autorenew loop
  this.autorenew = options.hasOwnProperty('autorenew') ?
    !!options.autorenew : true;

  if (this.autorenew) autorenew(_this);
};

Object.setPrototypeOf(Session.prototype, EventEmitter.prototype);
Consul.extend(Session);

Session.defaultTTL = '15s';
Session.path = 'session';

function autorenew(_this) {
  // Schedule a renew call for TTL / 2
  _this._autorenew = setTimeout(function() {
    _this.renew(function(res) {
      // Schecule the next autorenew
      if (res.ok && _this.autorenew) autorenew(_this);
    });
  }, _this.TTL * 500);
}

Session.prototype.destroy = function(callback) {
  var _this = this;
  clearTimeout(this._autorenew);

  destroy(this.id, null, function(res) {
    if (res.ok) {
      _this.ok = false;
      _this.emit('destroy');
    }

    callback(res);
  });
};

Session.prototype.renew = function(callback) {
  var _this = this;

  renew(this.id, null, function(res, state) {
    if (!res.ok) {
      _this.ok = false;
      _this.emit('expire');

    } else {
      _this.index = state.index;

      // TTL can be used to rate-limit session renewals
      _this.ttl = Consul.fromConsulTTL(res.data.TTL);
    }

    if (callback instanceof Function) callback(res);
  });
};

/**
 * Lock Interface
 */
Session.prototype.lock = function(key, options, callback) {
  return KV.lock(key, {
    query: {
      acquire: this.id
    }
  }, callback);
};

/**
 * API Methods
 */
function create(options, callback) {
  options = options || {};
  options.TTL = options.TTL || this.defaultTTL;

  this.request('PUT', 'create', {
    body: options
  }, function(res) {
    if (!res.ok) return callback(res);

    callback(new Session(data.id, options));
  });
}
Session.create = create;

function destroy(id, options, callback) {
  this.request('PUT', 'destroy/' + id, {
    query: options
  }, callback);
}
Session.destroy = destroy;

function renew(id, options, callback) {
  this.request('PUT', 'renew/' + id, {
    query: options
  }, callback);
}
Session.renew = renew;

function info(id, options, callback) {
  this.request('GET', 'info/' + id, {
    query: options
  }, callback);
}
info.watchable = true;
Session.info = info;

function node(id, options, callback) {
  this.request('GET', 'node/' + id, {
    query: options
  }, callback);
}
node.watchable = true;
Session.node = node;

function list(id, options, callback) {
  this.request('GET', 'list', {
    query: options
  }, callback);
}
list.watchable = true;
Session.list = list;
