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

      it('expected to throw error data is missing', function() {
        function test() {
          $object = $(selector).iptGenericFilter(23);
        }
        return expect(test).to.throw();
      });

      it('expected to throw error required property is missing', function() {
        function test() {
          $object = $(selector).iptGenericFilter({_child: '23'});
        }
        return expect(test).to.throw();
      });

      it('expected to throw error invalid type', function() {
        function test() {
          $object = $('#mocha').iptGenericFilter(defaultConfig);
        }
        return expect(test).to.throw();
      });

      it('expected to throw error required child dom element is missing', function() {
        function test() {
          $object = $(selector).iptGenericFilter({child: 'level-23'});
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

      it('expected to optain null value', function() {
        return expect($object.data(pluginName).getElementValue()).to.be.not.ok;
      });

      it('expected to optain null value', function() {
        return expect($object.val('0').data(pluginName).getElementValue()).to.be.not.ok;
      });

      it('expected to optain numeric value 2', function() {
        return expect($object.val('2').data(pluginName).getElementValue()).to.eql(2);
      });

      it('expected to optain element type', function() {
        $object.data(pluginName).getElementType();
        return expect($object.data(pluginName).type).to.eql('select');
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
