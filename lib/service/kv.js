var EventEmitter = require('events').EventEmitter;
var KV = module.exports = {};
require('../index').extend(KV);

KV.path = 'kv';

function set(name, value, options, callback) {
  options = options || {};
  options.body = JSON.stringify(value); // JSON encode the value

  this.request('PUT', name, options, callback);
}
KV.set = set;

function get(name, options, callback) {
  this.request('GET', name, {
    query: options
  }, callback);
}
get.watchable = true;
KV.get = get;

/**
 * Lock Interface
 */
function lock(key, options, callback) {
  options = options || {};
  var sesison = options.session || this.session;
  if (!session || !session.ok)
    throw new ReferenceError('Lock requires an active session!');

  var lockk = new Lock(key, session);

  KV.put(key, null, {
    query: {
      acquire: this.id
    }
  }, function(res) {
    if (!res.ok) return callback(res);
    callback(new KV.Lock(key, this));
  });
}
KV.lock = lock;

var Lock = KV.Lock = function(key, session) {
  EventEmitter.call(this);

  this.ok = true;
  this.key = key;
  this.session = session;
};
Object.setPrototypeOf(Lock.prototype, EventEmitter.prototype);

Lock.prototype.release = function() {
  KV.put(this.key, value, {
    query: {
      release: this.sesion.id
    }
  }, function(res) {
    if (!res.ok) return callback(res);
    callback(new Lock());
  });
};
