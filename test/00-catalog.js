var Catalog = require('../lib').Catalog;
var expect = require('chai').expect;

describe('Consul Catalog', function() {
  it('should fetch all datacenters', function(done) {
    Catalog.datacenters(function(res) {
      expect(res.ok).to.be.true;
      expect(res.data).to.include.members(['plenipotentiary-test']);

      done();
    });
  });

  it('should fetch all nodes', function(done) {
    Catalog.nodes({}, function(res) {
      expect(res.ok).to.be.true;
      console.log(res.data)
      // expect(res.data).to.include.members(['plenipotentiary-test']);

      done();
    });
  });
});
