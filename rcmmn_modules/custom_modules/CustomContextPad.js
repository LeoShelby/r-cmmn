/*
var is = require('../../lib/util/ModelUtil').is;
var assign = require('min-dash').assign;

export default class CustomContextPad {
    constructor(contextPad, create, customElementFactory, elementFactory, canvas, popupMenu) {
        this.create = create;
        this.customElementFactory = customElementFactory;
        this.elementFactory = elementFactory;

        this.contextPad = contextPad;
        this.canvas = canvas;
        this.popupMenu = popupMenu;

        contextPad.registerProvider(this);
    }

    getContextPadEntries(element) {
        const {
        create,
        customElementFactory,
        elementFactory,
        contextPad,
        canvas,
        popupMenu
        } = this;


        function appendAlternativeCaseFileItem(event) {
            const shape = customElementFactory.createAlternativeCaseFileItemShape('cmmn:AlternativeCaseFileItem');
            create.start(event, shape, element);
        }

        function appendAlternativeMilestone(event) {
          const shape = elementFactory.createPlanItemShape('cmmn:AlternativeMilestone');
          create.start(event, shape, element);
        }


        function getReplaceMenuPosition(element) {

          var Y_OFFSET = 5;
      
          var diagramContainer = canvas.getContainer(),
              pad = contextPad.getPad(element).html;
      
          var diagramRect = diagramContainer.getBoundingClientRect(),
              padRect = pad.getBoundingClientRect();
      
          var top = padRect.top - diagramRect.top;
          var left = padRect.left - diagramRect.left;
      
          var pos = {
            x: left,
            y: top + padRect.height + Y_OFFSET
          };
      
          return pos;
        }

        var actions = {};

        //if (is(element, 'cmmn:CaseFileItem')) {
        if (element.type === 'cmmn:CaseFileItem') {

            assign(actions, {
                'append.alternative-case-file-item': {
                    group: 'model',
                    className: 'cmmn-icon-alternative-case-file-item',
                    title: 'Append AlternativeCaseFileItem',
                    action: {
                        click: appendAlternativeCaseFileItem,
                        dragstart: appendAlternativeCaseFileItem
                    }
                }
            });


            assign(actions, {
              'edit.criticality': {
                group: 'connect',
                className: 'cmmn-icon-criticality-add',
                title: 'Change Criticality',
                action: {
                  click: function(event, element) {
        
                    var position = assign(getReplaceMenuPosition(element), {
                      cursor: { x: event.x, y: event.y }
                    });
        
                    popupMenu.open(element, 'cmmn-criticality', position);
                  }
                }
              }
            });


            assign(actions, {
              'append.text-annotation': { }
            });

            
            return actions;
        }

        if(element.type == 'cmmn:PlanItem'){
          if (element.businessObject.definitionRef.$type === 'cmmn:Milestone') {



            assign(actions, {
              'edit.criticitality': {
                group: 'edit',
                className: 'cmmn-icon-criticality-add',
                title: 'Change Criticality',
                action: {
                  click: function(event, element) {
        
                    var position = assign(getReplaceMenuPosition(element), {
                      cursor: { x: event.x, y: event.y }
                    });
        
                    popupMenu.open(element, 'cmmn-criticality', position);
                  }
                }
              }
            });

            assign(actions, {
              'append.alternative-milestone': {
                  group: 'model',
                  className: 'cmmn-icon-alternative-milestone',
                  title: 'Append AlternativeMilestone',
                  action: {
                      click: appendAlternativeMilestone,
                      dragstart: appendAlternativeMilestone
                  }
              }
            });
            
            return actions;
          }
        }

    }
}

CustomContextPad.$inject = [
'contextPad',
'create',
'customElementFactory',
'elementFactory',
'canvas',
'popupMenu'
];


*/



'use strict';

var assign = require('min-dash').assign,
    isArray = require('min-dash').isArray;

var isAny = require('../../lib/features/modeling/util/ModelingUtil').isAny;

var ModelUtil = require('../../lib/util/ModelUtil'),
    is = ModelUtil.is,
    getDefinition = ModelUtil.getDefinition;

/**
 * A provider for CMMN 1.1 elements context pad
 */
function ContextPadProvider(
    contextPad,
    connect,
    create,
    elementFactory,
    customElementFactory,
    modeling,
    rules,
    popupMenu,
    canvas
) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._connect = connect;
  this._create = create;
  this._elementFactory = elementFactory;
  this._customElementFactory = customElementFactory;
  this._modeling = modeling;
  this._rules = rules;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
}

