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
    return list.replace(/([A-Za-z]+[\w\-\:\.]*)/g, '#$&');
  }

  function isFilterCheckboxGroup($input) {
    var $checkboxes = getCheckboxGroupMembers($input, true);
    return $checkboxes.length > 0;
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

  function getCheckboxGroupMembers($input, skipGiven) {
    var $filter = $input.closest(filterSelector);
    var $collection = $filter.find('input[type="checkbox"]').not(skipGiven ? $input : '');

    return $collection;
  }

  function handleUnobtrusiveAjaxBefore(event) {
    var instance = event.data;
    var $input = $(event.target);
    var dependencies = $.trim($input.closest(filterSelector).data(filterDataDependencies));

    // If filter has no dependencies and call is not forced by settings, skip ajax call.
    if ('' === dependencies && !instance.settings.noDependencyFilterTrigger) {
      instance.updateResult();
      return false;
    }

    // If filter is part of a checkbox group, append values from all group members to ajax call.
    if (isFilterCheckboxGroup($input)) {
      appendCheckboxGroupValuesToAjaxParameter($input);
    }
  }

  function handleUnobtrusiveAjaxComplete(event, xhr) {
    var instance = event.data;
    var $filter = $(event.target).closest(filterSelector);

    var responseJSON = null;
    try {
      responseJSON = $.parseJSON(xhr.responseText);
    } catch (error) {
      if ('object' === typeof console && 'function' === typeof console.log) {
        console.log(xhr);
        console.log(error);
      }
      responseJSON = null;
    } finally {
      instance.updateFilterDependencies($filter, responseJSON);
    }
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  function addEventListeners(instance) {
    instance.$form.on(getNamespacedEvent('ajax:before'), triggerSelector, instance, handleUnobtrusiveAjaxBefore);
    instance.$form.on(getNamespacedEvent('ajax:complete'), triggerSelector, instance, handleUnobtrusiveAjaxComplete);
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
