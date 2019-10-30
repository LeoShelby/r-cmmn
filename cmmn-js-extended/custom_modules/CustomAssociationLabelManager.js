'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;

var forEach = require('min-dash').forEach,
    flatten = require('min-dash').flatten,
    groupBy = require('min-dash').groupBy,
    map = require('min-dash').map,
    some = require('min-dash').some;

var ModelUtil = require('../../lib/util/ModelUtil'),
    is = ModelUtil.is,
    isCasePlanModel = ModelUtil.isCasePlanModel,
    getSentry = ModelUtil.getSentry,
    getBusinessObject = ModelUtil.getBusinessObject,
    getDefinition = ModelUtil.getDefinition,
    getStandardEvents = ModelUtil.getStandardEvents;

var getParent = require('../../lib/features/modeling/util/ModelingUtil').getParent;

var PlanItemDefinitionUtil = require('../../lib/features/modeling/util/PlanItemDefinitionUtil'),
    isItemCapable = PlanItemDefinitionUtil.isItemCapable,
    getAllDiscretionaryItems = PlanItemDefinitionUtil.getAllDiscretionaryItems,
    getDirectItemCapables = PlanItemDefinitionUtil.getDirectItemCapables,
    isHumanTask = PlanItemDefinitionUtil.isHumanTask;

const PRIORITY = 1200;

/**
 * A handler responsible for adding, moving and deleting sentries.
 * These changes are reflected to the underlying CMMN 1.1 XML.
 */
function CustomAssociationLabelManager(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  eventBus.on('element.dblclick', function(event) {
    
    var element = event.element;
    var oldTip = document.getElementById("tooltip");
    var parent = document.getElementsByClassName("djs-direct-editing-parent");
    var firstChild = document.getElementsByClassName("djs-direct-editing-content");


    if(isConnectionEvent(element) || isCaseFileItemOnPartEvent(element)){

        if(isPredicateOnConnection(element) || isAlternativeConnection(element)
             || isTextAnnotationConnection(element) || isErrorEventListenerConnection(element)){
            return;
        } 

        if(!oldTip){

            var tip = document.createElement('div');
            tip.setAttribute("title","Possible Labels:\ncreate, update, delete, replace, read");
            tip.setAttribute("id","tooltip");

            var tmp = firstChild[0];

            parent[0].replaceChild(tip,firstChild[0]);
            tip.appendChild(tmp);
            //console.log(parent[0]);

        }
    }
     
 
    else{
        if(oldTip){
            parent[0].replaceChild(firstChild[0],oldTip);
            //console.log(parent[0]);
        }

    }
 
   });

  this.postExecuted([ 'connection.create', 'connection.reconnectStart'], PRIORITY, function(context) {

    var connection = getConnection(context.connection);

    //manage the case in which you create a discretionary item from task
    if(connection){

        if(isConnection(connection)){
            if(getTargetDefinition(connection,'cmmn:EventListener') || getTargetDefinition(connection,'cmmn:UserEventListener')
                                     || getTargetDefinition(connection,'cmmn:TimerEventListener')){
                modeling.updateProperties(connection, {
                    name: "predicate on"
                }, connection);
            }

            if(getTargetDefinition(connection,'cmmn:Task')){
                modeling.updateProperties(connection, {
                    name: "add label"
                }, connection);
            }
        }

        if(isCaseFileItemOnPart(connection)){
            modeling.updateProperties(connection, {
                name: "add label"
            }, connection);
        }

        if(isPlanItemOnPart(connection)){

            if(getSourceDefinition(connection,'cmmn:Milestone') || getSourceDefinition(connection,'cmmn:EventListener') 
                || getSourceDefinition(connection,'cmmn:UserEventListener') || getSourceDefinition(connection,'cmmn:TimerEventListener')){
                modeling.updateProperties(connection, {
                    name: "occur"
                }, connection);
                return;
            }
            
            if(getSourceDefinition(connection,'cmmn:ErrorEventListener') || getSourceDefinition(connection,'cmmn:AlternativeMilestone')){
                modeling.updateProperties(connection, {
                    name: " "
                }, connection);
                return;
            }
            
            
            modeling.updateProperties(connection, {
                name: "complete"
            }, connection);

        }
    }


  }, true);


  this.postExecuted('connection.create', function(context) {

    
    if(isAlternativeCaseFileItem(context.target)){
        if(isCaseFileItem(context.source)){
            context.target.businessObject.definitionRef.chainValue = 1;
            modeling.updateSemanticParent(context.target, context.target.businessObject.$parent);
        }
        //is an alternative
        else{
            var chainValuePred = context.source.businessObject.definitionRef.chainValue;
            context.target.businessObject.definitionRef.chainValue = chainValuePred + 1;
            modeling.updateSemanticParent(context.target, context.target.businessObject.$parent);
        }
    }


    if(isAlternativeMilestone(context.target)){
        if(isMilestone(context.source)){
            context.target.businessObject.definitionRef.chainValue = 1;
            modeling.updateSemanticParent(context.target, context.target.businessObject.$parent);
        }
        //is an alternative
        else{
            var chainValuePred = context.source.businessObject.definitionRef.chainValue;
            context.target.businessObject.definitionRef.chainValue = chainValuePred + 1;
            modeling.updateSemanticParent(context.target, context.target.businessObject.$parent);
        }
    }



   }, true);



  eventBus.on('drag.end', function(event) {
    var element = event.shape;
    var target  = event.context.target;

    if(isCaseFileItem(element)){
        if(isRecoveryStage(target) 
            && element.businessObject.definitionRef.criticalityValue == 0 && notHasAltertiveCaseFileItem(element)){

            element.businessObject.definitionRef.recovery = true;
            return;
        }
        if(isPlanFragment(target,true)){
            element.businessObject.definitionRef.recovery = false;
        }
    }

  });


}