ContextPadProvider.$inject = [
  'contextPad',
  'connect',
  'create',
  'elementFactory',
  'customElementFactory',
  'modeling',
  'rules',
  'popupMenu',
  'canvas'
];

module.exports = ContextPadProvider;


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var contextPad = this._contextPad,
      connect = this._connect,
      create = this._create,
      elementFactory = this._elementFactory,
      customElementFactory = this._customElementFactory,
      modeling = this._modeling,
      canvas = this._canvas,
      rules = this._rules,
      popupMenu = this._popupMenu;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }


  function removeElement(e) {
    modeling.removeElements([ element ]);
  }

  function getReplaceMenuPosition(element) {

    var Y_OFFSET = 5;

    var diagramContainer = canvas.getContainer(),
        pad = contextPad.getPad(element).html;

    var diagramRect = diagramContainer.getBoundingClientRect(),
        padRect = pad.getBoundingClientRect();

    var top = padRect.top - diagramRect.top;
    var left = padRect.left - diagramRect.left;

    var pos = {
      x: left,
      y: top + padRect.height + Y_OFFSET
    };

    return pos;
  }

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }


  function appendCriterionAction(className, title, options) {

    function appendListener(event, element) {
      var shape = elementFactory.createCriterionShape('cmmn:EntryCriterion');
      create.start(event, shape, element);
    }

    return appendAction('cmmn:EntryCriterion', className, title, options, appendListener);
  }

  function appendDiscretionaryItemAction(className, title, options) {

    function appendListener(event, element) {
      var shape = elementFactory.createDiscretionaryItemShape('cmmn:Task');
      create.start(event, shape, element);
    }

    return appendAction('cmmn:DiscretionaryItem', className, title, options, appendListener);
  }

  function appendAction(type, className, title, options, listener) {

    if (typeof title !== 'string') {
      options = title;
      title = 'Append ' + type.replace(/^cmmn:/, '');
    }

    function appendListener(event, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, element);
    }

    return {
      group: 'model',
      className: className,
      title: title,
      action: {
        dragstart: listener || appendListener,
        click: listener || appendListener
      }
    };
  }

  //----------------------------------------

  function isAlternativeMilestone(element) {
    return is(getDefinition(element), 'cmmn:AlternativeMilestone');
  }

  function isAlternativeCaseFileItem(element) {
    return is(element, 'cmmn:AlternativeCaseFileItem');
  }

  function isCaseFileItem(element) {
    return element.type == 'cmmn:CaseFileItem';
  }


  function isRecoveryStage(element){
    if(element.businessObject.definitionRef){
        return element.businessObject.definitionRef.$type == 'cmmn:RecoveryStage';
    }
  }

  //----------------------------------------


  if (isAny(element, [ 'cmmn:PlanItem', 'cmmn:CaseFileItem' ]) && !isAlternativeMilestone(element) && !isAlternativeCaseFileItem(element)) {
    assign(actions, {
      'append.entryCriterion': appendCriterionAction('cmmn-icon-entry-criterion', 'Append Criterion')
    });
  }

  if (isBlockingHumanTask(element)) {
    assign(actions, {
      'append.discretionaryItem': appendDiscretionaryItemAction(
        'cmmn-icon-task-discretionary',
        'Append DiscretionaryItem'
      )
    });
  }


  if (!popupMenu.isEmpty(element, 'cmmn-replace') && !isAlternativeMilestone(element)) {

    // Replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'cmmn-icon-screw-wrench',
        title: 'Change type',
        action: {
          click: function(event, element) {

            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'cmmn-replace', position);
          }
        }
      }
    });
  }


  if (!isAny(element, [ 'cmmndi:CMMNEdge', 'cmmn:TextAnnotation' ])) {
    assign(actions, {
      'append.text-annotation': appendAction('cmmn:TextAnnotation', 'cmmn-icon-text-annotation')
    });
  }


  if (isAny(element, [
    'cmmn:PlanItem',
    'cmmn:DiscretionaryItem',
    'cmmn:CaseFileItem',
    'cmmn:Criterion'
  ])) {

    assign(actions, {

      'connect': {
        group: 'connect',
        className: 'cmmn-icon-connection',
        title: 'Connect using Discretionary/OnPart or Association',
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      }
    });
  }


  // delete element entry, only show if allowed by rules
  var deleteAllowed = rules.allowed('elements.delete', { elements: [ element ] });

  if (isArray(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'cmmn-icon-trash',
        title: 'Remove',
        action: {
          click: removeElement
        }
      }
    });
  }


