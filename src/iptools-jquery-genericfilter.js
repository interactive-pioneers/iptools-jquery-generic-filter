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
    var dependencySelectors = filter.data('genericfilter-dependencies');
    var $dependencies = $(dependencySelectors.toString());

    if (dependencySelectors.length === 0 || $dependencies.length === 0) {
      return null;
    }

    return $dependencies;
  };

  IPTGenericFilter.prototype.updateFilterDependencies = function($trigger, data) {
    var $dependencies = this.getFilterDependencies($trigger);

    // trigger form submit and bail if filter has no dependencies
    if (null === $dependencies) {
      this.updateResult();
      return;
    }

    // bail if trigger was triggered by it's dedendency
    if (this._$lastTrigger !== null && isLastTriggerADependency(this._$lastTrigger, $trigger)) {
      this.updateResult();
      this._$lastTrigger = null;
      return;
    }

    // if data add, otherwise clear dependency
    if (null !== data) {
      $.each(data, function(selector, html) {
        $(selector).html(html);
      });
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

  function isLastTriggerADependency($lastTrigger, $trigger) {
    var is = false;
    var triggerId = '#' + $lastTrigger.attr('id');
    var dependenciesSelector = $trigger.data('genericfilter-dependencies');
    var dependencies = dependenciesSelector.split(',');

    $.each(dependencies, function(index, value) {
      if (triggerId === $.trim(value)) {
        is = true;
      }
    });

    return is;
  }

  function addUnobtrusiveAjaxParams(event) {
    var instance = event.data;
    var $input = $(event.target);
    var $filter = $input.closest('.genericfilter__filter');
    //var uid = encodeURIComponent($filter.attr('id'));
    var dependencies = encodeURIComponent($.trim($filter.data('genericfilter-dependencies')));

    // do not perform a filter call if there is no expecting result
    if ('' === dependencies) {
      instance.updateResult();
      return false;
    }
    // add url
    $input.data('url', instance.settings.basePath + 'filter');
    $input.data('params', 'dependencies=' + dependencies);
  }

  function handleUnobtrusiveAjaxComplete(event, xhr) {
    var self = event.data;
    var $trigger = $(event.target).closest('.genericfilter__filter');

    var response = $.trim(xhr.responseText) !== '' ?
      $.parseJSON($.trim(xhr.responseText).replace(/\r?\n|\r/g, ''))
      : null;

    self.updateFilterDependencies($trigger, response);
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