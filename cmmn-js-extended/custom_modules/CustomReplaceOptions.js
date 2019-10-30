var ReplaceOptions = require('../../lib/features/replace/ReplaceOptions');

delete ReplaceOptions['EVENT_LISTENER'];

ReplaceOptions.EVENT_LISTENER = [
    {
      label: 'Event Listener',
      actionName: 'replace-with-event-listener-plan-item',
      className: 'cmmn-icon-event-listener',
      target: {
        definitionType: 'cmmn:EventListener',
        type: 'cmmn:PlanItem'
      }
    },
    {
      label: 'Timer Event Listener',
      actionName: 'replace-with-timer-event-listener-plan-item',
      className: 'cmmn-icon-timer-event-listener',
      target: {
        definitionType: 'cmmn:TimerEventListener',
        type: 'cmmn:PlanItem'
      }
    },
    {
      label: 'User Event Listener',
      actionName: 'replace-with-user-event-listener-plan-item',
      className: 'cmmn-icon-user-event-listener',
      target: {
        definitionType: 'cmmn:UserEventListener',
        type: 'cmmn:PlanItem'
      }
    },
    {
      label: 'Error Event Listener',
      actionName: 'replace-with-error-event-listener-plan-item',
      className: 'cmmn-icon-error-event-listener',
      target: {
        definitionType: 'cmmn:ErrorEventListener',
        type: 'cmmn:PlanItem'
      }
    }
    
];


module.exports = ReplaceOptions;