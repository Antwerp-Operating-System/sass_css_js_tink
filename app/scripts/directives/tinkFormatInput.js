  'use strict';
  angular.module('tink.format', [])
  .directive('tinkFormatInput', ['dateCalculator', '$window', 'safeApply', function(dateCalculator, $window, safeApply) {
    return {
      restrict: 'EA',
      replace: true,
      priority:99,
      controller:'tinkFormatController',
      scope:{
        minDate:'=?',
        maxDate:'=?'
      },
      require:['tinkFormatInput','ngModel','?^form'],
      template: function() {
        var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
        var isTouch = ('createTouch' in $window.document) && isNative;
        if (isTouch) {
          return '<div><input id="input" type="date"/><div>';
        } else {
          return '<div><div id="input" class="faux-input" contenteditable="true">{{placeholder}}</div></div>';
        }
      },
      compile: function(template) {
        template.prop('type', 'date');
        return {
          pre: function() {
          },
          post: function(scope, elem, attr, ctrl) {

            // -- check if we are using a touch device  --/
            var isDateSupported = function() {
              var i = document.createElement('input');
              i.setAttribute('type', 'date');
              return i.type !== 'text';
            };

            var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
            var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();
        //variable
        var config = {
          format: '00/00/0000',
          placeholder: 'dd/mm/jjjj'
        };
        var dateformat;
        if(isTouch){
          dateformat = 'yyyy-mm-dd';
        }else{
          dateformat = 'dd/mm/yyyy';
        }

        var element = elem.find('#input');
        var ngControl = ctrl[1];
        var controller = ctrl[0];
        var form = ctrl[2];

        var prefix = '';
        if(angular.isDefined(attr.validName)){
          setTimeout(function(){
            if(form){
            safeApply(scope,function(){
              prefix = attr.validName;
              form.$removeControl(ngControl);
              ngControl.$name = prefix+ngControl.$name;
              form.$addControl(ngControl);
            });
          }
          }, 1);
        }else{
          setTimeout(function(){
            safeApply(scope,function(){
              if(form){
                form.$addControl(ngControl);
              }
            });
          }, 1);
        }

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

        var isRequired = (function(){
          if(attr.require === 'true'){
            return true;
          }else{
            return false;
          }
        })();

        function checkValidity(value){
          var stringValue;
          if(angular.isDate(value)){
            stringValue = dateCalculator.format(value,dateformat);
          }else{
            stringValue = value;
          }


          safeApply(scope,function(){

            if(angular.isDate(scope.minDate)){
              if(dateCalculator.dateBeforeOther(value,scope.minDate)){
                ngControl.$setValidity('date-min',true);
              }else{
                ngControl.$setValidity('date-min',false);
              }

            }
            if(angular.isDate(scope.maxDate)){
              if(dateCalculator.dateBeforeOther(scope.maxDate,value)){
                ngControl.$setValidity('date-max',true);
              }else{
                ngControl.$setValidity('date-max',false);
              }
            }

            if(validFormat(stringValue,dateformat)){
              ngControl.$setValidity('date',true);
              if(isRequired){
                ngControl.$setValidity('date-required',true);
              }
            }else if(stringValue !== config.placeholder && stringValue !== null){
              ngControl.$setValidity('date',false);
              ngControl.$setValidity('date-min',true);
              ngControl.$setValidity('date-max',true);
              if(isRequired){
                ngControl.$setValidity('date-required',true);
              }
            }else{
              ngControl.$setValidity('date',true);
              ngControl.$setValidity('date-min',true);
              ngControl.$setValidity('date-max',true);
              if(isRequired){
                ngControl.$setValidity('date-required',false);
              }
            }

          });
        }

        controller.init(element,config,form,ngControl);
          //format text going to user (model to view)
          ngControl.$formatters.push(function(modelValue) {
            if(!isTouch || isTouch && modelValue !== ''){
              if(angular.isDate(modelValue)){
                var date = dateCalculator.format(modelValue,dateformat);
                controller.setValue(date,null,isTouch);
              }else{
                controller.setValue(null,null,isTouch);
              }
            }else{
               controller.setValue('',null,isTouch);
            }
            checkValidity(modelValue);
          });

          //format text from the user (view to model)
          ngControl.$parsers.unshift(function(value) {

              if(isTouch && value === ''){
                value = element.val();
              }

            if(value === null || value === ''){
              return value;
            }else if(typeof value === 'string'){
              controller.setValue(value,null,isTouch);
              return dateCalculator.getDate(value,dateformat);
            }else{
              return null;
            }
          });

          //on blur update the model.
          element.on('blur', function() {
            safeApply(scope,function(){
              var value;
              if(isTouch){
                value = element.val();
              }else{
                value = controller.getValue();
              }
              if(value === config.placeholder){
                checkValidity(value);
              }else{
                var date = dateCalculator.getDate(value,dateformat);
                if(date === null){
                  checkValidity(value);
                }else{
                  checkValidity(date);
                }
              }
              //var modelString = dateCalculator.format(ngControl.$modelValue,dateformat);
              //if(value !== modelString){
                ngControl.$setViewValue(value);
                ngControl.$render();
              //}
            });
          });
      }
    };

  }
};
}])
  .controller('tinkFormatController',function($scope){

    var self = this;
    var config;
    var format;
    var placeholder;
    var newVa;
    var deleteVal = -1;
    var controlKey = 0;
    self.init = function(element,config,form,ngControl){
      self.element = element;
      self.config = config;
      self.form = form;
      self.ngControl = ngControl;
      loadAll();
    };

    function loadAll(){
      config = self.config;
      format = config.format;
      placeholder = config.placeholder;
      $scope.placeholder = placeholder;
      newVa = placeholder;
      self.element.bind('keydown', function(event) {
        if(event.which ===91 || event.which === 92 || event.which === 93){
          controlKey = 1;
        }
        if((event.ctrlKey||event.metaKey) && event.which === 88){
          setValue(placeholder)
          return false;
        }
        if (event.which === 8) {
          handleBackspace();
          return false;
        } else if (event.which === 46) {
          handleDelete();
          return false;
        }
      });
      self.element.bind('keyup', function(event) {
        if(event.which ===91 || event.which === 92 || event.which === 93){
          controlKey = 0;
        }
      });
      self.element.bind('mousedown', function() {
        setTimeout(function() {
          if (placeholder === newVa) {
            setCursor(0);
          }
        }, 1);
      });

      self.element.keypress(function(event) {
        if(!controlKey){
          var key = String.fromCharCode(event.which);
          handleInput(key);
          return false;
        }
      });

      if(self.form){
        //setTimeout(function(){ self.form.$addControl(self.ngControl); }, 0);
      }

    }
    String.prototype.replaceAt = function(index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    };
    String.prototype.replaceRange = function(start, stop, value) {
      return this.substr(0, start) + value.substr(start, stop - start) + this.substr(stop);
    };

    function handleInput(key, cur) {
      var cursor;
      var selection;
      if (!cur) {
        cursor = getCaretSelection().start;
        selection = getCaretSelection().end;
      } else {
        cursor = cur.start;
        selection = cur.end;
      }

      if (cursor > -1 && cursor < format.length) {
        if (format[cursor] === '0') {
          if (charIs(key, '0')) {
            if (cursor !== selection) {
              newVa = newVa.replaceRange(cursor, selection, placeholder);
            }
            newVa = newVa.replaceAt(cursor, key);
            cursor += 1;
          } else {
            newVa = newVa.replaceRange(cursor, selection, placeholder);
          }
        } else {
          if (charIs(key, '0')) {
            handleInput(key, {
              start: cursor + 1,
              end: selection + 1
            });
            return;
          } else {
            cursor += 1;
          }
        }
      }
      deleteVal = -1;
      self.setValue(newVa,cursor);
    }

    function handleBackspace() {
      var cursor = getCaretSelection();
      if (cursor.start === cursor.end && cursor.start > 0) {
        newVa = newVa.replaceAt(cursor.start - 1, placeholder[cursor.start - 1]);
        self.setValue(newVa,cursor.start - 1);
      } else {
        newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
        self.setValue(newVa,cursor.start);
      }

    }

    function handleDelete() {
      var cursor = getCaretSelection();
      if (cursor.start === cursor.end) {
        var pos = cursor.start;
        while (placeholder[cursor.start] === newVa[cursor.start] && cursor.start < placeholder.length - 1) {
          cursor.start++;
        }
        newVa = newVa.replaceAt(cursor.start, placeholder[cursor.start]);
        self.setValue(newVa,pos);

      } else {
        newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
        self.setValue(newVa,cursor.start);
      }
    }

    function valueToHtml(value) {
      var html = '';                // weekDaysLabels.join('</th><th class="dow text-center">') + '</th>')
      var plHtml = '<span class="placeholder">';
      var plEHtml = '</span>';
      var open = 0;
      for (var i = 0; i < placeholder.length; i++) {
        if (placeholder[i] === value[i]) {
          if (open === 0) {
            html += plHtml + value[i];
            open = 1;
          } else if (open === 1) {
            html += value[i];
          }
        } else {
          if (open === 1) {
            html += plEHtml + value[i];
            open = 0;
          } else {
            html += value[i];
          }
        }
      }
      if (open === 1) {
        html += plEHtml;
      }
      return html;
  }

  self.setValue = function(value,cur,force) {

    if(!force){
      if(value && value.length !== placeholder.length){
        newVa = placeholder;
      }else if(!value){
        newVa = placeholder;
      }else{
        newVa = value;
      }
    }else{
      newVa = value;
    }

    if(self.element[0].nodeName === 'DIV'){
      self.element.html(valueToHtml(newVa));
    }else{
      self.element.val(newVa);
    }
    if (cur && cur > -1 && cur <= format.length) {
      setCursor(cur);
    }
  };

  self.getValue = function(){
    return newVa;
  };

  function charIs(char, base) {
    char = char.trim();
    if (base === '0' && char !== '') {
      if (char > -1 && char < 10) {
        return true;
      }
    }
    return false;
  }

  function getCaretSelection() {
    var caretOffset = 0;
    var element = self.element.get(0);
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
    } else if ((sel = doc.selection) && sel.type !== 'Control') {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint('EndToEnd', textRange);
      caretOffset = preCaretTextRange.text.length;
      startOffset = caretOffset - document.selection.createRange().text.length;

    }
    return {
      start: startOffset,
      end: caretOffset
    };
  }

function setCursor(cur) {
  var el = self.element[0];
  var range = document.createRange();
  var sel = window.getSelection();
  var lengths = 0;
  var chosenChild = 0;
  for (var i = 0; i < self.element[0].childNodes.length; i++) {
    var node = self.element[0].childNodes[i];
    if (node.nodeName === '#text') {
      lengths += node.length;
      chosenChild = node;
    } else {
      lengths += node.childNodes[0].length;
      chosenChild = node.childNodes[0];
    }
    if (cur <= lengths) {
      cur = cur - (lengths - chosenChild.length);
      i = 9999;
    }
  }
  range.setStart(chosenChild, cur);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

});