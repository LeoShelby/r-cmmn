'use strict';

var forEach = require('min-dash').forEach,
    filter = require('min-dash').filter;

var replaceOptions = require('../../lib/features/replace/ReplaceOptions');

var isItemCapable = require('../../lib/features/modeling/util/PlanItemDefinitionUtil').isItemCapable;

var isAny = require('../../lib/features/modeling/util/ModelingUtil').isAny;

var ModelUtil = require('../../lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    isRequired = ModelUtil.isRequired,
    isRepeatable = ModelUtil.isRepeatable,
    isManualActivation = ModelUtil.isManualActivation,
    is = ModelUtil.is;



function CustomReplaceCriticalityProvider(popupMenu, cmmnReplace, cmmnFactory, modeling, rules) {

  this._popupMenu = popupMenu;
  this._cmmnReplace = cmmnReplace;
  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._rules = rules;

  this.register();
}

CustomReplaceCriticalityProvider.$inject = [ 'popupMenu', 'cmmnReplace', 'cmmnFactory', 'modeling', 'rules'];


/**
 * Register replace menu provider in the popup menu
 */
CustomReplaceCriticalityProvider.prototype.register = function() {
  this._popupMenu.registerProvider('cmmn-criticality', this);
};


/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
CustomReplaceCriticalityProvider.prototype.getEntries = function(element) {
  return [];
};


CustomReplaceCriticalityProvider.prototype.getHeaderEntries = function(element) {
  var headerEntries = [];
  headerEntries = headerEntries.concat(this._getRuleEntries(element));
  return headerEntries;
};

CustomReplaceCriticalityProvider.prototype._createEntries = function(element, replaceOptions) {
  return [];
};
CustomReplaceCriticalityProvider.prototype._createMenuEntry = function(definition, element, action) {
  return [];
};



CustomReplaceCriticalityProvider.prototype._getRuleEntries = function(element) {

  var self = this;

  function toggleControlEntry(value) {

    return function() {
      self._modeling.updateProperties(element.businessObject.definitionRef, {criticalityValue: value}, element);
      //self._modeling.updateSemanticParent(element, element.businessObject.$parent);
    };

  }


    var IsNone = checkCriticalityValue(element, 0);
    var IsLow = checkCriticalityValue(element, 0.2);
    var IsMedium = checkCriticalityValue(element, 0.5);
    var IsHigh = checkCriticalityValue(element, 0.8);
    var IsCritical = checkCriticalityValue(element, 1);


    var entries = [
        {
            id: 'toggle-criticality-none',
            className: 'cmmn-icon-criticality-none',
            title: 'None',
            active: IsNone,
            action: toggleControlEntry(0)
        },
        {
            id: 'toggle-criticality-low',
            className: 'cmmn-icon-criticality-low',
            title: 'Low',
            active: IsLow,
            action: toggleControlEntry(0.2)
        },
        {
            id: 'toggle-criticality-medium',
            className: 'cmmn-icon-criticality-medium',
            title: 'Medium',
            active: IsMedium,
            action: toggleControlEntry(0.5)
        },
        {
            id: 'toggle-criticality-high',
            className: 'cmmn-icon-criticality-high',
            title: 'High',
            active: IsHigh,
            action: toggleControlEntry(0.8)
        },
        {
            id: 'toggle-criticality-critical',
            className: 'cmmn-icon-criticality-critical',
            title: 'Critical',
            active: IsCritical,
            action: toggleControlEntry(1)
        }
        ]

  return entries;
};


function checkCriticalityValue(element,value){
  return element.businessObject.definitionRef.criticalityValue == value;
}


module.exports = CustomReplaceCriticalityProvider;

