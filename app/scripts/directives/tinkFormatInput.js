  'use strict';
  angular.module('tink.format',[])
  .directive('tinkFormatInput', ['dateCalculator','$window','safeApply',function (dateCalculator,$window,safeApply) {
    return {
      replace:true,
      require:['ngModel','^form'],
      template:'<div><div id="input" class="divinput" contenteditable="true">{{placeholder}}</div></div>',
      link:function(scope,elem,attr,ctrl){
      //var ctrl = elem.data('$ngModelController');
      ctrl[1].$addControl(ctrl[0]);
      var forms = ctrl[1];
      ctrl = ctrl[0];
      var format = '00/00/0000';
      var placeholder = 'dd/mm/jjjj';
      var dateFormat ='dd/mm/yyyy';
      scope.format = format;
      scope.placeholder = placeholder;
      var type = 'date';
      var newVa = placeholder;

      String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
      };
      String.prototype.replaceRange=function(start,stop, value) {
        return this.substr(0, start) + value.substr(start,stop-start) + this.substr(stop);
      };
      var ctrlForm;
      if(attr.ctrlModel){
        ctrlForm = forms[scope[attr.ctrlModel]];
      }else{
        ctrlForm = ctrl;
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

       function validValue(value){

        if(value){
          if(value.length !== format.length) {return false;}

        for(var i =0; i < format.length; i++){
          if(format[i] === '0' && !charIs(value[i],'0')){
            return false;
          }else if(format[i] !== '0' && format[i] !== value[i]){
            return false;
          }
        }
        return true;
      }else {
        return false;
      }
       }

       function handleBackspace(){
        var cursor = getCaretSelection();
        if(cursor.start === cursor.end && cursor.start > 0 ){
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

      var valueToHtml = function(value){
        var html = '';
        // weekDaysLabels.join('</th><th class="dow text-center">') + '</th>')
        var plHtml = '<span class="placeholder">';
        var plEHtml = '</span>';
        var open = 0;
        for(var i=0; i<placeholder.length;i++){
          if(placeholder[i] === value[i]){
            if(open ===0){
              html += plHtml + value[i];
              open = 1;
            }else if( open === 1){
              html += value[i];
            }
          }else{
            if(open === 1){
              html += plEHtml + value[i];
              open = 0;
            }else{
              html += value[i];
            }
          }
        }
        if(open === 1){
          html += plEHtml;
        }
        return html;
      };

      var setValue = function(cur){
        elem.find('#input').html(valueToHtml(newVa));

        if(cur > -1 && cur <= format.length){
           setCursor(cur);
        }
      };

      var charIs = function(char,base){
        char = char.trim();
        if(base === '0' && char !== ''){
          if(char > -1 && char < 10){
            return true;
          }
        }
        return false;
      };

     var getCaretSelection = function()
      {
         var caretOffset = 0;
        var element = elem.get(0);
        element.focus();
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        var startOffset;

        if (typeof win.getSelection !== 'undefined') {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
                startOffset = caretOffset - window.getSelection().toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type !== 'Control') {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            caretOffset = preCaretTextRange.text.length;
            startOffset = caretOffset - document.selection.createRange().text.length;

        }
        return  {start:startOffset,end:caretOffset};
      };

      function setCursor(cur) {
        var el = elem.find('#input')[0];
        var range = document.createRange();
        var sel = window.getSelection();
        var lengths = 0;
        var chosenChild = 0;
        for(var i = 0; i< elem.find('#input')[0].childNodes.length;i++){
          var node = elem.find('#input')[0].childNodes[i];
          if(node.nodeName === '#text'){
            lengths += node.length;
            chosenChild = node;
          }else{
            lengths += node.childNodes[0].length;
            chosenChild = node.childNodes[0];
          }
          if(cur <= lengths){
            cur = cur - (lengths - chosenChild.length);
            i=9999;
          }
        }
        range.setStart(chosenChild,cur);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }


      elem.find('#input').bind('keydown',function(event){
        if(event.which === 8){
          handleBackspace();
          return false;
        }else if(event.which === 46){
          handleDelete();
          return false;
        }
      });
      var firstclick = 0;
      elem.find('#input').bind('mousedown',function(){
        setTimeout(function(){
          if(placeholder === newVa && firstclick !== 1){
            setCursor(0);
            firstclick = 1;
          }
        }, 1);
      });

      elem.find('#input').keypress(function(event){
        var key = String.fromCharCode(event.which);
        setTimeout(function(){
          handleInput(key);
        }, 1);

        return false;
      });
//hnb314
      ctrl.$parsers.unshift(function(viewValue) {
        handleFormat(viewValue);
        return viewValue;
      });

      scope.$watch('ngModel',function(newVal,oldVal){
        if(newVal !== oldVal){
          handleFormat(newVal);
        }
      });

      elem.find('#input').on('blur', function() {
        var pre = '';
        if(attr.validName){
          pre = attr.validName;
        }
        safeApply(scope,function(){
          if(type === 'date' && validFormat(newVa,'dd/mm/yyyy')){
            ctrlForm.$setValidity(pre+'date', true);
            ctrl.$setViewValue(dateCalculator.getDate(newVa,'dd/mm/yyyy'));
          }else if(type === 'date' ){
            ctrlForm.$setValidity(pre+'date', false);
            ctrl.$setViewValue(null);
          }
        });
      });

      //has to change
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      function validFormat(date,format){
        var dateObject;
          if(angular.isDefined(date) && date !== null){

            if(typeof date === 'string'){
              if(date.length !== 10){ return false; }

              if(!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)){return false;}

              dateObject = dateCalculator.getDate(date, format);
            }else if(angular.isDate(date)){
              dateObject = date;
            }else if(typeof date === 'function'){
              return validFormat(date(),format);
            }else {
              return false;
            }

            return dateObject.toString()!=='Invalid Date';
          }
        }

      ctrl.$formatters.push(function(modelValue) {
         if(modelValue === null){
          newVa = placeholder;
          setValue();
         }
        handleFormat(modelValue);
      });

      var handleFormat = function(modelValue){

        if(typeof modelValue ==='function'){
          modelValue = modelValue();
        }
        if(type === 'date'){
        var pre = '';
        if(attr.validName){
          pre = attr.validName;
        }
          var date;
          if(angular.isDate(modelValue)){
            date = dateCalculator.formatDate(modelValue, dateFormat);
          }else{
            date = modelValue;
          }

          if(validValue(date) && validFormat(date,'dd/mm/yyyy')){
            newVa =  date;
             ctrlForm.$setValidity(pre+'date', true);
            setValue();
          }else{
             ctrlForm.$setValidity(pre+'date', false);
          }
        }
        return modelValue;
      };

      setValue(newVa);
      }
    };
  }])
  .controller('TinkFormatController', [function () {
  var self = this;

    this.groups = {};

    this.init = function(accordion,element,opts){
     self.$accordion = accordion;
     self.$options = opts;
     self.$accordion.init(element);
   };

  }]);