import CmmnModeler from '../lib/Modeler';
import customControlsModule from '../rcmmn_modules/custom_modules';
var extendedModdle = require('../rcmmn_modules/custom_moddle/extended.json');
var CustomButtons = require ('../rcmmn_modules/level_algorithm/CustomButtons');

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
