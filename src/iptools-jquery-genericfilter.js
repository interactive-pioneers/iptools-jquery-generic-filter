/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {
    noDependencyFilterTrigger: false,
    filterSelector: '.genericfilter__filter'
  };

  var triggerSelector = 'input, select, textarea';
  //var filterSelector = '.genericfilter__filter';
  var filterDataDependencies = 'genericfilter-dependencies';

  function IPTGenericFilter(form, options) {
    this.settings = $.extend({}, defaults, options);
    this.$form = $(form);
    this._$lastTrigger = null;

    checkIntegrity(this);

    addEventListeners(this);
  }

  IPTGenericFilter.prototype.clearDependencyChain = function($trigger, empty) {
    var $dependencies = getFilterDependencies($trigger);
    var recursion = isRecursion($trigger, this._$lastTrigger);

    // bail if there are no dependencies or recursion is detected
    if ($dependencies.length === 0 || recursion) {
      this._$lastTrigger = null;
      return;
    }

    this.clearFilter($dependencies, empty);

    // traverse dependency chain
    this._$lastTrigger = $trigger;
    this.clearDependencyChain($dependencies, true);
  };

  IPTGenericFilter.prototype.clearFilter = function($filters, empty) {
    $filters.find(triggerSelector).val(null);
    if (empty) {
      $filters.empty();
    }
  };

  IPTGenericFilter.prototype.updateResult = function() {
    this.$form.submit();
  };

  IPTGenericFilter.prototype.destroy = function() {
    this.$form.off(pluginName);
    this.$form.removeData('plugin_' + pluginName);
  };

  function getFilterDependencies($filter) {
    var list = $filter.data(filterDataDependencies);
    var selector = list.replace(/([A-Za-z]+[\w\-\:\.]*)/g, '#$&');

    return $(selector);
  }

  function normalizeFilterValue(instance, $input) {
    var value = $.trim($input.val());
    var isCheckboxgroup = isFilterCheckboxGroup(instance, $input);
    var $checkboxGroupMembers = getCheckboxGroupMembers(instance, $input, false);
    var _checkboxGroupHasValue = checkboxGroupHasValue($checkboxGroupMembers);

    if ('0' === value || '' === value || (isCheckboxgroup && !_checkboxGroupHasValue)) {
      return null;
    }

    return value;
  }

  function isRecursion($trigger, $lastTrigger) {
    var recursion = false;
    var $dependencies = getFilterDependencies($trigger);

    if (null === $lastTrigger) {
      return recursion;
    }

    $dependencies.each(function() {
      if ($lastTrigger.attr('id') === $(this).attr('id')) {
        recursion = true;
      }
    });

    return recursion;
  }

  function handleUnobtrusiveAjaxBefore(event) {
    var instance = event.data;
    var $input = $(event.target);
    var $filter = $input.closest(instance.settings.filterSelector);
    var $dependencies = getFilterDependencies($filter);
    var filterValue = normalizeFilterValue(instance, $input);

    // clear dependency chain
    instance.clearDependencyChain($filter, null === filterValue);

    // If filter is part of a checkbox group, append values from all group members to ajax call.
    if (isFilterCheckboxGroup(instance, $input)) {
      appendCheckboxGroupValuesToAjaxParameter(instance, $input);
    }

    // update result
    instance.updateResult();

    // Skip ajax call if filter value is null or has no dependencies
    if (null === filterValue || (0 === $dependencies.length && !instance.settings.noDependencyFilterTrigger)) {
      return false;
    }
  }

  function isFilterCheckboxGroup(instance, $input) {
    var $checkboxes = getCheckboxGroupMembers(instance, $input, true);

    return $checkboxes.length > 0;
  }

  function getCheckboxGroupMembers(instance, $input, skipGiven) {
    var $filter = $input.closest(instance.settings.filterSelector);
    var $collection = $filter.find('input[type="checkbox"]').not(skipGiven ? $input : '');

    return $collection;
  }

  function appendCheckboxGroupValuesToAjaxParameter(instance, $input) {
    var $checkboxes = getCheckboxGroupMembers(instance, $input, true);
    var params = $input.data('params');

    $checkboxes.each(function() {
      if ($(this).is(':checked')) {
        params += '&' + encodeURIComponent($(this).attr('name')) + '=on';
      }
    });

    $input.data('params', params);
  }

  function checkboxGroupHasValue($members) {
    var hasValue = false;

    $members.each(function() {
      if ($(this).is(':checked')) {
        hasValue = true;
      }
    });

    return hasValue;
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  function addEventListeners(instance) {
    instance.$form.on(getNamespacedEvent('ajax:before'), triggerSelector, instance, handleUnobtrusiveAjaxBefore);
  }

  function checkIntegrity(instance) {
    // check for required filter attribute "data-genericfilter-dependencies"
    // @IMPROVEMENT: Add empty attribute instead of trowing an error.
    instance.$form.find(instance.settings.filterSelector).each(function() {
      if (typeof $(this).data(filterDataDependencies) === 'undefined') {
        throw new Error('Required data attribute genericfilter-dependencies missing for ' + $(this).attr('id'));
      }
    });
  }

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new IPTGenericFilter(this, options));
      }
    });
  };

})(jQuery);
