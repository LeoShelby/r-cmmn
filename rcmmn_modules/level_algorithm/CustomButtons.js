var $ = require("jquery");
require('webpack-jquery-ui');
require('webpack-jquery-ui/css');

const prettifyXml = require('prettify-xml')
var fileSaver=  require('file-saver');

var LevelChecker = require('./LevelChecker');

exports.addLevelButton = function (modeler) {

  var levelButton =
    '<button id="levelButton" type="button ' +
       'title="Powered by bpmn.io" ' +
       'style="position: absolute;  bottom: 15px; left: 20px; z-index: 100; height: 50px;">' +
       'Check Level'+
    '</button>';

  $('#canvas').append(levelButton);
  $('#levelButton').button();

  $('#levelButton').click(function () {
    
    modeler.saveXML(function (options,done){
      var xml = prettifyXml(done);

      //delete first tag about xml definitions
      //xml = xml.substring(xml.indexOf('>')+1);
      
      //delete xml part about dimensions
      xml = xml.split('<cmmndi')[0];

      xml = xml + "</cmmn:definitions>";

      //console.log(xml);
      

      var p = new Promise(function (resolve,reject){
        var result =  LevelChecker.checkLevel(xml);
        resolve(result);
      })
      
      p.then(function(result){
        
        
        var levelDialog = '<div id="dialog" title="Resilience Level">'+ '\n' + result + '</div>';
        $('#canvas').append(levelDialog);
        $("#dialog").css("white-space","pre-wrap");
        $("#dialog").dialog({modal: true, width: 'auto', create: function(){$(this).css("minWidth", "250px");}});
        

        //console.log(result);
      });

    });

  });
}

exports.addSaveButton = function (modeler){

var saveButton =
  '<button id="saveButton" type="button ' +
     'title="" ' +
     'style="position: absolute; bottom: 15px; right: 100px; z-index: 100;">' +
     'Save Diagram'+
  '</button>';

  $('#canvas').append(saveButton);
  $('#saveButton').button();

  $('#saveButton').click(function() {
    modeler.saveXML(function (options,done){
      var content = (prettifyXml(done));
      // any kind of extension (.txt,.cpp,.cs,.bat)
      var filename = "diagram.cmmn";
      
      var blob = new Blob([content], {
        type: "XML;charset=utf-8"
      });
      
      fileSaver.saveAs(blob, filename);
    });
  });
}


exports.addLoadButton = function (modeler){


  var loadButton = '<label id="labelLoad" for="inputLoad" style="position: absolute; bottom: 15px; right: 250px; z-index: 100;">'+
                    'Load Diagram'+
                    '<input type="file" id="inputLoad" style="display:none"></label>';

  $('#canvas').append(loadButton);
  $('#labelLoad').button();

  $('#inputLoad').change(function(event){

    var file = event.target.files[0];

    if (!window.FileReader) {
      return window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10.');
    }

    // no file chosen
    if (!file) {
      return;
    }

    var reader = new FileReader();

    reader.onload = function(e) {
      var xml = e.target.result;
      modeler.importXML(xml, function(err) {
        if (err) {
          alert("\nWrong file extension:\n\n.cmmn needed");
          console.log(err);
        }
        else{
          modeler.get('canvas').zoom('fit-viewport');
        }
      });
    };
    reader.readAsText(file);
  });
}