//---------------------------------------------------

  function appendAlternativeMilestone(event) {
    const shape = elementFactory.createPlanItemShape('cmmn:AlternativeMilestone');
    create.start(event, shape, element);
  }

  function appendAlternativeCaseFileItem(event) {
    const shape = customElementFactory.createAlternativeCaseFileItemShape('cmmn:AlternativeCaseFileItem');
    create.start(event, shape, element);
  }


  if (isCaseFileItem(element)) {

    if(!element.businessObject.definitionRef.recovery){

      if(notHasAltertiveCaseFileItem(element)){

        assign(actions, {
            'append.alternative-case-file-item': {
                group: 'model',
                className: 'cmmn-icon-alternative-case-file-item',
                title: 'Append AlternativeCaseFileItem',
                action: {
                    click: appendAlternativeCaseFileItem,
                    dragstart: appendAlternativeCaseFileItem
                }
            }
        });

      }


      assign(actions, {
        'edit.criticality': {
          group: 'connect',
          className: 'cmmn-icon-criticality-add',
          title: 'Change Criticality',
          action: {
            click: function(event, element) {

              var position = assign(getReplaceMenuPosition(element), {
                cursor: { x: event.x, y: event.y }
              });

              popupMenu.open(element, 'cmmn-criticality', position);
            }
          }
        }
      });
    }

  }


  if(element.type == 'cmmn:PlanItem'){
    if (element.businessObject.definitionRef.$type === 'cmmn:Milestone') {

      if(notHasAltertiveMilestone(element)){

        assign(actions, {
          'append.alternative-milestone': {
              group: 'model',
              className: 'cmmn-icon-alternative-milestone',
              title: 'Append AlternativeMilestone',
              action: {
                  click: appendAlternativeMilestone,
                  dragstart: appendAlternativeMilestone
              }
          }
        });

      }

      assign(actions, {
        'edit.criticitality': {
          group: 'edit',
          className: 'cmmn-icon-criticality-add',
          title: 'Change Criticality',
          action: {
            click: function(event, element) {

              var position = assign(getReplaceMenuPosition(element), {
                cursor: { x: event.x, y: event.y }
              });

              popupMenu.open(element, 'cmmn-criticality', position);
            }
          }
        }
      });
    }
  }


  if(isAlternativeCaseFileItem(element)){

    if(notHasAltertiveCaseFileItem(element) && hasLabelDefined(element)){
      assign(actions, {
          'append.alternative-case-file-item': {
              group: 'model',
              className: 'cmmn-icon-alternative-case-file-item',
              title: 'Append AlternativeCaseFileItem',
              action: {
                  click: appendAlternativeCaseFileItem,
                  dragstart: appendAlternativeCaseFileItem
              }
          }
      });
    }

    assign(actions, {
      'edit.criticality': {
        group: 'connect',
        className: 'cmmn-icon-criticality-add',
        title: 'Change Criticality',
        action: {
          click: function(event, element) {

            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'cmmn-criticality', position);
          }
        }
      }
    });

  }

  if(isAlternativeMilestone(element)){

    if(notHasAltertiveMilestone(element) && hasLabelDefined(element)){

      assign(actions, {
        'append.alternative-milestone': {
            group: 'model',
            className: 'cmmn-icon-alternative-milestone',
            title: 'Append AlternativeMilestone',
            action: {
                click: appendAlternativeMilestone,
                dragstart: appendAlternativeMilestone
            }
        }
      });
    }

  }


  if(isRecoveryStage(element)){

    // Replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'cmmn-icon-screw-wrench',
        title: 'Change type',
        action: {
          click: function(event, element) {

            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'cmmn-replace-recovery-stage', position);
          }
        }
      }
    });
  }

//_-------------------------------------------------



  return actions;
};


function isBlockingHumanTask(element) {
  var definition = getDefinition(element);
  return is(definition, 'cmmn:HumanTask') && definition.isBlocking;
}

function notHasAltertiveCaseFileItem(element){
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

function hasLabelDefined(element){
  if(!element.businessObject.definitionRef.name) return false;
  if(element.businessObject.definitionRef.name == "") return false;
  return true;
}

function notHasAltertiveMilestone(element){
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
