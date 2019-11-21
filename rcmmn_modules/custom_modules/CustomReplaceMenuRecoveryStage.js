'use strict';



var isAny = require('../../lib/features/modeling/util/ModelingUtil').isAny;

var ModelUtil = require('../../lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    isRequired = ModelUtil.isRequired,
    isRepeatable = ModelUtil.isRepeatable,
    isManualActivation = ModelUtil.isManualActivation,
    is = ModelUtil.is;



/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
function CustomReplaceMenuRecoveryStage(popupMenu, cmmnReplace, cmmnFactory, modeling, rules) {

  this._popupMenu = popupMenu;
  this._cmmnReplace = cmmnReplace;
  this._cmmnFactory = cmmnFactory;
  this._modeling = modeling;
  this._rules = rules;

  this.register();
}

CustomReplaceMenuRecoveryStage.$inject = [ 'popupMenu', 'cmmnReplace', 'cmmnFactory', 'modeling', 'rules' ];


/**
 * Register replace menu provider in the popup menu
 */
CustomReplaceMenuRecoveryStage.prototype.register = function() {
  this._popupMenu.registerProvider('cmmn-replace-recovery-stage', this);
};


CustomReplaceMenuRecoveryStage.prototype.getEntries = function(element) {
  return [];
};


CustomReplaceMenuRecoveryStage.prototype.getHeaderEntries = function(element) {

  var headerEntries = [];

  if (isTask(element)) {
    headerEntries = headerEntries.concat(this._getBlockingEntry(element));
  }

  if (isStage(element)) {
    headerEntries = headerEntries.concat(this._getAutoCompleteEntry(element));
  }

  if (ensureSupportRules(element)) {
    headerEntries = headerEntries.concat(this._getRuleEntries(element));
  }

  return headerEntries;

};

CustomReplaceMenuRecoveryStage.prototype._createEntries = function(element, replaceOptions) {
    return [];
};

CustomReplaceMenuRecoveryStage.prototype._createMenuEntry = function(definition, element, action) {
    return [];
};


CustomReplaceMenuRecoveryStage.prototype._getBlockingEntry = function(element) {

  var self = this;

  var definition = getDefinition(element);

  function toggleBlockingEntry(event, entry) {
    var blocking = !entry.active;
    self._modeling.updateControls(element, { isBlocking: blocking });
  }

  var isBlocking = definition.isBlocking;
  var entries = [
    {
      id: 'toggle-is-blocking',
      className: 'cmmn-icon-blocking',
      title: 'Blocking',
      active: isBlocking,
      action: toggleBlockingEntry
    }
  ];

  return entries;
};


CustomReplaceMenuRecoveryStage.prototype._getAutoCompleteEntry = function(element) {

  var self = this;

  var definition = getDefinition(element);

  function toggleAutoCompleteEntry(event, entry) {
    var autoComplete = !entry.active;
    self._modeling.updateControls(element, { autoComplete: autoComplete });
  }

  var isAutoComplete = definition.autoComplete;
  var entries = [
    {
      id: 'toggle-auto-complete',
      className: 'cmmn-icon-auto-complete-marker',
      title: 'Auto Complete',
      active: isAutoComplete,
      action: toggleAutoCompleteEntry
    }
  ];

  return entries;
};


CustomReplaceMenuRecoveryStage.prototype._getRuleEntries = function(element) {

  var self = this;

  function toggleControlEntry(control, type) {

    return function(event, entry) {

      var value = {};

      if (entry.active) {
        value[control] = undefined;
      }
      else {
        value[control] = self._cmmnFactory.create(type);
      }

      self._modeling.updateControls(element, value);
    };

  }

  var repeatable = isRepeatable(element),
      required = isRequired(element),
      manualActivation = isManualActivation(element);

  var entries = [
    {
      id: 'toggle-required-rule',
      className: 'cmmn-icon-required-marker',
      title: 'Required Rule',
      active: required,
      action: toggleControlEntry('requiredRule', 'cmmn:RequiredRule')
    }
  ];

  if (!isMilestone(element)) {

    entries.push({
      id: 'toggle-manual-activation-rule',
      className: 'cmmn-icon-manual-activation-marker',
      title: 'Manual Activation Rule',
      active: manualActivation,
      action: toggleControlEntry('manualActivationRule', 'cmmn:ManualActivationRule')
    });

  }

  entries.push({
    id: 'toggle-repetition-rule',
    className: 'cmmn-icon-repetition-marker',
    title: 'Repetition Rule',
    active: repeatable,
    action: toggleControlEntry('repetitionRule', 'cmmn:RepetitionRule')
  });

  return entries;
};

module.exports = CustomReplaceMenuRecoveryStage;


function ensureSupportRules(element) {

  var definition = getDefinition(element);

  return !isCasePlanModel(element) && isAny(definition, [
    'cmmn:Stage',
    'cmmn:Milestone',
    'cmmn:Task'
  ]);
}

function isPlanFragment(element) {
  return is(getDefinition(element), 'cmmn:PlanFragment');
}

function isStage(element) {
  return is(getDefinition(element), 'cmmn:Stage');
}

function isEventListener(element) {
  return is(getDefinition(element), 'cmmn:EventListener');
}

function isMilestone(element) {
  return is(getDefinition(element), 'cmmn:Milestone');
}

function isTask(element) {
  return is(getDefinition(element), 'cmmn:Task');
}

function isCriterion(element) {
  return is(element, 'cmmn:Criterion');
}

function isPlanItem(element) {
  return is(element, 'cmmn:PlanItem');
}
