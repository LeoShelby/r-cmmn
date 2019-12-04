var parseString = require('xml2js').parseString;

exports.checkLevel = function (xml) {

  var p = new Promise(function (resolve,reject){
    parseString(xml, function (err, xmlParsed) {
      
      var resLevel1 = checkLevel_1_2(xmlParsed, '1');
      if(!resLevel1.includes("100%")) resolve(resLevel1);
      
      var resLevel2 = checkLevel_1_2(xmlParsed, '2');
      if(!resLevel2.includes("100%")) resolve(resLevel1 + '\n\n' + resLevel2);

      var resLevel3 = checkLevel3(xmlParsed);
      if(!resLevel3.includes("100%")) resolve(resLevel1 + '\n\n' + resLevel2 + '\n\n' + resLevel3);
      
      var resLevel4 = checkLevel4(xmlParsed);
      resolve(resLevel1 + '\n\n' + resLevel2 + '\n\n' + resLevel3 + '\n\n' + resLevel4);

    });
  });

  var result = p.then(function(res){
    return res;
  });

  return result;
}


function checkLevel_1_2(xmlParsed, level){
  var definitions = xmlParsed['cmmn:definitions'];

  var cases = definitions['cmmn:case'] || [];
  var connections =  definitions['cmmn:connection'] || [];
  var caseFileItemDefinitions = definitions['cmmn:caseFileItemDefinition'] || [];

  var data = {"num":0, "den":0, "info":'',"noNamedCaseFileItems":0,"warning_chain": false, "warning_label": false};

  //for each 'cmmn:case' tag, inside we have:
  // - cmmn:CaseFileModel
  // - cmmn:CasePlanModel
  cases.forEach(function(cas) {
    var caseFileModel = cas['cmmn:caseFileModel'] || [] ;
    if(caseFileModel['0']){
      var caseFileItems = caseFileModel['0']['cmmn:caseFileItem'] || [];
      checkCaseFileItemConnections(level,caseFileItems,caseFileItemDefinitions,connections,data);
    }  
  });

  var result;

  num = data['num'];
  den = data['den'];
  if(level == '1'){
    info = '\tThe following CaseFileItems, having a non-null criticality, are not connected to any Task or EventListener:\n' + data['info'];
  }
  else{
    info = '\tThe following CaseFileItems, having a non-null criticality, are not associated to an Alternative CaseFileItem:\n' + data['info'];
  }
  noNamedCaseFileItems = data['noNamedCaseFileItems'];


  if(data["warning_label"]){
    warning = '\n\n\t<font color="orange">Warning:</font>\n\n';
    warning += '\tThere are connections from CaseFileItem to Task/EventListener not properly labeled with one of the allowed operations:\n\n'
    warning += '\t\t[read, create, update, delete, replace]\n';
  }


  if((num == 0 && den == 0) || num == den){
    result = '<strong>Level ' + level + ':</strong> <font color="green">100%</font>';
    if(data["warning_label"]) result += warning;
  }
  else{
    var percentage = (100*num/den).toFixed(2);
    if(noNamedCaseFileItems != 0){
      var element = 'CaseFileItem';
      if(noNamedCaseFileItems > 1) element += 's';
      info += '\n\t\t<strong>-</strong> ' + noNamedCaseFileItems + ' ' + element + ' without a defined name';
    } 
    result = '<strong>Level ' + level + ':</strong> '+ '<font color="red">' + percentage +'%</font>\n\n';
    result += '\t'+ "<font color='red'>What's missing?</font>\n\n" + info +'\n';
    if(data["warning_label"]) result += warning;
    result+="\n\n";
    if(level == '1') result += "<strong>Level 2:</strong> waiting for Level " + level + " completion\n\n";
    result += "<strong>Level 3:</strong> waiting for Level " + level + " completion\n\n";
    result += "<strong>Level 4:</strong> waiting for Level " + level + " completion\n\n";
  }

  return result;

}

