/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {};

  var triggerSelector = 'input, select, textarea';
  var filterSelector = '.genericfilter__filter';
  var filterDataDependencies = 'genericfilter-dependencies';

  function IPTGenericFilter(form, options) {
    // @TODO check filter for data attributes
    this.settings = $.extend({}, defaults, options);
    this.$form = $(form);
    this._$lastTrigger = null;

    addEventListeners(this);
  }

  IPTGenericFilter.prototype.getFilterDependencies = function(filter) {
    var dependencyList = filter.data(filterDataDependencies).toString();
    var selector = convertDependencyListToSelector(dependencyList);
    var $dependencies = $(selector);

    return $dependencies.length > 0 ? $dependencies : null;
  };

  IPTGenericFilter.prototype.updateFilterDependencies = function($trigger, data) {
    var $dependencies = this.getFilterDependencies($trigger);
    var recursion = isLastTriggerADependency(this._$lastTrigger, $trigger);

    // bail if there are no dependencies or recursion is detected
    if (null === $dependencies || recursion) {
      this.updateResult();
      this._$lastTrigger = null;
      return;
    }

    // update markup
    if (null !== data && null !== data.filters) {
      updateDOM(data.filters);
    } else {
      this.clearFilter($dependencies);
    }

    // traverse dependency chain
    this._$lastTrigger = $trigger;
    this.updateFilterDependencies($dependencies, null);
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

  function updateDOM(filters) {
    $.each(filters, function(key, filter) {
      $('#' + filter.selector).html(filter.template);
    });
  }

  function isLastTriggerADependency($lastTrigger, $trigger) {
    if (null === $lastTrigger) {
      return false;
    }

    var is = false;
    var triggerId = $lastTrigger.attr('id');
    var dependenciesSelector = $trigger.data(filterDataDependencies);
    var dependencies = dependenciesSelector.split(',');

    $.each(dependencies, function(index, value) {
      if (triggerId === $.trim(value)) {
        is = true;
      }
    });

    return is;
  }

  function convertDependencyListToSelector(list) {
    var selector = '';
    var items = list.split(',');
    var count = items.length;

    for (var i = 0; i < count; i++) {
      selector += '#' + $.trim(items[i]) + (i < (count - 1) ? ',' : '');
    }

    return selector;
  }

  function isFilterCheckboxGroup($input) {
    var $filter = $input.closest(filterSelector);
    var $checkboxes = $filter.find('input[type="checkbox"]');

    return $checkboxes.length >= 2;
  }

  function appendParamsCheckboxGroupValues($input) {
    var $filter = $input.closest(filterSelector);
    var $checkboxes = $filter.find('input[type="checkbox"]');
    var params = $input.data('params');

    $checkboxes.each(function() {
      if ($(this).is(':checked') && $(this).attr('name') !== $input.attr('name')) {
        params += '&' + encodeURIComponent($(this).attr('name')) + '=on';
      }
    });

    $input.data('params', params);
  }

  function handleUnobtrusiveAjaxBefore(event) {
    var instance = event.data;
    var $input = $(event.target);
    var $filter = $input.closest(filterSelector);
    var dependencies = $.trim($filter.data(filterDataDependencies));

    // if trigger has no dependencies, skip call.
    if ('' === dependencies) {
      instance.updateResult();
      return false;
    }

    // handle checkbox groups
    if (isFilterCheckboxGroup($input)) {
      appendParamsCheckboxGroupValues($input);
    }
  }

  function handleUnobtrusiveAjaxComplete(event, xhr) {
    var instance = event.data;
    var $trigger = $(event.target).closest(filterSelector);
    var response = $.parseJSON(xhr.responseText);

    instance.updateFilterDependencies($trigger, response);
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  function addEventListeners(instance) {
    instance.$form.on(getNamespacedEvent('ajax:before'), triggerSelector, instance, handleUnobtrusiveAjaxBefore);
    instance.$form.on(getNamespacedEvent('ajax:complete'), triggerSelector, instance, handleUnobtrusiveAjaxComplete);
  }

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new IPTGenericFilter(this, options));
      }
    });
  };

})(jQuery);
