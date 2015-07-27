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

      it('expected #level_0 to update it´s dependency #level_1 and clear clear it´s subdependency #level_2', function() {
        var responseData = [{
          'selector': 'level_1',
          'template': '<div class="select select--full">  <select data-method="get" data-params="trigger=level_1" data-remote="true" data-type="json" data-url="/ajax/genericfilter/demo_linear_selects/filter/" id="level_1__input" name="level_1__input">    <option value="0">please choose</option>    <option value="1">value 1</option>    <option value="2">value 2</option>    <option value="3">value 3</option>    <option value="4">value 4</option>    <option value="5">value 5</option>  </select></div>'
        }];
        var $filter = $('#level_0');
        var $dependency = $('#level_1');
        var $subDependency = $('#level_2');
        $subDependency.html('<p>test</p>');
        $object.data(pluginName).updateFilterDependencies($filter, responseData);
        return expect($dependency.html()).to.be.not.eq('') && expect($subDependency.html()).to.eq('');
      });

      it('expected #level_0 to clear it`s dependency #level_1 and it`s subdependency #level_2', function() {
        var responseData = null;
        var $filter = $('#level_0');
        var $dependency = $('#level_1');
        var $subDependency = $('#level_2');
        $dependency.html('<p>test</p>');
        $subDependency.html('<p>test</p>');
        $object.data(pluginName).updateFilterDependencies($filter, responseData);
        return expect($dependency.html()).to.eq('') && expect($subDependency.html()).to.eq('');
      });

      it('expected to empty filter container', function() {
        var $filter = $object.find('.genericfilter__filter').eq(0);
        $object.data(pluginName).clearFilter($filter);
        return expect($filter.html()).to.eql('');
      });

      it('expected to reset filter inputs values', function() {
        var $filter = $object.find('.genericfilter__filter').eq(0);
        $object.data(pluginName).clearFilter($filter);
        return expect($filter.find('input, select, textarea').val()).to.be.not.ok;
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