function checkCaseFileItemConnections(level, caseFileItems, caseFileItemDefinitions, connections, data){
  caseFileItems.forEach(function (caseFileItem){
    var definitionRef = caseFileItem['$']['definitionRef'];

    caseFileItemDefinitions.forEach(function(caseFileItemDefinition){
      if(definitionRef == caseFileItemDefinition['$'].id){

        var criticality = parseFloat(caseFileItemDefinition['$'].criticalityValue);
        if(criticality > 0){

          var flag = false;
          var id = caseFileItem['$'].id;

          var target;
          if(level == '1') target = 'PlanItem';
          else target = 'AlternativeCaseFileItem';
          
          connections.forEach(function(connection){

            if(connection['$'].sourceRef == id){
              if(connection['$'].targetRef.split("_")[0] == target){
                flag = true;
                if(connection['$'].name){
                  if(!allowedLabel(connection['$'].name)){
                    data["warning_label"] = true;
                  }
                }
                return;
              }
            }

          });
          
          data['den'] += criticality;

          if(flag){
            data['num'] += criticality;
          }
          else{
            var name = caseFileItemDefinition['$'].name || '';
            if(name != '') data['info'] += '\n\t\t<strong>-</strong> ' + name+'\n';
            else data['noNamedCaseFileItems'] += 1;
          }
        }
      }
    });
  });   
}



function checkLevel3(xmlParsed){

  var definitions = xmlParsed['cmmn:definitions'];

  var cases = definitions['cmmn:case'] || [];

  var connections =  definitions['cmmn:connection'] || [];

  var data = {"num":0, "den":0, "info":'',"noNamedMilestones":0};

  cases.forEach(function(cas) {
    var casePlanModel = cas['cmmn:casePlanModel'] || [] ;
    var planItems = casePlanModel['0']['cmmn:planItem'] || [];
    var milestones = casePlanModel['0']['cmmn:milestone'] || [];

    var stages = casePlanModel['0']['cmmn:stage'] || [];
    var recoveryStages = casePlanModel['0']['cmmn:recoveryStage'] || [];

    var planFragments = casePlanModel['0']['cmmn:planFragment'] || [];

    checkMilestones(milestones,planItems,planFragments,connections, data);
    manageRecursiveStagesLevel3(stages, connections, data);
    manageRecursiveStagesLevel3(recoveryStages, connections, data);

  });
  
  var result;

  num = data['num'];
  den = data['den'];
  info = '\tThe following Milestones, having a non-null criticality, are not associated to an Alternative Milestone:\n' + data['info'];
  noNamedMilestones = data['noNamedMilestones'];

  if((num == 0 && den == 0) || num == den) result = '<strong>Level 3:</strong> <font color="green">100%</font>'
  else{
    var percentage = (100*num/den).toFixed(2);
    if(noNamedMilestones != 0){
      var element = 'Milestone';
      if(noNamedMilestones > 1) element += 's';
      info += '\n\t\t<strong>-</strong> ' + noNamedMilestones + ' ' + element + ' without a defined name';
    }
    result = '<strong>Level 3:</strong> '+ '<font color="red">' + percentage + '%</font>\n\n';
    result += '\t'+ "<font color='red'>What's missing?</font>\n\n" + info +'\n\n\n';
    result += "<strong>Level 4:</strong> waiting for Level 3 completition\n\n"
  }
  return result;

}


