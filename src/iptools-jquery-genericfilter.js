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
  var moocData = '<option value="0">choose</option><option value="1">1</option><option value="2">2</option>';

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

    this.type = this.getElementType();
    this.settings = $.extend({}, defaults, options);

    this.$child = $('*[name="' + this.settings.child + '"]');
    if (this.$child.length === 0) {
      throw new Error('Required child dom element is missing');
    }

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

  IPTGenericFilter.prototype.updateChild = function(htmlData) {
    var self = this;

    self.$child.empty();

    if (null !== htmlData) {
      self.$child.append(htmlData);
      self.enableChildFilter();
    } else {
      self.disableChildFilter();
    }
    self.$child.val(0);
    self.$child.trigger('change');
  };

  IPTGenericFilter.prototype.fetchData = function(value) {
    // implement ajax functionality here
    console.log('fetchData with value ', value);
    this.updateChild(moocData);
  };

  IPTGenericFilter.prototype.destroy = function() {
    this.$element.off(getNamespacedEvent('change'));
    this.$element.removeData('plugin_' + pluginName);
  };

  function handleElementChange(event) {
    var self = event.data;
    var value = self.getElementValue();
    if (null !== value) {
      self.fetchData(value);
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
