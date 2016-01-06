var Event = module.exports = {};
require('../index').extend(Event);

Event.path = 'event';

function fire(name, payload, options, callback) {
  options = options || {};
  options.body = JSON.stringify(payload); // JSON encode the value

  this.request('PUT', 'fire/' + name, options, callback);
}
Event.fire = fire;

function list(options, callback) {
  this.request('GET', 'list', {
    query: options
  }, callback);
}
list.watchable = true;
Event.list = list;
