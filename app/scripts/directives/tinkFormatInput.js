  'use strict';
  angular.module('tink.format',[])
  .directive('tinkFormatInput', [function () {
    return {
      require: 'ngModel',
      priority:999,
      replace:true,
      template:'<div><div id="input" contenteditable="true">{{format}}</div></div>',
      link:function(scope,elem,attr){console.log("loaded")
      var format = '00/00.0000';
      scope.format = format;

      var prevValue;
      var typed = '';
      var notyped = format;

      if (elem.find("#input")[0].addEventListener) {
        elem.find("#input")[0].addEventListener("DOMCharacterDataModified", function(evt){
          if(evt.prevValue && evt.prevValue!== '{{format}}'){
            handleInput(evt.newValue,evt.prevValue);
          }
        }, false);
      }


      elem.bind('onchange',function(evt,changed){console.log("onchange")
        handleInput();
      })

      function handleInput(newv,oldv){
        var cursor = getCaretCharacterOffsetWithin();
        if(cursor !== 0){
          var key = newv.substr(cursor-1,1);
          var noc = notyped.substr(cursor);
          console.log(prevValue)
          if(prevValue !== '0' && prevValue !== undefined){
            if(key !== prevValue){
              typed = typed + prevValue+key;
              noc = noc.substr(1)
              console.log(noc)
              cursor = cursor +1;
            }else{
              typed = typed + key;
            }
          }else{
            typed = typed + key;
          }
          elem.find("#input").html(typed+noc)
          setCursor(cursor)
          prevValue = noc.substr(0,1);
        }

      }


      function getCaretCharacterOffsetWithin() {
        var caretOffset = 0;
        var element = elem.find('#input')[0];
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
      }

      function setCursor(cur){
        var mainDiv =elem.find('#input')
        var startNode = mainDiv[0].firstChild;
        var endNode = mainDiv[0].childNodes[0];

        var range = document.createRange();
        range.setStart(startNode, cur); // 6 is the offset of "world" within "Hello world"
        range.setEnd(endNode, cur); // 7 is the length of "this is"
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }


        /*elem.bind('onchange DOMCharacterDataModified',function(evt,changed){console.log("fo")
          var typed = '1';
          elem.find("#input").html(typed+notyped.substr(1))
          var mainDiv =elem.find('#input')
          console.log("mainDiv")
          var startNode = mainDiv[0].firstChild;
          var endNode = mainDiv[0].childNodes[0];

          var range = document.createRange();
          range.setStart(startNode, 5); // 6 is the offset of "world" within "Hello world"
          range.setEnd(endNode, 5); // 7 is the length of "this is"
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        })*/

         elem.bind('mousedown',function(evt){
           // elem.find("#input").trigger('focus');
           // return false;

         })

         elem.find("#input").bind('focus',function(){
          //console.log("d")
        })

      }
    }
  }]);