function checkMilestones(milestones,planItems,planFragments,connections, data){
  milestones.forEach(function (milestone){

    var criticality = parseFloat(milestone['$'].criticalityValue);

    if(criticality > 0){

      var flag = false;
      var id_planItem;

      var id_milestone = milestone['$'].id;
      
      planItems.forEach(function (planItem){
        if(planItem['$'].definitionRef == id_milestone){
          id_planItem = planItem['$'].id;
        }
      });

      //if you did not find the planItem tag of the milestone it means that must be inside a discretionary plan fragment
      if(!id_planItem){
        planFragments.forEach(function (planFragment){
          var discretionaryplanItems = planFragment['cmmn:planItem'] || [];

          discretionaryplanItems.forEach(function(discretionaryplanItem){
            if(discretionaryplanItem['$'].definitionRef == id_milestone){
              id_planItem = discretionaryplanItem['$'].id;
            }
          });
        });
        if(!id_planItem) return;
      }

      connections.forEach(function(connection){
        if(connection['$'].sourceRef == id_planItem){
          flag = true;
          return;
        }
      });

      data['den'] += criticality;

      if(flag){
        data['num'] += criticality;
      }
      else{
        var name = milestone['$'].name || '';
        if(name != '') data['info'] += '\n\t\t<strong>-</strong> ' + name;
        else data['noNamedMilestones'] += 1;
      }
      
    }
  });
}


function manageRecursiveStagesLevel3(stages, connections, data){

  stages.forEach(function (stage){
    
    var planItems = stage['cmmn:planItem'] || [];
    var milestones = stage['cmmn:milestone'] || [];

    var stagesRecursive = stage['cmmn:stage'] || [];
    var recoveryStagesRecursive = stage['cmmn:recoveryStage'] || [];

    var planFragments = stage['cmmn:planFragment'] || [];

    manageRecursiveStagesLevel3(stagesRecursive, connections, data);
    manageRecursiveStagesLevel3(recoveryStagesRecursive, connections, data);

    checkMilestones(milestones,planItems, planFragments,connections,data);
  });
}




function checkLevel4(xmlParsed){
  var definitions = xmlParsed['cmmn:definitions'];

  var cases = definitions['cmmn:case'] || [];
  var connections =  definitions['cmmn:connection'] || [];
  var alternativeCaseFileItemDefinitions = definitions['cmmn:alternativeCaseFileItemDefinition'] || [];

  var data = {"num":0, "den":0, "info":'',"noNamedAlternativeCaseFileItems":0};


  cases.forEach(function(cas) {
    var casePlanModel = cas['cmmn:casePlanModel'] || [] ;
    var planItems = casePlanModel['0']['cmmn:planItem'] || [];
    var sentries = casePlanModel['0']['cmmn:sentry'] || [];

    var stages = casePlanModel['0']['cmmn:stage'] || [];
    var recoveryStages = casePlanModel['0']['cmmn:recoveryStage'] || [];

    var planFragments = casePlanModel['0']['cmmn:planFragment'] || [];

    var caseFileModel = cas['cmmn:caseFileModel'] || [];
    if(caseFileModel['0']){
      var alternativeCaseFileItems = caseFileModel['0']['cmmn:alternativeCaseFileItem'] || [];
      checkAlternativeCaseFileItemConnections(alternativeCaseFileItems,alternativeCaseFileItemDefinitions, planItems, planFragments,
                                              sentries, connections,data,stages,recoveryStages);
    }  
  });

  var result;

  num = data['num'];
  den = data['den'];
  info = '\tThe following Alternative CaseFileItems, having a non-null criticality, are not associated to a RecoveryStage:\n' + data['info'];
  noNamedAlternativeCaseFileItems = data['noNamedAlternativeCaseFileItems'];

  if((num == 0 && den == 0) || num == den) result = '<strong>Level 4:</strong> <font color="green">100%</font>';
  else{
    var percentage = (100*num/den).toFixed(2);
    if(noNamedAlternativeCaseFileItems != 0){
      var element = 'AlternativeCaseFileItem';
      if(noNamedAlternativeCaseFileItems > 1) element += 's';
      info += '\n\t\t<strong>-</strong> ' + noNamedAlternativeCaseFileItems + ' ' + element + ' without a defined name';
    }
    result = '<strong>Level 4:</strong> '+ '<font color="red">' + percentage +'%</font>\n\n';
    result += '\t'+ "<font color='red'>What's missing?</font>\n\n" + info;
    result += '\n\n\t<font color="blue">How to:</font>\n\n\t\t<strong>-</strong> The AlternativeCaseFileItems above must be directly connected to an ErrorEventListener.\n'+
              '\t\t<strong>-</strong> Such ErrorEventListener must be connected to a RecoveryStage via an EntryCriterion.\n' +
              '\t\t<strong>-</strong> Such RecoveryStage must be connected to an (Alternative) Milestone via an ExitCriterion.\n\n';
  }
  return result;

}

