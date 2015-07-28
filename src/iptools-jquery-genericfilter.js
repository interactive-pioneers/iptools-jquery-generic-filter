/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {
    noDependencyFilterTrigger: false
  };

  var triggerSelector = 'input, select, textarea';
  var filterSelector = '.genericfilter__filter';
  var filterDataDependencies = 'genericfilter-dependencies';

  function IPTGenericFilter(form, options) {
    this.settings = $.extend({}, defaults, options);
    this.$form = $(form);
    this._$lastTrigger = null;

    checkIntegrity(this.$form);

    addEventListeners(this);
  }

  // @TODO should be renamed because all this thing do is check nodep and check recursion
  IPTGenericFilter.prototype.updateFilterDependencies = function($trigger) {
    var $dependencies = getFilterDependencies($trigger);
    var recursion = isRecursion($trigger, this._$lastTrigger);

    // bail if there are no dependencies or recursion is detected
    if ($dependencies.length === 0 || recursion) {
      this.updateResult();
      this._$lastTrigger = null;
      return;
    }
    this.clearFilter($dependencies);

    // traverse dependency chain
    this._$lastTrigger = $trigger;
    this.updateFilterDependencies($dependencies);
  };

  IPTGenericFilter.prototype.clearFilter = function($filters) {
    $filters.find(triggerSelector).val(null);
    $filters.empty();
  };

  IPTGenericFilter.prototype.updateResult = function() {
    this.$form.submit();
  };

  IPTGenericFilter.prototype.destroy = function() {
    this.$form.off(pluginName);
    this.$form.removeData('plugin_' + pluginName);
  };

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

  function getFilterDependencies($filter) {
    var list = $filter.data(filterDataDependencies);
    var selector = list.replace(/([A-Za-z]+[\w\-\:\.]*)/g, '#$&');

    return $(selector);
  }

  function isFilterCheckboxGroup($input) {
    var $checkboxes = getCheckboxGroupMembers($input, true);

    return $checkboxes.length > 0;
  }

  function getCheckboxGroupMembers($input, skipGiven) {
    var $filter = $input.closest(filterSelector);
    var $collection = $filter.find('input[type="checkbox"]').not(skipGiven ? $input : '');

    return $collection;
  }

  function appendCheckboxGroupValuesToAjaxParameter($input) {
    var $checkboxes = getCheckboxGroupMembers($input, true);
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

  function handleUnobtrusiveAjaxBefore(event) {
    var instance = event.data;
    var $input = $(event.target);
    var $filter = $input.closest(filterSelector);
    var $dependencies = getFilterDependencies($filter);
    var filterValue = normalizeFilterValue($input);

    // If filter has a null value clear dependencies and skip ajax call.
    if (null === filterValue) {
      instance.updateFilterDependencies($filter);
      return false;
    }

    // update result
    instance.updateResult();

    // If filter has no dependencies and call is not forced by settings, skip ajax call.
    if (0 === $dependencies.length && !instance.settings.noDependencyFilterTrigger) {
      return false;
    }

    // If filter is part of a checkbox group, append values from all group members to ajax call.
    if (isFilterCheckboxGroup($input)) {
      appendCheckboxGroupValuesToAjaxParameter($input);
    }
  }

  function normalizeFilterValue($input) {
    var value = $.trim($input.val());
    var isCheckboxgroup = isFilterCheckboxGroup($input);
    var $checkboxGroupMembers = getCheckboxGroupMembers($input, false);
    var _checkboxGroupHasValue = checkboxGroupHasValue($checkboxGroupMembers);

    if ('0' === value || '' === value || (isCheckboxgroup && !_checkboxGroupHasValue)) {
      return null;
    }

    return value;
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  function addEventListeners(instance) {
    instance.$form.on(getNamespacedEvent('ajax:before'), triggerSelector, instance, handleUnobtrusiveAjaxBefore);
  }

  function checkIntegrity($form) {
    // check for required filter attribute "data-genericfilter-dependencies"
    // @IMPROVEMENT: Add empty attribute instead of trowing an error.
    $form.find(filterSelector).each(function() {
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
