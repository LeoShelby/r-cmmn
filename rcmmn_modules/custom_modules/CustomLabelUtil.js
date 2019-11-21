var LabelUtil = require('../../lib/features/label-editing/LabelUtil');

var is = require('../../lib/util/ModelUtil').is;
var isAny = require('../../lib/features/modeling/util/ModelingUtil').isAny;

var getBusinessObject = require('../../lib/util/ModelUtil').getBusinessObject;
 
// delete the function you would like to override
delete LabelUtil['getLabel'];

LabelUtil.getLabel = function(element) {

    var semantic = getSemantic(element),
        attr = getLabelAttr(semantic);
  
    if (!hasEditableLabel(semantic)) {
      return;
    }
  
    // Get definition as semantic if
    // * the element has no name property set
    // * the element type has a reference to a definition
    if (!semantic[attr] && isReferencing(element)) {
      semantic = semantic.definitionRef;
    }
  
    return semantic[attr] || '';
};


function getLabelAttr(element) {
    if (is(element, 'cmmn:TextAnnotation')) {
      return 'text';
    }
  
    return 'name';
  }
  
function getSemantic(element) {
    var bo = getBusinessObject(element);

    if (is(bo, 'cmmndi:CMMNEdge') && bo.cmmnElementRef) {
        bo = bo.cmmnElementRef;
    }

    return bo;
}


var isReferencing = function(element) {
    return isAny(element, [
        'cmmn:PlanItem',
        'cmmn:DiscretionaryItem',
        'cmmn:CaseFileItem'
    ]);
};

function hasEditableLabel(element) {


    if(isConnection(element)){
        if(checkTargetType(element,'cmmn:AlternativeCaseFileItem') ||  checkTargetType(element,'cmmn:TextAnnotation')){
            return false;
        }

        if(checkSourceType(element,'cmmn:AlternativeCaseFileItem')){
            return false;
        }
    
        if(checkTargetDefinition(element,'cmmn:AlternativeMilestone')){
            return false;
        }

        if(checkTargetDefinition(element,'cmmn:EventListener')){
            return false;
        }

        if(checkTargetDefinition(element,'cmmn:UserEventListener')){
            return false;
        }

        if(checkTargetDefinition(element,'cmmn:TimerEventListener')){
            return false;
        }

    }


    if(isAssociation(element)){
        return false;
    }

    return !isAny(element, [
        'cmmn:PlanItemOnPart',
        'cmmn:Criterion',
        'cmmndi:CMMNEdge'
    ]);
}


function isAssociation(element){
    return element.$type == "cmmn:Association";
}

function isConnection(element){
    return element.$type == "cmmn:Connection";
}

function checkTargetType(element,type){
    return element.targetRef.$type == type;
}

function checkSourceType(element,type){
    return element.sourceRef.$type == type;
}

function checkTargetDefinition(element,type){
    if(element.targetRef.definitionRef){
        return element.targetRef.definitionRef.$type == type;
    }
    return false;
}

module.exports = LabelUtil;