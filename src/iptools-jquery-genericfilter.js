/* globals jQuery */
;(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {};

  function IPTGenericFilter(element, options) {
    this.$element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  IPTGenericFilter.prototype = {

    init: function() {
      this.addEventListeners();
    },

    addEventListeners: function() {
      // ...
    },

    destroy: function() {
      //this.$element.off('event' + '.' + this._name);
      this.$element.removeData('plugin_' + pluginName);
    }

  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new IPTGenericFilter(this, options));
      }
    });
  };

})(jQuery);
