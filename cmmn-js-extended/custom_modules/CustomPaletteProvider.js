export default class CustomPalette {
    constructor(create, elementFactory, palette) {
      this.create = create;
      this.elementFactory = elementFactory;
  
      palette.registerProvider(this);
    }
  
    getPaletteEntries(element) {
      const {
        create,
        elementFactory
      } = this;
  
      
      function createRecoveryStage(event) {
        const shape = elementFactory.createPlanItemShape('cmmn:RecoveryStage');
        create.start(event, shape, element);
      }
  
      return {
        'create.recovery-stage': {
          group: 'activity',
          className: 'cmmn-icon-recovery-stage',
          title: 'Create Recovery Stage',
          action: {
            dragstart: createRecoveryStage,
            click: createRecoveryStage
          }
        },
      }
    }
  }
  
  CustomPalette.$inject = [
    'create',
    'elementFactory',
    'palette',
  ];