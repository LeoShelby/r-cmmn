'use strict';

var map = require('min-dash').map;
var pick = require('min-dash').pick;
var isAny = require('../../lib/features/modeling/util/ModelingUtil').isAny;



var inherits = require('inherits');
var assign = require('min-dash').assign;
var CmmnFactory = require('../../lib/features/modeling/CmmnFactory');


function CustomCmmnFactory(moddle) {
    CmmnFactory.call(this);


  this._model = moddle;
}

inherits(CustomCmmnFactory, CmmnFactory);

CustomCmmnFactory.$inject = [ 'moddle' ];

CustomCmmnFactory.prototype.createAlternativeCaseFileItem = function(attrs) {

    attrs = attrs || {};
  
    if (!attrs.definitionRef) {
  
      attrs = assign({
        definitionRef: this.create('cmmn:AlternativeCaseFileItemDefinition')
      }, attrs);

    }
  

    return this.create('cmmn:AlternativeCaseFileItem', attrs);
  
  };
  
module.exports = CustomCmmnFactory;