function checkAlternativeCaseFileItemConnections(alternativeCaseFileItems,alternativeCaseFileItemDefinitions,planItems, planFragments,
                                                sentries,connections,data,stages,recoveryStages){

  alternativeCaseFileItems.forEach(function(alternativeCaseFileItem){
    var definitionRef = alternativeCaseFileItem['$']['definitionRef'];

    var flag = false;

    alternativeCaseFileItemDefinitions.forEach(function(alternativeCaseFileItemDefinition){
      if(definitionRef == alternativeCaseFileItemDefinition['$'].id){

        var id_file = alternativeCaseFileItem['$'].id;
        var criticality = parseFloat(alternativeCaseFileItemDefinition['$'].criticalityValue);
        if(criticality > 0){

          connections.forEach(function(connection){
            if(connection['$'].sourceRef == id_file){
              if(connection['$'].targetRef.split("_")[0] == 'PlanItem'){
                
                var id_plan_error_listener = connection['$'].targetRef;
                
                //now you have to check that the planItem is an ErrorEventLister
                //and that such error listener is connected to a recoverystage via entry criterion
                //and that such recovery stage is connect to an (alternative) Milestone via exit criterion
                flag = manageRecursiveStagesLevel4(id_plan_error_listener, planItems, planFragments,sentries,stages,recoveryStages);
              }
            }
          });
          // if criticality > 0
          data['den'] += criticality;

          if(flag){
            data['num'] += criticality;
          }
          else{
            var name = alternativeCaseFileItemDefinition['$'].name || '';
            if(name != '') data['info'] += '\n\t\t<strong>-</strong> ' + name;
            else data['noNamedAlternativeCaseFileItems'] += 1;
          }
        }
      }
    });
  });
}


function manageRecursiveStagesLevel4(id_plan_error_listener, planItems, planFragments,sentries,stages,recoveryStages){

  var flag = false;
  
  flag = flag || checkRecoveryStageConnection(id_plan_error_listener, planItems, planFragments, sentries);

  stages.forEach(function(stage){
    var planItemsRecursive = stage['cmmn:planItem'] || [];
    var stagesRecursive = stage['cmmn:stage'] || [];
    var recoveryStagesRecursive = stage['cmmn:recoveryStage'] || [];
    var sentriesRecursive = stage['cmmn:sentry'] || [];
    var planFragmentsRecursive = stage['cmmn:planFragment'] || [];
    flag = flag || manageRecursiveStagesLevel4(id_plan_error_listener,planItemsRecursive, planFragmentsRecursive, 
                                                sentriesRecursive,stagesRecursive,recoveryStagesRecursive);
  });

  recoveryStages.forEach(function(recoveryStage){
    var planItemsRecursive = recoveryStage['cmmn:planItem'] || [];
    var stagesRecursive = recoveryStage['cmmn:stage'] || [];
    var recoveryStagesRecursive = recoveryStage['cmmn:recoveryStage'] || [];
    var sentriesRecursive = recoveryStage['cmmn:sentry'] || [];
    var planFragmentsRecursive = recoveryStage['cmmn:planFragment'] || [];
    flag = flag || manageRecursiveStagesLevel4(id_plan_error_listener,planItemsRecursive,planFragmentsRecursive, 
                                                sentriesRecursive,stagesRecursive,recoveryStagesRecursive);
  });

  return flag;


}


