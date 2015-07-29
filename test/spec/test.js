/* jshint undef: false */
// jscs:disable maximumLineLength
(function() {
  'use strict';

  describe('IPTGenericFilter', function() {

    var defaultConfig = {
      noDependencyFilterTrigger: false
    };
    var pluginName = 'plugin_iptGenericFilter';
    var selector = '#genericfilter-demo';
    var $object = null;

    describe('init', function() {

      afterEach(function() {
        if ($object.data(pluginName)) {
          $object.data(pluginName).destroy();
        }
      });

      it('expected to construct object', function() {
        $object = $(selector).iptGenericFilter(defaultConfig);
        return expect($object).to.be.an.object;
      });

      it('expected to throw error data is missing', function() {
        function test() {
          $object = $('#genericfilter-fail').iptGenericFilter(defaultConfig);
        }
        return expect(test).to.throw();
      });

    });

    describe('filter API', function() {

      beforeEach(function() {
        $object = $(selector).iptGenericFilter(defaultConfig);
      });

      afterEach(function() {
        $object.data(pluginName).destroy();
      });

      it('expected to empty filter container and reset filter svalues', function() {
        var $filter = $object.find('.genericfilter__filter').eq(0);
        $object.data(pluginName).clearFilter($filter, true);
        return expect($filter.html()).to.eql('') && expect($filter.find('input, select, textarea').val()).to.be.not.ok;
      });

      it('expected to reset filter values', function() {
        var $filter = $object.find('.genericfilter__filter').eq(0);
        $object.data(pluginName).clearFilter($filter, false);
        return expect($filter.find('input, select, textarea').val()).to.be.not.ok;
      });

      it('expected to empty and reset #level_1 and #level_2', function() {
        var $filter = $('#level_0');
        var $dependency = $('#level_1');
        var $subDependency = $('#level_2');
        $subDependency.html('<p>test</p>');
        $object.data(pluginName).clearDependencyChain($filter, true);
        return expect($dependency.html()).to.eq('') && expect($subDependency.html()).to.eq('');
      });

      // @TODO: Add tests for IPTGenericFilter.prototype.updateResult

    });

    describe('destroy', function() {

      beforeEach(function() {
        $object = $(selector).iptGenericFilter(defaultConfig);
      });

      it('expected to remove data', function() {
        $object.data(pluginName).destroy();
        return expect($object.data(pluginName)).to.not.be.ok;
      });

    });
  });

})();
