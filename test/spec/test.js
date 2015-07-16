/* jshint undef: false */
(function() {
  'use strict';

  describe('IPTGenericFilter', function() {

    var defaultConfig = {
      child: 'level-1'
    };
    var pluginName = 'plugin_iptGenericFilter';
    var selector = '#level-0';
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

      it('expected to throw error if data is missing', function() {
        function test() {
          $object = $(selector).iptGenericFilter(23);
        }
        return expect(test).to.throw();
      });

      it('expected to throw error if required property is missing', function() {
        function test() {
          $object = $(selector).iptGenericFilter({_child: '23'});
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

      it('expected to enable child filter', function() {
        $object.data(pluginName).enableChildFilter();
        return expect($object.data(pluginName).$child.attr('disabled')).to.not.be.ok;
      });

      it('expected to disable child filter', function() {
        $object.data(pluginName).disableChildFilter();
        return expect($object.data(pluginName).$child.attr('disabled')).to.eql('disabled');
      });

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
