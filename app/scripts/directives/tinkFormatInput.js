  'use strict';
  angular.module('tink.format',[])
  .directive('tinkFormatInput', [function () {
    return {
      require: 'ngModel',
      priority:999,
      replace:true,
      template:'<div><div id="input" contenteditable="true">{{placeholder}}</div></div>',
      link:function(scope,elem,attr){
      var format = 'BE 0000 0000';
      var placeholder = 'BE xxxx xxxx';
      scope.format = format;
      scope.placeholder = placeholder;
      var prevValue;
      var typed = '';
      var notyped = placeholder;

      /*if (elem.find("#input")[0].addEventListener) {
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
      }*/

      var newVa = placeholder;

      String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
      }
      String.prototype.replaceRange=function(start,stop, value) {
        console.log(this.substr(0, start) + value.substr(start,stop-start) + this.substr(stop))
        return this.substr(0, start) + value.substr(start,stop-start) + this.substr(stop);
      }

      function handleInput(key,cur){
        var cursor;
        var selection;
        if(!cur){
          cursor = getCaretSelection().start;
          selection = getCaretSelection().end;
        }else{
          cursor = cur.start;
          selection = cur.end;
        }

        if(cursor > -1 && cursor < format.length){
           if(format[cursor]==='0'){
             if(charIs(key,'0')){
              if(cursor !== selection){
                newVa = newVa.replaceRange(cursor,selection,placeholder);
              }
               newVa = newVa.replaceAt(cursor,key);
               cursor +=1;
             }else{
               newVa = newVa.replaceRange(cursor,selection,placeholder);
             }
           }else{
             if(charIs(key,'0')){
                handleInput(key,{start:cursor+1,end:selection+1});
              return;
             }else{
               cursor +=1;
             }
           }
         }
         deleteVal = -1;
         setValue(cursor);
       }

       function handleBackspace(){
        var cursor = getCaretSelection();
        if(cursor.start === cursor.end){
          newVa = newVa.replaceAt(cursor.start-1,placeholder[cursor.start-1]);
          setValue(cursor.start-1);
        }else{
          newVa = newVa.replaceRange(cursor.start,cursor.end,placeholder);
          setValue(cursor.start);
        }

       }
       var deleteVal=-1;

       function handleDelete(){
        var cursor = getCaretSelection();
        if(cursor.start === cursor.end){
          var pos=cursor.start;
          while(placeholder[cursor.start]===newVa[cursor.start] && cursor.start < placeholder.length-1){
            cursor.start++;
          }
           newVa = newVa.replaceAt(cursor.start,placeholder[cursor.start]);
          setValue(pos);

        }else{
          newVa = newVa.replaceRange(cursor.start,cursor.end,placeholder);
          setValue(cursor.start);
        }
       }


      var setValue = function(cur){
        elem.find("#input").html(newVa);

        if(cur > -1 && cur <= format.length){
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

     var getCaretSelection = function()
      {
         var caretOffset = 0;
        var element = elem.get(0);
        element.focus();
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        var startOffset;

        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
                startOffset = caretOffset - window.getSelection().toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            console.log(preCaretTextRange.text)
            caretOffset = preCaretTextRange.text.length;
            startOffset = caretOffset - document.selection.createRange().text.length;

        }
        return  {start:startOffset,end:caretOffset};
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

      elem.find("#input").bind('keydown',function(event){
        if(event.which === 8){
          handleBackspace();
          return false;
        }else if(event.which === 46){
          handleDelete();
          return false;
        }
      })

      elem.find("#input").keypress(function(event){console.log('go')
        var key = String.fromCharCode(event.which);
        console.log(key)
        setTimeout(function(){
          handleInput(key);
        }, 1);

        return false;
      })



      }
    }
  }]);