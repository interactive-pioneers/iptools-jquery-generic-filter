/* globals jQuery */
(function($) {

  'use strict';

  var pluginName = 'iptGenericFilter';

  var defaults = {
    child: null
  };

  var TYPES = {
    SELECT: 'select',
    NONE: 'none'
  };

  // mooc data @TODO
  var JSONMoocData = '{"0": "please choose a child", "1": "option 1", "2": "option 2", "3": "option 3"}';

  function IPTGenericFilter(element, options) {
    if (!options) {
      throw new Error('Data for filter missing!');
    } else if (!options.child) {
      throw new Error('Required property "child" for filter missing!');
    }

    this.$element = $(element);
    if (this.getElementType() === TYPES.NONE) {
      throw new Error('Invalid type ' + TYPES.NONE);
    }

    this.settings = $.extend({}, defaults, options);

    this.$child = $('*[name="' + this.settings.child + '"]');
    if (this.$child.length === 0) {
      throw new Error('Required child dom element is missing');
    }
    this.type = this.getElementType();

    this.disableChildFilter();
    addEventListeners(this);
  }

  IPTGenericFilter.prototype.getElementValue = function() {
    var value = $.trim(this.$element.val());
    value = validateValue(value, this.type);
    return value;
  };

  IPTGenericFilter.prototype.getElementType = function() {
    if (this.$element.is('select')) {
      return TYPES.SELECT;
    }
    return TYPES.NONE;
  };

  IPTGenericFilter.prototype.enableChildFilter = function() {
    this.$child.removeAttr('disabled');
  };

  IPTGenericFilter.prototype.disableChildFilter = function() {
    this.$child.attr('disabled', 'disabled');
  };

  IPTGenericFilter.prototype.updateChild = function(data) {
    var child = $('*[name="' + this.settings.child + '"]');
    var $option = null;
    console.log('updateChild ' + this.settings.child + ' length: ' + child.length + ' data: ' + data);

    child.empty();

    if (null !== data) {
      $.each(data, function(value, label) {
        $option = $('<option value="' + value + '">' + label + '</option>');
        child.append($option);
      });
      this.enableChildFilter();
    } else {
      this.disableChildFilter();
    }
    child.val(0);
    child.trigger('change');
  };

  IPTGenericFilter.prototype.fetchData = function(filter, value) {
    // implement ajax functionality here
    var data = $.parseJSON(JSONMoocData);
    this.updateChild(data, filter, value);
  };

  IPTGenericFilter.prototype.destroy = function() {
    this.$element.off(getNamespacedEvent('change'));
    this.$element.removeData('plugin_' + pluginName);
  };

  function handleElementChange(event) {
    var self = event.data;
    var filter = self.$element.attr('name');
    var value = self.getElementValue();
    console.log('value ' + value);
    if (null !== value) {
      self.fetchData(filter, value);
    } else {
      self.updateChild(null);
    }
  }

  function validateValue(value, type) {
    switch (type) {

      case TYPES.SELECT:
        value = parseInt(value, 10) || null;
        break;

      default:
        break;
    }

    return value;
  }

  function addEventListeners(instance) {
    instance.$element.on(getNamespacedEvent('change'), null, instance, handleElementChange);
  }

  function getNamespacedEvent(name) {
    return name + '.' + pluginName;
  }

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new IPTGenericFilter(this, options));
      }
    });
  };

})(jQuery);
