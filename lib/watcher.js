var EventEmitter = require('events').EventEmitter;

var Watcher = module.exports = function(scope, method) {
  EventEmitter.call(this);

  var argv = Array.apply(null, arguments).slice(2);

  this.ended = false;
  this.retries = 0;

  // Assume that a trailing object is the options hash
  var state = this.state = (argv.slice(-1)[0] instanceof Object) ? argv.pop() : {};

  state.wait = state.wait || '10s';
  state.index = 0;

  this.scope = scope;
  this.method = method;
  this.arguments = argv;

  setImmediate(run, this);
};

Object.setPrototypeOf(Watcher.prototype, EventEmitter.prototype);

function run(_this) {
  var argv = _this.arguments;

  // Options
  argv.push(_this.state);

  // Callback
  argv.push(function(data, state) {
    delete _this.request;

    if (!data.ok) return error(_this, data);

    // Check index for changes
    if (_this.state.index < state.index) {
      _this.emit('data', data.data);
      _this.state.index = state.index;
    }

    _this.retries = 0;
    if (!_this.ended) setImmediate(run, _this);
  });

  _this.request = _this.method.apply(_this.scope, argv);
}

function error(_this, data) {
  _this.emit('error', data);
  _this.retries += 1;

  // Exponential backoff, maximum 30s
  if (!_this.ended) setTimeout(run,
    Math.min(
      Math.pow(2, _this.retries) * 1000,
      30000
    ), _this);
}

Watcher.prototype.end = function() {
  if (this.ended) return;

  if (this.request) this.request.abort();
  this.ended = true;
  this.emit('end');
};
