'use strict';
angular.module('tink.rijkRegister', []);
angular.module('tink.rijkRegister')
  .directive('tinkRijkRegister',['$window','safeApply',function($window,safeApply){
   return {
    restrict:'AE',
    controller:'tinkFormatController',
    require:['tinkRijkRegister','ngModel','?^form'],
    template: function() {
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      if (isTouch) {
        return '<div><input class="hide-styling" type="number" step="0" pattern="[0-9]*"><div>';
      } else {
        return '<div><div id="input" class="faux-input" contenteditable="true">{{placeholder}}</div></div>';
      }
    },
    link:function(scope,elm,attr,ctrl){
      var controller = ctrl[0];
      var form = ctrl[2];
      var ngControl = ctrl[1];
      var element = elm.find('#input');
      //variable
      var config = {
        format: '00.00.00-000.00',
        placeholder: 'xx.xx.xx-xxx.xx'
      };

       ngControl.$parsers.unshift(function(value) {
        checkvalidty(value)
        return value;
       });

       ngControl.$formatters.push(function(modelValue) {

        if(modelValue.length === 11){
          modelValue = modelValue.substr(0,2) + '.' + modelValue.substr(2,2)+ '.' + modelValue.substr(4,2)+'-'+ modelValue.substr(6,3)+'-'+modelValue.substr(9,2);
        }

        if(validFormat(modelValue)){
          controller.setValue(modelValue,null);
        }else{
          modelValue = null;
          ngControl.$setViewValue(modelValue);
        }
        checkvalidty(modelValue)
        return modelValue;
       });

       element.unbind('input').unbind('keydown').unbind('change');
      //on blur update the model.
      element.on('blur', function() {
        safeApply(scope,function(){
          var value = controller.getValue();
          checkvalidty(value);
            if(IsRRNoValid(value)){
              ngControl.$setViewValue(value);
              ngControl.$render();
            }

        });
      });

       var isRequired = (function(){
          if(attr.required === 'true' || attr.required === '' || attr.required === 'required'){
            return true;
          }else{
            return false;
          }
        })();

        function validFormat(value){
          if(value.length === 11){
            return value.match(/[0-9]*/g);
          }else if(value.length === 15){
            return value.match(/[0-9][0-9].[0-9][0-9].[0-9][0-9]-[0-9][0-9][0-9].[0-9][0-9]/g);
          }else{
            return false;
          }
        }


       function IsRRNoValid(n) {
        if(!(typeof n === 'string')){
          return;
        }
          n = n.replace(/[^\d]*/g, '');
            // RR numbers need to be 11 chars long
            if (n.length != 11)
                return false;

            var checkDigit = n.substr(n.length - 2, 2);
            var modFunction = function(nr) { return 97 - (nr % 97); };
            var nrToCheck = parseInt(n.substr(0, 9));

            // first check without 2
            if (modFunction(nrToCheck) == checkDigit)
                return true;
            // then check with 2 appended for y2k+ births
            nrToCheck = parseInt('2' + n.substr(0, 9));
            return (modFunction(nrToCheck) == checkDigit);
        }

       function checkvalidty(value){

        ngControl.$setValidity('format',IsRRNoValid(value))
        if(value === config.placeholder || value === ''){
          ngControl.$setValidity('format',true);
        }

        if(isRequired){
          if(controller.getValue() === config.placeholder){
            ngControl.$setValidity('required',false);
            ngControl.$setValidity('format',true);
          }else{
            ngControl.$setValidity('required',true);
          }
        }
       }


      controller.init(element,config,form,ngControl);

    }
  };
}]);