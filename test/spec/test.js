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

      beforeEach(function() {
        $object = $(selector).iptGenericFilter(config);
      });

      afterEach(function() {
        $object.data(pluginName).destroy();
      });

      it('expected to construct object', function() {
        return expect($object).to.be.an.object;
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
