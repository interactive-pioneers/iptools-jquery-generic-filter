/* jshint undef: false */
(function() {
  'use strict';

  describe('IPTGenericFilter', function() {
    var config = {};
    var pluginName = 'plugin_iptGenericFilter';
    var $object = null;

    describe('init', function() {

      beforeEach(function() {
        $object = $('#level-0').iptGenericFilter(config);
      });

      it('expected to construct object', function() {
        return expect($object).to.be.an.object;
      });

    });

    describe('destroy', function() {

      beforeEach(function() {
        $object = $('#level-0').iptGenericFilter(config);
      });

      it('expected to remove data', function() {
        $object.data(pluginName).destroy();
        return expect($object.data(pluginName)).to.not.be.ok;
      });

    });
  });

})();
