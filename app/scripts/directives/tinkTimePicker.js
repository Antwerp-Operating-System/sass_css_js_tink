'use strict';
angular.module('tink.timepicker', []);
angular.module('tink.timepicker')
.directive('tinkTimepicker',['$window',function($window){
  return{
    restrict:'AE',
    //template:'<div style="background:white;"><span style="float:left;">--</span><div style="float:left;">:</div><span>--</span></div>',
    template:'<input type="text" />',
    require:'ngModel',
    replace:true,
    link:function(scope,elem,attr,ngModel){
      var current = null;

      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent) ;
      function isDateSupported() {
          var i = document.createElement('input');
          i.setAttribute('type', 'date');
          return i.type !== 'text';
      }
      if(isNative && isDateSupported()){
        elem.prop('type', 'time');
      }

      ngModel.$formatters.push(function(time){
        if(time){
          return time.substr(0,5);
        }
      });

      if(isNative && isDateSupported()){
        elem.val('00:00:00');
        return;
      }

      // function SelectText(element) {
      //   var doc = document,
      //   text = element,
      //   range, selection;

      //   if (doc.body.createTextRange) {
      //     range = document.body.createTextRange();
      //     range.moveToElementText(text);
      //     range.select();
      //   } else if (window.getSelection) {
      //     selection = window.getSelection();
      //     range = document.createRange();
      //     range.selectNodeContents(text);
      //     selection.removeAllRanges();
      //     selection.addRange(range);
      //   }
      // }
      elem.unbind('input').unbind('keydown').unbind('change').unbind('click').unbind('mousedown');
      elem.keydown(function(e){
        var keycode = e.keyCode;console.log(keycode);
        var shift = e.shiftKey;
        if((shift && keycode > 47 && keycode <58) || (keycode >95 && keycode <106)){
          if(selected === 1){
            handleHour(keycode);
          }else{
            handleMinute(keycode);
          }
        }else if(keycode === 39 && selected === 1){
          selectMinute(true);
        }else if(keycode === 37 && selected === 2){
          selectHour(true);
        }else if(keycode === 38){
          if(selected === 1){
            addHour(1);
          }else if(selected === 2){
            addMinute(1);
          }
        }else if(keycode === 40){
          if(selected === 1){
            addHour(-1);
          }else if(selected === 2){
            addMinute(-1);
          }
        }
        return false;
      });

      var keycodeMapper = {};

      var mapKeycodes = function(){
        var hulp = 0;
        for(var i = 48; i<=57;i++){
          keycodeMapper[i] = hulp;
          hulp++;
        }

        hulp = 0;

        for(var j = 96; j<= 105;j++){
          keycodeMapper[j] = hulp;
          hulp++;
        }
      };
      mapKeycodes();

      var handleHour = function(key){
        var num = keycodeMapper[key];
        if(current.hour.reset){
          current.hour.num = 0;
          current.hour.prev = -1;
          current.hour.reset = !current.hour.reset;
        }
        current.hour.start =false;
        setHour(num);
      };

      var selectHour = function(reset){
        elem[0].setSelectionRange(0, 2);
        selected = 1;
        current.hour.reset = reset;
        current.min.reset = false;
      };

      var selectMinute = function(reset){
        elem[0].setSelectionRange(3, 5);
        selected = 2;
        current.min.reset = reset;
        current.hour.reset = false;
      };

      var setHour = function(num){
        var select;
        var firstNumber = parseInt(hourString()[1]);
        var lastNumber = parseInt(hourString()[1]);
        if(lastNumber<2){
          current.hour.num = (lastNumber*10)+num;
          if(current.hour.prev === 0){
            select = 2;
          }else if(firstNumber !== 0){
            select = 2;
          }else{
            select = 1;
          }
        }else if(lastNumber === 2){
          if(num < 4){
            current.hour.num = (lastNumber*10)+num;
          }else{
            current.hour.num = num;
          }
          select = 2;
        }
        current.hour.prev = num;
        setValue(select);
      };

      var hourString = function(){
        if(current.hour.start){
          return '--';
        }else{
          return ('0'+current.hour.num).slice(-2);
        }

      };

      var minString = function(){
        if(current.min.start){
          return '--';
        }else{
          return ('0'+current.min.num).slice(-2);
        }
      };

      var setMinute = function(num){
        var lastNumber = parseInt(minString()[1]);
        if(isNaN(lastNumber) || lastNumber === 0 || lastNumber > 5){
          current.min.num = num;
        }else if(lastNumber<6){
          current.min.num = (lastNumber*10)+num;
        }

        setValue(2);
      };

      var setValue =  function(select){
          ngModel.$setViewValue(hourString()+':'+minString());
          ngModel.$render();


        if(select === 1){
          selectHour();
        }else if(select === 2){
          selectMinute();
        }
        if(!current.hour.start && !current.min.start){
          ngModel.$setValidity('time', true);
        }else{
          ngModel.$setValidity('time', false);
        }
      };

      var handleMinute = function(key){
        var num = keycodeMapper[key];
        current.min.start =false;
        setMinute(num);
      };

      var selected = -1;

      var getHourOffset = function(){
        var padding = parseInt(elem.css('padding-left'), 10);
        return padding+elem.val().substr(0,2).width(elem.css('font'),elem.css('padding'))+2;
      };

      var getMinOffset = function(){
        return getHourOffset()+elem.val().substr(3,2).width(elem.css('font'),elem.css('padding'))+2;
      };

      var pollyOffset = function(e){
        var target = e.target || e.srcElement,
        style = target.currentStyle || window.getComputedStyle(target, null),
        borderLeftWidth = parseInt(style.borderLeftWidth, 10),
        // borderTopWidth = parseInt(style.borderTopWidth, 10),
        rect = target.getBoundingClientRect(),
        offsetX = e.clientX - borderLeftWidth - rect.left;
        return offsetX;
      };

      elem.bind('mousedown',function(evt){

        var offset  = pollyOffset(evt);
        if(offset < getHourOffset() || offset > getMinOffset()){
          selectHour(true);
          selected = 1;
        }else{
          selectMinute(true);
          selected = 2;
        }
        elem.focus();

        return false;
      });

      String.prototype.width = function(font,padding) {
        var f = font || '15px arial',
            p = padding || '',
            o = $('<div>' + this + '</div>')
                  .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f,'padding':p})
                  .appendTo($('body')),
            w = o.width();

        o.remove();

        return w;
      };

      // function getTextWidth(text, font,padding) {
      //     // re-use canvas object for better performance
      //     var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
      //     canvas.style.padding = padding;
      //     var context = canvas.getContext('2d');
      //     context.font = font;
      //     var metrics = context.measureText(text);
      //     return metrics.width;
      // }
      var addMinute = function(size){
        current.min.start =false;
        var newMin = current.min.num + size;
        if(newMin > 0 && newMin < 60){
          current.min.num = newMin;
        }else if(newMin >= 60 || newMin < 0){
          addHour(Math.floor(newMin/60));
          if(newMin % 60 < 0){
            current.min.num = 60 + (newMin % 60);
          }else{
            current.min.num = newMin % 60;
          }
        }else{
          current.min.num = 0;
        }
        setValue(2);
      };

      var addHour = function(size){
        current.hour.start =false;
        var newHour = current.hour.num + size;
        if(newHour > 0 && newHour < 24){
          current.hour.num = newHour;
        }else if(newHour < 0){
          current.hour.num = 24 + newHour;
        }else{
          current.hour.num = 0;
        }
        setValue(1);
      };

      var reset = function(){
        current = {hour:{num:0,reset:true,prev:-1,start:true},min:{num:0,reset:true,start:true}};
        ngModel.$setValidity('time', false);
        setValue();
      };
      reset();
    }
  };
}]);


