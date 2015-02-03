  'use strict';
  angular.module('tink.format', [])
  .directive('tinkFormatInput', ['dateCalculator', '$window', 'safeApply', function(dateCalculator, $window, safeApply) {
    return {
      restrict: 'EA',
      replace: true,
      controller:function($scope){
      // -- check if we are using a touch device  --/
       var isDateSupported = function() {
          var i = document.createElement('input');
          i.setAttribute('type', 'date');
          return i.type !== 'text';
        };

       var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
       var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();

        //variable
        var self = this;
        var config = {
          format: '00/00/0000',
          placeholder: 'dd/mm/jjjj'
        }
        var dateformat;
        if(isTouch){
          dateformat = 'yyyy-mm-dd'
        }else{
          dateformat = 'dd/mm/yyyy';
        }
        self.controller = null;
        //the init function to get the controller.
        this.init = function(controller,element) {
          self.controller = controller;
          self.element = element;
          loadFunction();
          return angular.copy(config);
        };

        function loadFunction(){
          //format text going to user (model to view)
          self.controller.$formatters.push(function(modelValue) {
            if(isTouch && modelValue !== ''){
              if(angular.isDate(modelValue)){
                var date = dateCalculator.format(modelValue,dateformat);
                $scope.setValue(date,null,isTouch);
              }else{
                $scope.setValue(null,null,isTouch);
              }
            }
          });

          //format text from the user (view to model)
          self.controller.$parsers.push(function(value) {
            if(value === null){
              return value;
            }else if(typeof value === 'string'){
              return dateCalculator.getDate(value,dateformat);
            }
          });

          //on blur update the model.
         self.element.on('blur', function() {
            safeApply($scope,function(){
              var value;
              if(isTouch){
                value = self.element.val();
              }else{
                value = $scope.getValue();
              }
              //var date = dateCalculator.getDate(value,'dd/mm/yyyy');
              var modelString = dateCalculator.format(self.controller.$modelValue,'dd/mm/yyyy');
              if(value !== modelString){
                self.controller.$setViewValue(value);
              }
            })
          });
        }
      },
      scope:{

      },
      require:['tinkFormatInput','^ngModel'],
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
          pre: function() {},
          post: function(scope, elem, attr, ctrl) {

























            var config = ctrl[0].init(ctrl[1],elem.find('#input'));
            var format = config.format;
            var placeholder = config.placeholder;
            scope.placeholder = placeholder;
            var newVa = placeholder;

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
              scope.setValue(newVa,cursor);
            }

            function handleBackspace() {
              var cursor = getCaretSelection();
              if (cursor.start === cursor.end && cursor.start > 0) {
                newVa = newVa.replaceAt(cursor.start - 1, placeholder[cursor.start - 1]);
                scope.setValue(newVa,cursor.start - 1);
              } else {
                newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
                scope.setValue(newVa,cursor.start);
              }

            }
            var deleteVal = -1;

            function handleDelete() {
              var cursor = getCaretSelection();
              if (cursor.start === cursor.end) {
                var pos = cursor.start;
                while (placeholder[cursor.start] === newVa[cursor.start] && cursor.start < placeholder.length - 1) {
                  cursor.start++;
                }
                newVa = newVa.replaceAt(cursor.start, placeholder[cursor.start]);
                scope.setValue(newVa,pos);

              } else {
                newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
                scope.setValue(newVa,cursor.start);
              }
            }

            var valueToHtml = function(value) {
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
};

scope.setValue = function(value,cur,force) {

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

  if(elem.find('#input')[0].nodeName === 'DIV'){
    elem.find('#input').html(valueToHtml(newVa));
  }else{
    elem.find('#input').val(newVa);
  }
  if (cur && cur > -1 && cur <= format.length) {
    setCursor(cur);
  }
};

scope.getValue = function(){
  return newVa;
}

var charIs = function(char, base) {
  char = char.trim();
  if (base === '0' && char !== '') {
    if (char > -1 && char < 10) {
      return true;
    }
  }
  return false;
};

var getCaretSelection = function() {
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
};

function setCursor(cur) {
  var el = elem.find('#input')[0];
  var range = document.createRange();
  var sel = window.getSelection();
  var lengths = 0;
  var chosenChild = 0;
  for (var i = 0; i < elem.find('#input')[0].childNodes.length; i++) {
    var node = elem.find('#input')[0].childNodes[i];
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

elem.find('#input').bind('keydown', function(event) {
  if (event.which === 8) {
    handleBackspace();
    return false;
  } else if (event.which === 46) {
    handleDelete();
    return false;
  }
});
elem.find('#input').bind('mousedown', function() {
  setTimeout(function() {
    if (placeholder === newVa) {
      setCursor(0);
    }
  }, 1);
});

elem.find('#input').keypress(function(event) {
  var key = String.fromCharCode(event.which);
  handleInput(key);
  return false;
});


}
};

}
};
}]);