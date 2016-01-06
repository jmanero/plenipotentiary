var Catalog = module.exports = {};
require('../index').extend(Catalog);

Catalog.path = 'catalog';

function datacenters(callback) {
  this.request('GET', 'datacenters', {}, callback);
}
Catalog.datacenters = datacenters;

function nodes(options, callback) {
  this.request('GET', 'nodes', {
    query: options
  }, callback);
}
nodes.watchable = true;
Catalog.nodes = nodes;

function services(options, callback) {
  this.request('GET', 'services', {
    query: options
  }, callback);
}
services.watchable = true;
Catalog.services = services;

function service(name, options, callback) {
  this.request('GET', 'service/' + name, {
    query: options
  }, callback);
}
services.watchable = true;
Catalog.service = services;

function node(name, options, callback) {
  this.request('GET', 'node/' + name, {
    query: options
  }, callback);
}
services.watchable = true;
Catalog.node = node;
