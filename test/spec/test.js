/* jshint undef: false */
(function() {
  'use strict';

  describe('IPTGenericFilter', function() {

    var config = {
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
        $object = $(selector).iptGenericFilter({child: 'level-1'});
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

    describe('destroy', function() {

      beforeEach(function() {
        $object = $(selector).iptGenericFilter(config);
      });

      it('expected to remove data', function() {
        $object.data(pluginName).destroy();
        return expect($object.data(pluginName)).to.not.be.ok;
      });

    });
  });

})();
