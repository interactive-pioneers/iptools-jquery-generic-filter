/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {
    child: null
  };

  // mooc data @TODO
  var JSONMoocData = '{"0": "please choose a child", "1": "option 1", "2": "option 2", "3": "option 3"}';

  function IPTGenericFilter(element, options) {
    this.$element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  IPTGenericFilter.prototype = {

    init: function() {
      // bail early if config is invalid
      if (this.settings.child === null) {
        this.destroy();
        return;
      }

      // make sure child has attr disabled set
      $('*[name="' + this.settings.child + '"]').attr('disabled', 'disabled');

      this.addEventListeners();
    },

    handleChange: function(event) {
      var self = event.data;
      var filter = self.$element.attr('name');
      var value = self.getValue(self);
      console.log('value ' + value);
      if (value !== 0) {
        self.fetchData(filter, value);
      } else {
        self.updateChild(null);
      }
    },

    updateChild: function(data) {
      var child = $('*[name="' + this.settings.child + '"]');
      var $option = null;
      console.log('updateChild ' + this.settings.child + ' length: ' + child.length + ' data: ' + data);

      child.empty();

      if (null !== data) {
        $.each(data, function(value, label) {
          $option = $('<option value="' + value + '">' + label + '</option>');
          child.append($option);
        });
        child.removeAttr('disabled');
      } else {
        child.attr('disabled', 'disabled');
      }
      child.val(0);
      child.trigger('change');
    },

    getValue: function(self) {
      var value = $.trim(self.$element.val());
      value = parseInt(value, 10) || 0;
      return value;
    },

    fetchData: function(filter, value) {
      // implement ajax functionality here
      var data = $.parseJSON(JSONMoocData);
      this.updateChild(data, filter, value);
    },

    addEventListeners: function() {
      this.$element.on('change' + '.' + this.name, null, this, this.handleChange);
    },

    destroy: function() {
      this.$element.off('change' + '.' + this._name);
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
