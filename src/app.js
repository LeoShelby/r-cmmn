import CmmnModeler from '../lib/Modeler';
import customControlsModule from '../cmmn-js-extended/custom_modules';
var extendedModdle = require('../cmmn-js-extended/custom_moddle/extended.json');
var CustomButtons = require ('../cmmn-js-extended/level_algorithm/CustomButtons');

var modeler = new CmmnModeler({
  keyboard: { bindTo: document },
  additionalModules: [
    customControlsModule
  ],
  moddleExtensions: {
    cmmn: extendedModdle
  },
  container: '#canvas'
});
modeler.createDiagram( function(err){
  CustomButtons.addLevelButton(modeler);
  CustomButtons.addSaveButton(modeler);
  CustomButtons.addLoadButton(modeler);
});
