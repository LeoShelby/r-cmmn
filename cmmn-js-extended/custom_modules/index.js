import ContextPadProvider from './CustomContextPad';
import CustomCmmnRules from './CustomCmmnRules';
import CustomElementFactory from './CustomElementFactory';
import CustomCmmnFactory from './CustomCmmnFactory';
import CustomCmmnRenderer from './CustomCmmnRenderer';

import CustomLabelBehavior from './CustomLabelBehavior';

import CustomAssociationLabelManager from './CustomAssociationLabelManager';



import CustomReplaceCriticalityProvider from './CustomReplaceCriticalityProvider';
import CustomReplaceMenuRecoveryStage from './CustomReplaceMenuRecoveryStage';

import CustomPathMap from './CustomPathMap';

import CustomPaletteProvider from './CustomPaletteProvider';

import CustomLabelUtil from './CustomLabelUtil';
import CustomReplaceOptions from './CustomReplaceOptions';
import CustomCmmnRulesFunctions from './CustomCmmnRulesFunctions';

export default {
  __init__: [ 'contextPadProvider', 'customCmmnRules', 'customElementFactory', 'customCmmnFactory', 'customCmmnRenderer',
   'customLabelBehavior', 'customAssociationLabelManager', 'customReplaceCriticalityProvider', 'customPathMap','customPaletteProvider',
   'customReplaceMenuRecoveryStage'],

  contextPadProvider: [ 'type', ContextPadProvider ],

  customCmmnRules: [ 'type', CustomCmmnRules ],
  customElementFactory: [ 'type', CustomElementFactory ],
  customCmmnFactory: [ 'type', CustomCmmnFactory ],
  customCmmnRenderer: [ 'type', CustomCmmnRenderer ],
  customLabelBehavior: [ 'type', CustomLabelBehavior ],
  customAssociationLabelManager: [ 'type', CustomAssociationLabelManager ],

  customReplaceCriticalityProvider: [ 'type', CustomReplaceCriticalityProvider ],

  customPathMap: [ 'type', CustomPathMap ],

  customPaletteProvider: [ 'type', CustomPaletteProvider],

  customReplaceMenuRecoveryStage: ['type', CustomReplaceMenuRecoveryStage]
  

};