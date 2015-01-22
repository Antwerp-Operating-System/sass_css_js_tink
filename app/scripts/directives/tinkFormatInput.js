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
        elem.find("#input")[0].addEventListener("DOMCharacterDataModified", function(evt){console.log(evt)
          if(evt.prevValue && evt.prevValue!== '{{format}}'){
            var add = 0;
            console.log(evt.timeStamp)
            if(evt.timeStamp ===0){
              add = 1;
            }
            handleInput(evt.newValue,evt.prevValue,add);
          }
        }, false);
      }


      elem.bind('onchange',function(evt,changed){
       // handleInput();
      })

      /*function handleInput(newv,oldv){
        var cursor = getCaretCharacterOffsetWithin();
        if(cursor !== 0){
          var key = newv.substr(cursor-1,1);
          var noc = notyped.substr(cursor);
          console.log(prevValue)

          if(prevValue !== '0' && prevValue !== undefined){
            if(key !== prevValue){
              if(key > -1){
                typed = typed + prevValue+key;
                noc = noc.substr(1)
                cursor = cursor +1;
              }else{
                typed = typed + prevValue;
              }
            }else{
              typed = typed + key;
            }
          }else{
            if(charIs)
            typed = typed + key;
          }
          elem.find("#input").html(typed+noc)
          setCursor(cursor)
          prevValue = noc.substr(0,1);
        }

      }

      function handleInput(newv,oldv){
        var cursor = getCaretCharacterOffsetWithin();
        if(cursor > 0 ){
          var hulp = (typed+notyped).substr(0,cursor-1);
          notyped = (typed+notyped).substr(cursor-1);
          typed = hulp;

          var key = newv.substr(cursor-1,1);
          notyped = notyped.substr(cursor);
          if(prevValue !== '0' && prevValue !== undefined){
            if(key !== prevValue){
              var hulp1 = typed+'/' + key;
              handleInput(hulp1+notyped,oldv)
            }
          }else{
            if(charIs(key,'0')){
              typed = typed + key;
              setValue(cursor);
            }else{
              typed = '';
              notyped = oldv;
              setValue(cursor-1);
            }
          }
           prevValue = notyped.substr(0,1);
        }
      }*/
      var newVa =format;

      String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
      }
      function handleInput(newv,oldv,add){
        elem.find("#input").focus();
        var cursor = getCaretCharacterOffsetWithin()-1+add;
        console.log(cursor,newv,oldv);
        if(cursor > -1 && cursor < format.length+1){
          var key = newv.substr(cursor,1);
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
        elem.find("#input").html(newVa);

        if(cursor >= format.length){
          cursor = 0;
        }
        if(cursor > -1){
          setCursor(cursor);
          setCursor(cursor);
          setCursor(cursor);
          setCursor(cursor);
          setCursor(cursor);
        }
      }

      var setValue = function(cur){
        elem.find("#input").html(typed+notyped);
        setCursor(cur);
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
        elem.find("#input").focus();
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
        console.log(caretOffset)
        return caretOffset;
      }


      // function setCursor(cur){
      //   var mainDiv =elem.find('#input')
      //   var startNode = mainDiv[0].firstChild;
      //   var endNode = mainDiv[0].childNodes[0];

      //   var range = document.createRange();
      //   range.setStart(startNode, cur); // 6 is the offset of "world" within "Hello world"
      //   range.setEnd(endNode, cur); // 7 is the length of "this is"
      //   var sel = window.getSelection();
      //   sel.removeAllRanges();
      //   sel.addRange(range);
      // }

      function setCursor(cur) {console.log(cur)
        var el = elem.find('#input')[0];
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0],cur);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }

document.body.onmouseup = getCaretCharacterOffsetWithin;

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
           if(typed === ''){console.log("s")
            setInterval(function () {
            //  setCursor(0)
            }, 1);
           }
         })

         elem.find("#input").bind('focus',function(){
          //console.log("d")
        })

      }
    }
  }]);