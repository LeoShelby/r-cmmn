'use strict';

var assign = require('min-dash').assign;
var inherits = require('inherits');

var LabelUtil = require('../../lib/util/LabelUtil'),
    ModelUtil = require('../../lib/util/ModelUtil'),
    DiUtil = require('../../lib/util/DiUtil'),
    ModelingUtil = require('../../lib/features/modeling/util/ModelingUtil');

var getBusinessObject = ModelUtil.getBusinessObject;
var getName = ModelUtil.getName;

var hasExternalLabel = LabelUtil.hasExternalLabel;
var getExternalLabelMid = LabelUtil.getExternalLabelMid;

var isStandardEventVisible = DiUtil.isStandardEventVisible;

var isAny = ModelingUtil.isAny;

//the priority used in the Original LabelBehavior is 200
const PRIORITY = 300;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor').default;


/**
 * A component that makes sure that external labels are added
 * together with respective elements and properly updated (DI wise)
 * during move.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {cmmnFactory} cmmnFactory
 */
function LabelBehavior(eventBus, modeling, cmmnFactory) {

  CommandInterceptor.call(this, eventBus);

  // create external labels on shape creation

  this.postExecuted([ 'shape.create', 'connection.create' ], 100, function(e) {

    var context = e.context;
    var element = context.shape || context.connection;
    var businessObject = element.businessObject;
    var position;

    //if (hasExternalLabel(businessObject)) {
    if(isConnection(element)){
      position = getExternalLabelMid(element);
      modeling.createLabel(element, position, {
        id: businessObject.id + '_label',
        hidden: !getName(element) && !isStandardEventVisible(businessObject),
        businessObject: businessObject
      });
    }
  });

}


function isConnection(element){
  if(element.type == 'cmmndi:CMMNEdge'){
    //manage the case in which you create a discretionary item from task
    if(element.businessObject.cmmnElementRef){
      return element.businessObject.cmmnElementRef.$type == 'cmmn:Connection';
    }
    return false;
  }
  return false;
}

inherits(LabelBehavior, CommandInterceptor);

LabelBehavior.$inject = [ 'eventBus', 'modeling', 'cmmnFactory' ];

module.exports = LabelBehavior;
