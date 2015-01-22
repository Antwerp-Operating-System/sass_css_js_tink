  'use strict';
  angular.module('tink.format',[])
  .directive('tinkFormatInput', [function () {
    return {
      require: 'ngModel',
      priority:999,
      replace:true,
      template:'<div><div id="input" contenteditable="true">{{format}}</div></div>',
      link:function(scope,elem,attr){
      var format = '00/00.0000';
      scope.format = format;
      var prevValue;
      var typed = '';
      var notyped = format;

      if (elem.find("#input")[0].addEventListener) {
        elem.find("#input")[0].addEventListener("DOMCharacterDataModified", function(evt){
          if(evt.prevValue && evt.prevValue!== '{{format}}'){
            var add = 0;
            if(evt.prevValue.length === format.length){
              setTimeout(function(){
                handleInput(evt.newValue,evt.prevValue);
              }, 0);
            }
          }
        }, false);
      }

      var newVa =format;

      String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
      }

      function handleInput(key){
        var cursor = getCaretCharacterOffsetWithin();
        if(cursor > -1 && cursor < format.length+1){
           if(format[cursor]==='0'){
             if(charIs(key,'0')){
               newVa = newVa.replaceAt(cursor,key);
               cursor +=1;
             }else{
               //wrong enterd
             }
           }else{
             if(charIs(key,'0')){
               newVa = newVa.replaceAt(cursor+1,key);
               cursor +=2;
             }else{
               cursor +=1;
             }
           }
         }
         setValue(cursor);
       }


      var setValue = function(cur){
        elem.find("#input").html(newVa);

        if(cur >= format.length){
          cur = 0;
        }
        if(cur > -1){
          setCursor(cur);
        }
      }

      var charIs = function(char,base){
        char = char.trim();
        if(base === '0' && char !== ""){
          if(char > -1 && char < 10){
            return true
          }
        }
        return false;
      }


      function getCaretCharacterOffsetWithin() {
        var caretOffset = 0;
        var element = elem.get(0);
        element.focus();
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

      function setCursor(cur) {
        var el = elem.find('#input')[0];
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0],cur);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }

      elem.find("#input").keypress(function(event){console.log('go')
        var key = String.fromCharCode(event.which);
        setTimeout(function(){
          handleInput(key);
        }, 1);

        return false;
      })



      }
    }
  }]);