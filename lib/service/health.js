var Health = module.exports = {};
require('../index').extend(Health);

Health.path = 'health';

function node(name, options, callback) {
  this.request('GET', 'node/' + name, {
    query: options
  }, callback);
}
node.watchable = true;
Health.node = node;

function checks(service, options, callback) {
  this.request('GET', 'checks/' + service, {
    query: options
  }, callback);
}
checks.watchable = true;
Health.checks = checks;

function service(name, options, callback) {
  this.request('GET', 'service/' + name, {
    query: options
  }, callback);
}
service.watchable = true;
Health.service = service;

function state(name, options, callback) {
  this.request('GET', 'state/' + name, {
    query: options
  }, callback);
}
state.watchable = true;
Health.state = state;
