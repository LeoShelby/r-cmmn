var CmmnRules = require('../../lib/features/rules/CmmnRules');


var ModelUtil = require ('../../lib/util/ModelUtil');
var is = ModelUtil.is;
var isCasePlanModel = ModelUtil.isCasePlanModel;
var getDefinition = ModelUtil.getDefinition;


var isCollapsed = require('../../lib/util/DiUtil').isCollapsed;
var isCriterionAttachment = require('../../lib/features/snapping/CmmnSnappingUtil').getCriterionAttachment;
var getParents = require('../../lib/features/modeling/util/ModelingUtil').getParents;


delete CmmnRules.prototype['canDrop'];

delete CmmnRules.prototype['canAttachCriterion'];


CmmnRules.prototype.canDrop = function(element, target) {
  // can move labels everywhere
  if (isLabel(element) && !isConnection(target)) {
    return true;
  }

  if(isCaseFileItem(element) && isRecoveryStage(target)){
    if(element.businessObject.definitionRef.criticalityValue != 0){
        return false;
    }
    if(!notHasAlternativeCaseFileItem(element)){
        return false;
    }
  }

  if(isAlternativeCaseFileItem(element) && isRecoveryStage(target)){
      return false;
  }


  //----------------------------------------------
  
  
  if (isArtifact(element)) {

    return is(target, 'cmmndi:CMMNDiagram') ||
           isPlanFragment(target, true);
  }

  if (isCriterion(element)) {
    return false;
  }

  if (isCasePlanModel(element)) {
    // allow casePlanModels to drop only on root (CMMNDiagram)
    return is(target, 'cmmndi:CMMNDiagram');
  }

  // allow any other element to drop on a case plan model or on an expanded stage
  if (!isPlanFragment(target, true)) {
    return false;
  }

  return !isCollapsed(target);


}


CmmnRules.prototype.canAttachCriterion = function(element, target, position, source) {

    if (source && isParent(source, target)) {
      return false;
    }
  
    // disallow drop criterion...
  
    // ... on another criterion
    if (isCriterion(target)) {
      return false;
    }
  
    // ... on event listener
    if (isEventListener(target)) {
      return false;
    }
  
    // a plan fragment does not have any execution semantic,
    // that why it should not be possible to attach an criterion
    if (isPlanFragment(target)) {
      return false;
    }
  
    // ... on a text annotation
    if (isTextAnnotation(target)) {
      return false;
    }
  
    // ... on a case file item
    if (isCaseFileItem(target)) {
      return false;
    }
  
    // only attach to border
    if (position && !isCriterionAttachment(position, target)) {
      return false;
    }


    //------------------------------------------

    if(isAlternativeMilestone(target)){
      return false;
    }

    if(isRecoveryStage(target)){   
        //if the criterion has already a parent it means that you are moving an already existing criterion
        if(element.businessObject.$parent){
            if(element.businessObject.$parent.definitionRef){
              if(element.businessObject.$parent.definitionRef.id == target.businessObject.definitionRef.id){
                  return true;
              }
              else{
                  return false;
              }
            }
        }
        //otherwise it means the you are creating a new criterion from a contextPad
        if(target.attachers.length >= 2){
            return false;
        }
    }

    if(element.businessObject.$parent){
      if(element.businessObject.$parent.definitionRef){
        if(element.businessObject.$parent.definitionRef.$type == 'cmmn:RecoveryStage'){
          return false;
        }
      }
    }

    return true;
  
  };


function isRecoveryStage(element){
    if(element.businessObject.definitionRef){
        return element.businessObject.definitionRef.$type == 'cmmn:RecoveryStage';
    }
}


function isCaseFileItem(element) {
    return element.type == 'cmmn:CaseFileItem';
}

function isAlternativeCaseFileItem(element) {
    return is(element, 'cmmn:AlternativeCaseFileItem');
}

function isAlternativeMilestone(element) {
  return is(getDefinition(element), 'cmmn:AlternativeMilestone');
}


function isPlanFragment(element, isStage) {
    var definition = getDefinition(element) || element;
  
    if (!is(definition, 'cmmn:PlanFragment')) {
      return false;
    }
  
    if (!isStage && is(definition, 'cmmn:Stage')) {
      return false;
    }
  
    return true;
}

function isArtifact(element) {
    if (isConnection(element)) {
      element = element.businessObject.cmmnElementRef;
    }
    return is(element, 'cmmn:Artifact');
}

function isConnection(element) {
    return element.waypoints;
}

function isLabel(element) {
    return element.labelTarget;
}

function isCriterion(element) {
    return is(element, 'cmmn:Criterion');
}

function notHasAlternativeCaseFileItem(element){
    var out = element.outgoing;
    for (let i=0; i< out.length; i++) {
      if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
        if(out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:AlternativeCaseFileItem'){
          return false;
        }
      }
    }
    return true;
}


function isEventListener(element) {
    return is(getDefinition(element), 'cmmn:EventListener');
}

function isTextAnnotation(element) {
    return is(element, 'cmmn:TextAnnotation');
}


function isParent(possibleParent, element) {
    var allParents = getParents(element);
    return allParents.indexOf(possibleParent) !== -1;
}

module.exports = CmmnRules;
