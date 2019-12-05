//import inherits from 'inherits';
//import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
var assign = require('min-dash').assign;

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider').default;
var inherits = require('inherits');

var ModelUtil = require('../../lib/util/ModelUtil');
var is = ModelUtil.is;
var getDefinition = ModelUtil.getDefinition;

var ModelingUtil = require('../../lib/features/modeling/util/ModelingUtil');
var isSame = ModelingUtil.isSame;
var isSameCase = ModelingUtil.isSameCase;

const HIGH_PRIORITY = 1500;

export default function CustomCmmnRules(eventBus, elementRegistry) {
    this._elementRegistry = elementRegistry;

    RuleProvider.call(this, eventBus);
}

inherits(CustomCmmnRules, RuleProvider);

CustomCmmnRules.$inject = [ 'eventBus', 'elementRegistry' ];

CustomCmmnRules.prototype.init = function() {

    
    var elementRegistry = this._elementRegistry;

    //need to pass HIGH_PRIORITY because the deafult priority is 1000
    //if you do not specify this parameter, the original CmmnRules is called before
    this.addRule('connection.create', HIGH_PRIORITY, function(context) {
        //console.log("connection create");
        var source = context.source;
        var target = context.target;
       
        var allowed = canConnect(source,target, elementRegistry);

        if (typeof allowed !== 'undefined') return allowed;

    });


    this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
        var connection = context.connection,
        source = connection.source,
        hover = context.hover,
        target = hover || context.target,
        allowed = false;

        if(source && target){
            if(isConnection(connection) || isAssociation(connection)){
                return false;
            }
            //dealing with onPart Association
            else{
                var allowed = canReconnect(source,target);
                if (typeof allowed !== 'undefined'){
                    return allowed;
                }
            }
        }
    });

    this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
        var connection = context.connection,
            hover = context.hover,
            source = hover || context.source,
            target = connection.target,
            allowed = false;

        if(source && target){
            if(isConnection(connection) || isAssociation(connection)){
                return false;
            }
            //dealing with onPart Association
            else{
                var allowed = canReconnect(target,source);
                if (typeof allowed !== 'undefined') return allowed;
            }
        }
    });


    function canConnect(source,target, elementRegistry){

        if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
            return false;
        }
        
        // Disallow connections with same target and source element.
        if (isSame(source, target)) {
            return false;
        }

    
        if (!isSameCase(source, target) && target.businessObject.$parent) {
            return false;
        }

        //-------------- RECOVERY STAGE MANAGEMENT

        if(isRecoveryStage(target)) return false;

        if(isEntryCriterion(target)){
            if(target.businessObject.$parent){
                if(isParentRecoveryStage(target)){
                    if(target.incoming.length >= 1){
                        return false;
                    }
                    if(!isErrorEventListener(source)){
                        return false;
                    }
                }
                else{
                    if(isErrorEventListener(source)){
                        return false;
                    }
                }
            }
        }
        if(isExitCriterion(target)){
            if(target.businessObject.$parent){
                if(isParentRecoveryStage(target)){
                    if(target.incoming.length >= 1){
                        return false;
                    }
                    if(!isAlternativeMilestone(source) && !isMilestone(source)){
                        return false;
                    }
                    if(isAlternativeMilestone(source)){
                        return {
                            type: 'cmmn:PlanItemOnPart',
                            isStandardEventVisible: true
                        };
                    }
                }
            }
        }

        if(!isTextAnnotation(target)){

            if(isEntryCriterion(source)){
                if(source.businessObject.$parent){
                    if(isParentRecoveryStage(source)){
                        if(source.incoming.length >= 1){
                            return false;
                        }
                        if(!isErrorEventListener(target)){
                            return false;
                        }
                    }
                    else{
                        if(isErrorEventListener(target)){
                            return false;
                        }
                    }
                }
            }
            
            if(isExitCriterion(source)){
                if(source.businessObject.$parent){
                    if(isParentRecoveryStage(source)){
                        if(source.incoming.length >= 1){
                            return false;
                        }
                        if(!isAlternativeMilestone(target) && !isMilestone(target)){
                            return false;
                        }
                        if(isAlternativeMilestone(target)){
                            return {
                                type: 'cmmn:PlanItemOnPart',
                                isStandardEventVisible: true,
                                reverse: true
                            };
                        }
                    }
                }
            }
        }

        if(isAlternativeCaseFileItem(source) && isErrorEventListener(target)){
            if(target.incoming.length == 0 && notHasErrorEventListenerConnected(source)){
                return {
                    type: 'cmmn:Connection',
                };
            }
            return false;
        }

        if(isErrorEventListener(source) && isAlternativeCaseFileItem(target)){
            if(source.incoming.length == 0 && notHasErrorEventListenerConnected(target)){
                return {
                    type: 'cmmn:Connection',
                    reverse: true
                };
            }
            return false;
        }


        if(isCaseFileItem(source) && isErrorEventListener(target) ||
           (isErrorEventListener(source) && isCaseFileItem(target))){
            return false;
        }




        //-------------------- ALTERNATIVE CASEFILEITEM MANAGEMENT

        if (isCaseFileItem(source) && isAlternativeCaseFileItem(target)) {
            if(notHasOutcomingFileItems(source) && notHasIncomingFileItems(target) && !getRecoveryAttribute(source)){
                return {
                    type: 'cmmn:Connection',
                };
            }
            return false;
        }
    
        if(isAlternativeCaseFileItem(source) && isAlternativeCaseFileItem(target)){
            if(notHasOutcomingFileItems(source) && notHasIncomingFileItems(target) && hasLabelDefined(source) &&
                !isLoop(source,target,elementRegistry,'cmmn:AlternativeCaseFileItem')){
                return {
                    type: 'cmmn:Connection',
                };
            }
            return false;
        }   

        if (isAlternativeCaseFileItem(source) && isTextAnnotation(target)) {
            return {
                type: 'cmmn:Association',
            };
        }


        //in all the other cases, you cannot associate an AlternativeCaseFileItem with other elements
        if(isAlternativeCaseFileItem(source) || isAlternativeCaseFileItem(target)){
            return false;
        }


        //---------------------------------------------------------------------


        //---------------------------- ALTERNATIVE MILESTONE MANAGEMENT


        if(isMilestone(source) && isAlternativeMilestone(target)) {
            if(notHasOutcomingMilestones(source) && notHasIconmingMilestones(target)){
                return {
                    type: 'cmmn:Connection',
                };
            }
            return false;
        }

        

        if(isAlternativeMilestone(source) && isAlternativeMilestone(target)){
            if(notHasOutcomingMilestones(source) && notHasIconmingMilestones(target) && hasLabelDefined(source) &&
                !isLoop(source,target,elementRegistry,'cmmn:PlanItem')){
                return {
                    type: 'cmmn:Connection',
                };
            }
            return false;
        }

        if(isAlternativeMilestone(source) && isTextAnnotation(target)) {
            return {
                type: 'cmmn:Association',
            };
        }

        if(isAlternativeMilestone(source) || isAlternativeMilestone(target)){
            return false;
        }


        //--------------------------------------------


        //---------------- CONNECT WITHOUT SENTRY

        //if conditions divided in two different if cases
        //in this way, no matter what is the direction of the connection
        //the XML generated will be every time --> <cmmn:Connection source = CaseFileItem, target = Task / Eventlistener>

        if((isCaseFileItem(source) && (isTask(target) || isEventListener(target)))){
            return {
                type: 'cmmn:Connection',
            };
        }
        
        if(((isTask(source) || isEventListener(source))  && isCaseFileItem(target))){    
            return {
                type: 'cmmn:Connection',
                reverse: true
            };
        }


        //-----------------------------------------------------
    }


    function canReconnect(source,target){
        
        //you will never have a onPart connection with an AlternativeCaseFileItem
        if(isAlternativeCaseFileItem(target)) return false;

        if(isRecoveryStage(target)) return false;

        if(isEntryCriterion(source)){
            if(isParentRecoveryStage(source)){
                if(!isErrorEventListener(target)){
                    return false;
                }
            }
        }

        if(isEntryCriterion(target)){
            if(isParentRecoveryStage(target)){
                if(!isErrorEventListener(source)){
                    return false;
                }
            }
        }

        if(isExitCriterion(source)){
            if(isParentRecoveryStage(source)){
                if(!isAlternativeMilestone(target) && !isMilestone(target)){
                    return false;
                }
            }
        }

        if(isExitCriterion(target)){
            if(isParentRecoveryStage(target)){
                if(!isAlternativeMilestone(source) && !isMilestone(source)){
                    return false;
                }
            }
        }

        
        if(isErrorEventListener(source)){
            if(isExitCriterion(target)) return false;
            if(isEntryCriterion(target)){
                if(!isParentRecoveryStage(target)){
                    return false;
                }
            }
        }

        if(isErrorEventListener(target)){
            if(isExitCriterion(source)) return false;
            if(isEntryCriterion(source)){
                if(!isParentRecoveryStage(source)){
                    return false;
                }
            }
        }

        if(isAlternativeMilestone(source)){
            if(isEntryCriterion(target)) return false;
            if(isExitCriterion(target)){
                if(!isParentRecoveryStage(target)){
                    return false;
                }
            }
        }

        if(isAlternativeMilestone(target)){
            if(isEntryCriterion(source)) return false;
            if(isExitCriterion(source)){
                if(!isParentRecoveryStage(source)){
                    return false;
                }
            }
        }


    }

    function isCaseFileItem(element) {
        return element.type == 'cmmn:CaseFileItem';
    }

    function isEntryCriterion(element){
        return element.type == 'cmmn:EntryCriterion';
    }

    function isExitCriterion(element){
        return element.type == 'cmmn:ExitCriterion';
    }

    
	function isParentRecoveryStage(element){
        if(element.businessObject.$parent){
            if(element.businessObject.$parent.definitionRef){   
                return element.businessObject.$parent.definitionRef.$type == 'cmmn:RecoveryStage';
            }
        }
        return false;
    }


    function isEventListener(element) {
        return is(getDefinition(element), 'cmmn:EventListener');
    }

    function isTask(element) {
        return is(getDefinition(element), 'cmmn:Task');
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

    function isRecoveryStage(element){
        if(element.businessObject.definitionRef){
            return element.businessObject.definitionRef.$type == 'cmmn:RecoveryStage';
        }
    }

    function isAssociation(element){
        return element.businessObject.cmmnElementRef.$type == 'cmmn:Association';
    }

    function isConnection(element){
        return element.businessObject.cmmnElementRef.$type == 'cmmn:Connection';
    }

    function getRecoveryAttribute(element){
        return element.businessObject.definitionRef.recovery;
    }

    //this function considers both outgoing and incoming connection

    function notHasIncomingFileItems(element){
        var incoming = element.incoming;
        for (let i=0; i< incoming.length; i++) {
          if(incoming[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
            if((incoming[i].businessObject.cmmnElementRef.sourceRef.$type == 'cmmn:CaseFileItem') ||
                incoming[i].businessObject.cmmnElementRef.sourceRef.$type == 'cmmn:AlternativeCaseFileItem'){
              return false;
            }
          }
        }
        return true;
    }

    function notHasOutcomingFileItems(element){
        var out = element.outgoing;
        for (let i=0; i< out.length; i++) {
          if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
            if((out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:CaseFileItem') ||
                out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:AlternativeCaseFileItem') {
              return false;
            }
          }
        }
        return true;
    }

    function isLoop(source,target,elementRegistry,type){
        var out = target.outgoing;
        for (let i=0; i< out.length; i++) {
            if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
                if(out[i].businessObject.cmmnElementRef.targetRef.$type == type) {
                    if (out[i].businessObject.cmmnElementRef.targetRef.id == source.businessObject.id) {
                        return true;
                    }
                    else{
                        return isLoop(source, elementRegistry.get(out[i].businessObject.cmmnElementRef.targetRef.id), elementRegistry, type);
                    }
                }
            }
        }
        return false;
    }
    
	function hasLabelDefined(element){
        if(!element.businessObject.definitionRef.name) return false;
        if(element.businessObject.definitionRef.name == "") return false;
        return true;
    }


    function notHasIconmingMilestones(element){
        var incoming = element.incoming;
        for (let i=0; i< incoming.length; i++) {
          if(incoming[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
            if(incoming[i].businessObject.cmmnElementRef.sourceRef.$type == 'cmmn:PlanItem'){
              return false;
            }
          }
        }
        return true;
        
    }

    function notHasOutcomingMilestones(element){
        var out = element.outgoing;
        for (let i=0; i< out.length; i++) {
          if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
            if(out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:PlanItem'){
              return false;
            }
          }
        }
        return true;
    }


    function notHasErrorEventListenerConnected(element){
        var out = element.outgoing;
        for (let i=0; i< out.length; i++) {
            if(out[i].businessObject.cmmnElementRef.$type == 'cmmn:Connection'){
                if(out[i].businessObject.cmmnElementRef.targetRef.$type == 'cmmn:PlanItem'){
                  return false;
                }
            }
        }
        return true;
    }

    function nonExistingOrLabel(element) {
        return !element || isLabel(element);
      }
      
    function isLabel(element) {   
        return element.labelTarget;
    }

    function isEntryCriterion(element){
        return element.type == 'cmmn:EntryCriterion';
    }
    function isExitCriterion(element){
        return element.type == 'cmmn:ExitCriterion';
    }

    function isErrorEventListener(element) {
        return is(getDefinition(element), 'cmmn:ErrorEventListener');
    }

    function isPlanItem(element){
        return element.businessObject.$type == 'cmmn:PlanItem';
    }
};
