/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {
    basePath: ''
  };

  var triggerSelector = 'input, select, textarea';

  function IPTGenericFilter(form, options) {
    this.settings = $.extend({}, defaults, options);
    this.$form = $(form);
    this._$lastTrigger = null;

    addEventListeners(this);
  }

  IPTGenericFilter.prototype.clearFilter = function($filters) {
    $filters.find(triggerSelector).val(null);
    $filters.empty();
  };

  IPTGenericFilter.prototype.getFilterDependencies = function(filter) {
    var selector = '';
    var dependencySelectors = filter.data('genericfilter-dependencies').toString();
    var dependencies = dependencySelectors.split(',');

    $.each(dependencies, function(index, id) {
      selector += '#' + $.trim(id) + (index < dependencies.length - 1 ? ',' : '');
    });

    var $dependencies = $(selector);

    if (dependencySelectors.length === 0 || $dependencies.length === 0) {
      return null;
    }

    return $dependencies;
  };

  IPTGenericFilter.prototype.updateFilterDependencies = function($trigger, data) {
    var $dependencies = this.getFilterDependencies($trigger);

    // bail if there are no dependencies or recursion is detected
    if (null === $dependencies || isLastTriggerADependency(this._$lastTrigger, $trigger)) {
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
    var dependenciesSelector = $trigger.data('genericfilter-dependencies');
    var dependencies = dependenciesSelector.split(',');

    $.each(dependencies, function(index, value) {
      if (triggerId === $.trim(value)) {
        is = true;
      }
    });

    return is;
  }

  function isFilterCheckboxGroup($input) {
    var $filter = $input.closest(filterSelector);
    var $checkboxes = $filter.find('input[type="checkbox"]');
    return $checkboxes.length >= 2;
  }

  function appendParamsCheckboxGroupValues($input, params) {
    var $filter = $input.closest(filterSelector);
    var $checkboxes = $filter.find('input[type="checkbox"]');
    params = params || '';
    $checkboxes.each(function() {
      if ($(this).is(':checked') && $(this).attr('name') !== $input.attr('name')) {
        params += '&' + encodeURIComponent($(this).attr('name')) + '=on';
      }
    });
    return params;
  }

  function addUnobtrusiveAjaxParams(event) {
    var instance = event.data;
    var $input = $(event.target);
    var $filter = $input.closest('.genericfilter__filter');
    var dependencies = encodeURIComponent($.trim($filter.data('genericfilter-dependencies')));

    var url = instance.settings.basePath + 'filter';
    var params = 'dependencies=' + dependencies;

    // if trigger has no dependencies, skip call.
    if ('' === dependencies) {
      instance.updateResult();
      return false;
    }

    // handle checkbox groups
    if (isFilterCheckboxGroup($input)) {
      params = appendParamsCheckboxGroupValues($input, params);
    }

    // map properties
    $input.data('url', url);
    $input.data('params', params);

  }

  function handleUnobtrusiveAjaxComplete(event, xhr) {
    var instance = event.data;
    var $trigger = $(event.target).closest('.genericfilter__filter');
    var response = $.parseJSON(xhr.responseText);

    instance.updateFilterDependencies($trigger, response);
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  function addEventListeners(instance) {
    instance.$form.on(getNamespacedEvent('ajax:before'), triggerSelector, instance, addUnobtrusiveAjaxParams);
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
