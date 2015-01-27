'use strict';
angular.module('tink.timepicker', []);
angular.module('tink.timepicker')
.directive('tinkTimepicker',['$window',function($window){
  return{
    restrict:'AE',
    //template:'<div style="background:white;"><span style="float:left;">--</span><div style="float:left;">:</div><span>--</span></div>',
    template:'<div class="timepicker"><input type="text" ng-model="ngModel" /><span class="timepicker-later" role="spinbutton"></span><span class="timepicker-earlier" role="spinbutton"></span></div>',
    require:'ngModel',
    replace:true,
    scope:{
      ngModel:'&'
    },
    link:function(scope,elem,attr,ngModel){
      var current = {hour:{num:0,reset:true,prev:-1,start:true},min:{num:0,reset:true,start:true}};
      var inputField = elem.find('input');
      // Needs to be fixed
      // elem = elem.find('input');

      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent) ;
      function isDateSupported() {
        var i = document.createElement('input');
        i.setAttribute('type', 'date');
        return i.type !== 'text';
      }
      if(isNative && isDateSupported()){
        inputField.prop('type', 'time');
      }

      // var dateToTime = function(date){
      //   if(angular.isDate(date)){
      //     var hour = date.getHours();
      //     var minute = date.getMinutes();
      //     if(hour && minute){
      //       return hour+':'+minute;
      //     }else{
      //       return '--:--';
      //     }
      //   }else{
      //     return '--;--';
      //   }
      // };

      elem.bind('mousedown',function(){
        return false;
      });

      elem.find('.timepicker-later').bind('click',function(){
        if(selected === 1){
          addHour(1);
        }else if(selected === 2){
          addMinute(1);
        }
        return false;
      });

      var bindEvent = function(){
        inputField.unbind('input').unbind('keydown').unbind('change').unbind('click').unbind('mousedown');
        inputField.keydown(function(e){
          var keycode = e.keyCode;
          if((keycode > 47 && keycode <58) || (keycode >95 && keycode <106)){
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
          if(keycode !== 9){
            return false;
          }
        });
      };

      elem.find('.timepicker-earlier').bind('click',function(){
        if(selected === 1){
          addHour(-1);
        }else if(selected === 2){
          addMinute(-1);
        }
        return false;
      });

      if(isNative && isDateSupported()){
        inputField.val('00:00:00');
      }else{
        bindEvent();
      }

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
        scope.setHour(num);
      };

      var selectHour = function(reset){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(0, 2);
        }
        selected = 1;
        current.hour.reset = reset;
        current.min.reset = false;
      };

      var selectMinute = function(reset){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(3, 5);
        }
        selected = 2;
        current.min.reset = reset;
        current.hour.reset = false;
      };

      scope.setHour = function(num){
        var select = 2;
        var firstNumber = parseInt(hourString()[0]);
        var lastNumber = parseInt(hourString()[1]);
        if(lastNumber<2){
          current.hour.num = (lastNumber*10)+num;
          if(current.hour.prev !== -1){
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
        }else{
          current.hour.num = num;
          select = 2;
        }
        current.hour.prev = num;
        setValue(select);
      };

      // var isMobile = function(){
      //   return isNative && isDateSupported();
      // };

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

      scope.setMinute = function(num){
        var lastNumber = parseInt(minString()[1]);
        if(isNaN(lastNumber) || lastNumber === 0 || lastNumber > 5){
          current.min.num = num;
        }else if(lastNumber<6){
          current.min.num = (lastNumber*10)+num;
        }

        setValue(2);
      };

      var setValue =  function(select){
        if(isNative && isDateSupported()){
          var timeStr = hourString()+':'+minString()+':00';
          timeStr.replace('-','0');
          ngModel.$setViewValue(timeStr);
        }else{
          ngModel.$setViewValue(hourString()+':'+minString());
        }

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
        scope.setMinute(num);
      };

      var selected = -1;

      var getHourOffset = function(){
        var padding = parseInt(inputField.css('padding-left'), 10);
        return padding+inputField.val().substr(0,2).width(inputField.css('font'),inputField.css('padding'))+2;
      };

      var getMinOffset = function(){
        return getHourOffset()+inputField.val().substr(3,2).width(inputField.css('font'),inputField.css('padding'))+2;
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

      inputField.bind('mousedown',function(evt){

        var offset  = pollyOffset(evt);
        if(offset < getHourOffset() || offset > getMinOffset()){
          selectHour(true);
          selected = 1;
        }else{
          selectMinute(true);
          selected = 2;
        }
        inputField.focus();

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

      var clearSelection = function(){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(0, 0);
        }
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
        current.hour.reset = true;
      };

      var reset = function(){
        current = {hour:{num:0,reset:true,prev:-1,start:true},min:{num:0,reset:true,start:true}};
        ngModel.$setValidity('time', false);
        setValue();
      };
      //reset();

      scope.$watch('ngModel',function(newVal){
        var date=null;
        var hour = null;
        var minute = null;
        if(typeof newVal === 'function'){
          date = newVal();
        }else {
          date = newVal;
        }

        if(angular.isDate(date)){
          hour = date.getHours();
          minute = date.getMinutes();
        }else if(typeof date === 'string'  && date.length >= 5){
          if(/^([01]\d|2[0-3]):?([0-5]\d)$/.test(date.substr(0,5))){
            hour = parseInt(date.substr(0,2));
            minute = parseInt(date.substr(3,2));
          }
        }else{
          reset();
        }
        if(hour && minute){
          current.hour.start = false;
          current.hour.num = hour;
          current.min.start =false;
          current.min.num = minute;
          setValue();
         }
      });

      ngModel.$formatters.unshift(function(modelValue) {

        var date = modelValue;
        console.log(date);
        if(angular.isDate(date)){
          var hour = date.getHours();
          var minute = date.getMinutes();
          if(hour && minute){
            current.hour.start =false;
            scope.setHour(hour);
            current.min.start =false;
            scope.setMinute(minute);
            clearSelection();
          }
        }else{
          reset();
        }
       });

      ngModel.$parsers.push(function(time) {
        inputField.val(time);
        var hour = parseInt(time.substr(0,2));
        var minute = parseInt(time.substr(3,2));
        if(hour && minute){
          var date = new Date();
          date.setHours(hour);
          date.setMinutes(minute);
          return date;
        }

      });

    }
  };
}]);