CustomAssociationLabelManager.$inject = [
  'eventBus',
  'modeling'
];

inherits(CustomAssociationLabelManager, CommandInterceptor);

module.exports = CustomAssociationLabelManager;

function isConnection(element){
    return element.$type == 'cmmn:Connection';
}

function isCaseFileItemOnPart(element){
    return element.$type == 'cmmn:CaseFileItemOnPart';
}

function isPlanItemOnPart(element){
    return element.$type == 'cmmn:PlanItemOnPart';
}


function getSourceDefinition(element, type){
    if(element.sourceRef.definitionRef){
        return element.sourceRef.definitionRef.$type == type;
    }
    return false;
}

function getTargetDefinition(element, type){
    if(element.targetRef.definitionRef){
        return element.targetRef.definitionRef.$type == type;
    }
    return false;
}


function getConnection(connection) {
  connection = getBusinessObject(connection);
  return connection.cmmnElementRef;
}


function isCaseFileItem(element) {
    if(!element) return false;
    return element.type == 'cmmn:CaseFileItem';
}

function isAlternativeCaseFileItem(element) {
    return is(element, 'cmmn:AlternativeCaseFileItem');
}

function isTextAnnotation(element) {
    return is(element, 'cmmn:TextAnnotation');
}


function isMilestone(element) {
    if(element.type == 'cmmn:PlanItem'){
        return element.businessObject.definitionRef.$type === 'cmmn:Milestone';
    }
}

function isAlternativeMilestone(element) {
    return is(getDefinition(element), 'cmmn:AlternativeMilestone');
}

function isConnectionEvent(element){
    if(element.businessObject.$type == "cmmndi:CMMNEdge"){
        return element.businessObject.cmmnElementRef.$type == 'cmmn:Connection';
    }
    return false;
}

function isCaseFileItemOnPartEvent(element){
    if(element.businessObject.$type == "cmmndi:CMMNEdge"){
        return element.businessObject.cmmnElementRef.$type == 'cmmn:CaseFileItemOnPart';
    }
    return false;
}

function isPredicateOnConnection(element){
    if(element.businessObject.cmmnElementRef.targetRef){
        if(element.businessObject.cmmnElementRef.targetRef.definitionRef){
            var type = element.businessObject.cmmnElementRef.targetRef.definitionRef.$type;
            if(type == 'cmmn:EventListener' || type == 'cmmn:UserEventListener' || type == 'cmmn:TimerEventListener'){
                return true;
            }
        }
        return false;
    }
    return false;
    
}


function isAlternativeConnection(element){
    if(element.businessObject.cmmnElementRef.targetRef){
        if(element.businessObject.cmmnElementRef.targetRef.definitionRef){
            if(element.businessObject.cmmnElementRef.targetRef.definitionRef.$type == 'cmmn:AlternativeMilestone' ||
            element.businessObject.cmmnElementRef.targetRef.$type == 'cmmn:AlternativeCaseFileItem'){
                return true;
            }
        }
        return false;
    }
    return false;

}

function isErrorEventListenerConnection(element){
    if(element.businessObject.cmmnElementRef.targetRef){
        if(element.businessObject.cmmnElementRef.targetRef.definitionRef){
            if( element.businessObject.cmmnElementRef.targetRef.definitionRef.$type == 'cmmn:ErrorEventListener'){
                return true;
            }
        }
        return false;
    }
    return false;
}


function isTextAnnotationConnection(element){
    if(element.businessObject.cmmnElementRef.targetRef){
        if(element.businessObject.cmmnElementRef.targetRef.$type == 'cmmn:TextAnnotation'){
            return true;
        }
        return false;
    }
    return false;

}

function isRecoveryStage(element){
    if(!element) return false;
    if(element.businessObject.definitionRef){
        return element.businessObject.definitionRef.$type == 'cmmn:RecoveryStage';
    }
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

function notHasAltertiveCaseFileItem(element){
    var out = element.outgoing;
    for (let i=0; i< out.length; i++) {
      if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Association'){
        if(out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:AlternativeCaseFileItem'){
          return false;
        }
      }
    }
    return true;
}