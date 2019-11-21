'use strict';

var assign = require('min-dash').assign;
var is = require('../../lib/util/ModelUtil').is;
var getDefinition = require('../../lib/util/ModelUtil').getDefinition;
var isCasePlanModel = require('../../lib/util/ModelUtil').isCasePlanModel;
var isCollapsed = require('../../lib/util/DiUtil').isCollapsed;
var BaseElementFactory = require('diagram-js/lib/core/ElementFactory').default;
var LabelUtil = require('../../lib/util/LabelUtil');


var ElementFactory = require('../../lib/features/modeling/ElementFactory');
var inherits = require('inherits');


function CustomElementFactory(customCmmnFactory, moddle) {
    ElementFactory.call(this);

  this._cmmnFactory = customCmmnFactory;
  this._moddle = moddle;
}

inherits(CustomElementFactory, ElementFactory);


CustomElementFactory.$inject = [ 'customCmmnFactory', 'moddle' ];


CustomElementFactory.prototype.createAlternativeCaseFileItemShape = function() {
  return this.createShape({
    type: 'cmmn:AlternativeCaseFileItem',
    businessObject: this._cmmnFactory.createAlternativeCaseFileItem()
  });
};


module.exports = CustomElementFactory;