function checkRecoveryStageConnection(id_plan_error_listener, planItems, planFragments, sentries){
  
  var flag = false;

  // you dont need to check that the id_plan_error_listener belongs to an ErroEventListener
  // we are sure about it beacuse of the rules defined

  planItems.forEach(function(plan){
    if(plan['$'].definitionRef.split("_")[0] == 'RecoveryStage'){
      var entryCriterion = plan['cmmn:entryCriterion'] || [];
      var exitCriterion =  plan['cmmn:exitCriterion'] || [];

      if(entryCriterion[0]){
        var entryRef = entryCriterion[0]['$'].sentryRef;

        sentries.forEach(function(entry){
          if(entry['$'].id == entryRef){
            var entryPlanItemOnPart = entry['cmmn:planItemOnPart'] || [];
            
            if(entryPlanItemOnPart[0]){
              if(entryPlanItemOnPart[0]['$'].sourceRef == id_plan_error_listener){
                // the error event listener is connected to a recovery stage via entry criterion
                // now you have to check that the recovery stage has an exit criterion connected to an (Alternative) Milestone
                // again we dont need to check if it is really a Milestone, we just need to check that there is 
                // an PlanItemOnPart connection
                
                if(exitCriterion[0]){
                  var exitRef = exitCriterion[0]['$'].sentryRef;

                  sentries.forEach(function(exit){
                    if(exit['$'].id == exitRef){
                      var exitPlanItemOnPart = exit['cmmn:planItemOnPart'] || [];
                      
                      if(exitPlanItemOnPart[0]){
                        flag = true;
                      }
                    }
                  });
                }
              }
            }
          }
        });
      }
    }
  });

  if(flag == false){
      return checkInsidePlanFragment(id_plan_error_listener, planFragments);
  }
  else{
    return true;
  }
}





function checkInsidePlanFragment(id_plan_error_listener, planFragments){

  var flag = false;

  planFragments.forEach(function(planFragment){
    var planItems = planFragment['cmmn:planItem'] || [];
    var sentries = planFragment['cmmn:sentry'] || [];

    planItems.forEach(function(plan){
      if(plan['$'].definitionRef.split("_")[0] == 'RecoveryStage'){
        var entryCriterion = plan['cmmn:entryCriterion'] || [];
        var exitCriterion =  plan['cmmn:exitCriterion'] || [];

        if(entryCriterion[0]){
          var entryRef = entryCriterion[0]['$'].sentryRef;

          sentries.forEach(function(entry){
            if(entry['$'].id == entryRef){
              var entryPlanItemOnPart = entry['cmmn:planItemOnPart'] || [];

              if(entryPlanItemOnPart[0]){
                if(entryPlanItemOnPart[0]['$'].sourceRef == id_plan_error_listener){

                  if(exitCriterion[0]){
                    var exitRef = exitCriterion[0]['$'].sentryRef;

                    sentries.forEach(function(exit){
                      if(exit['$'].id == exitRef){
                        var exitPlanItemOnPart = exit['cmmn:planItemOnPart'] || [];
                        
                        if(exitPlanItemOnPart[0]){
                          flag = true;
                        }
                      }
                    });
                  }
                }
              }
            }
          });
        }
      }
    });
  });

  return flag;
}


function allowedLabel(label){
  if(label != 'read' && label != 'create' && label != 'update' && label != 'delete' && label != 'replace' && label != 'predicate on'){
    return false;
  }
  return true;
}



/*
function checkRecoveryStageConnection(id_plan_error_listener, planItems, planFragments, sentries){
  var flag = false;
  planItems.forEach(function(planItem){
    if(planItem['$'].id == id_plan_error_listener){
      if(planItem['$'].definitionRef.split("_")[0] == 'ErrorEventListener'){
        // the alternative case file has a connection with an error event listener
        // now you have to check that the event listener is connected to a recovery stage via sentry

        planItems.forEach(function(plan){
          if(plan['$'].definitionRef.split("_")[0] == 'RecoveryStage'){
            var entryCriterions = plan['cmmn:entryCriterion'] || [];
            var exitCriterions =  plan['cmmn:exitCriterion'] || [];

            entryCriterions.forEach(function(entryCriterion){
              var entryRef = entryCriterion['$'].sentryRef;

              sentries.forEach(function(entry){
                if(entry['$'].id == entryRef){
                  var entryPlanItemOnParts = entry['cmmn:planItemOnPart'] || [];

                  entryPlanItemOnParts.forEach(function(entryPlanItemOnPart){
                    if(entryPlanItemOnPart['$'].sourceRef == id_plan_error_listener){
                      // the error event listener is connected to a recovery stage via entry criterion
                      // now you have to check that the recovery stage has an exit criterion connected to an (Alternative) Milestone

                      exitCriterions.forEach(function(exitCriterion){
                        var exitRef = exitCriterion['$'].sentryRef;
                        sentries.forEach(function(exit){
                          if(exit['$'].id == exitRef){
                            var exitPlanItemOnParts = exit['cmmn:planItemOnPart'] || [];
                            
                            exitPlanItemOnParts.forEach(function(exitPlanItemOnPart){
                              var sourceRef = exitPlanItemOnPart['$'].sourceRef;

                              planItems.forEach(function(p){
                                if(p["$"].id == sourceRef){
                                  var definitionRef = p["$"].definitionRef.split("_")[0];
                                  if(definitionRef == 'Milestone' || definitionRef == 'AlternativeMilestone'){
                                    flag = true;
                                  }
                                }
                              });
                            });
                          }
                        });
                      });
                    }
                  });
                }
              });
            });
          }
        });
      }
    }
  });

  if(flag == false){
    return checkInsidePlanFragment(id_plan_error_listener, planFragments);
  }
  else{
    return true;
  }

}


function checkInsidePlanFragment(id_plan_error_listener, planFragments){
  var flag = false;

  planFragments.forEach(function(planFragment){
    var planItems = planFragment['cmmn:planItem'] || [];
    var sentries = planFragment['cmmn:sentry'] || [];

    planItems.forEach(function(planItem){
      if(planItem['$'].id == id_plan_error_listener){
        if(planItem['$'].definitionRef.split("_")[0] == 'ErrorEventListener'){
          // the alternative case file has a connection with an error event listener
          // now you have to check that the event listener is connected to a recovery stage via sentry

          planItems.forEach(function(plan){
            if(plan['$'].definitionRef.split("_")[0] == 'RecoveryStage'){
              var entryCriterions = plan['cmmn:entryCriterion'] || [];
              var exitCriterions =  plan['cmmn:exitCriterion'] || [];

              entryCriterions.forEach(function(entryCriterion){
                var entryRef = entryCriterion['$'].sentryRef;

                sentries.forEach(function(entry){
                  if(entry['$'].id == entryRef){
                    var entryPlanItemOnParts = entry['cmmn:planItemOnPart'] || [];

                    entryPlanItemOnParts.forEach(function(entryPlanItemOnPart){
                      if(entryPlanItemOnPart['$'].sourceRef == id_plan_error_listener){
                        // the error event listener is connected to a recovery stage via entry criterion
                        // now you have to check that the recovery stage has an exit criterion connected to an (Alternative) Milestone

                        exitCriterions.forEach(function(exitCriterion){
                          var exitRef = exitCriterion['$'].sentryRef;
                          sentries.forEach(function(exit){
                            if(exit['$'].id == exitRef){
                              var exitPlanItemOnParts = exit['cmmn:planItemOnPart'] || [];
                              
                              exitPlanItemOnParts.forEach(function(exitPlanItemOnPart){
                                var sourceRef = exitPlanItemOnPart['$'].sourceRef;

                                planItems.forEach(function(p){
                                  if(p["$"].id == sourceRef){
                                    var definitionRef = p["$"].definitionRef.split("_")[0];
                                    if(definitionRef == 'Milestone' || definitionRef == 'AlternativeMilestone'){
                                      flag = true;
                                    }
                                  }
                                });
                              });
                            }
                          });
                        });
                      }
                    });
                  }
                });
              });
            }
          });
        }
      }
    });
      
  });

  return flag;
}
*/

